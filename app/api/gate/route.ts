// src/app/api/gate/route.ts
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, createHash } from "crypto";

export const runtime = "nodejs";

/** --------------------------
 * Error helpers
 * -------------------------- */

type ApiErrorCode =
  | "INVALID_JSON"
  | "RATE_LIMITED"
  | "FORBIDDEN_ORIGIN"
  | "CONFIG_ERROR"
  | "SERVER_ERROR";

function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
  headers?: Record<string, string>
) {
  return NextResponse.json({ ok: false, error: message, error_code: code }, { status, headers });
}

/** --------------------------
 * Same-site / anti-quota-theft guard (+ CORS)
 * -------------------------- */

/**
 * Configure:
 * - APP_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
 * It also auto-adds NEXT_PUBLIC_SITE_URL and VERCEL_URL if present.
 */
function normalizeOriginValue(v: string) {
  const s = String(v ?? "").trim();
  if (!s) return "";
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

function getAllowedOrigins(): Set<string> {
  const s = new Set<string>();

  const add = (v?: string) => {
    const vv0 = String(v ?? "").trim();
    if (!vv0) return;

    // If it's a hostname (vercel), make it https://
    const vv =
      vv0.startsWith("http://") || vv0.startsWith("https://") ? vv0 : `https://${vv0}`;

    const norm = normalizeOriginValue(vv);
    if (norm) s.add(norm);
  };

  const envList = String(process.env.APP_ORIGINS ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  for (const o of envList) add(o);

  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.VERCEL_URL);

  // If nothing configured, don't hard-block (prevents accidental self-lockout),
  // but you should set APP_ORIGINS before going hard on traffic.
  return s;
}

function enforceSameSite(req: Request) {
  const allowed = getAllowedOrigins();
  if (allowed.size === 0) return;

  const origin = normalizeOriginValue((req.headers.get("origin") ?? "").trim());
  const referer = (req.headers.get("referer") ?? "").trim();

  if (origin && !allowed.has(origin)) {
    throw Object.assign(new Error("Forbidden origin."), {
      code: "FORBIDDEN_ORIGIN" as ApiErrorCode,
      status: 403,
    });
  }

  if (!origin && referer) {
    const ok = Array.from(allowed).some((a) => referer.startsWith(a));
    if (!ok) {
      throw Object.assign(new Error("Forbidden referer."), {
        code: "FORBIDDEN_ORIGIN" as ApiErrorCode,
        status: 403,
      });
    }
  }
}

/**
 * Minimal CORS:
 * - Only reflects allowed origins (from APP_ORIGINS).
 * - No credentials.
 * - Adds Vary: Origin for correct caching.
 */
function corsHeadersFor(req: Request): Record<string, string> {
  const allowed = getAllowedOrigins();
  if (allowed.size === 0) return {};

  const origin = normalizeOriginValue((req.headers.get("origin") ?? "").trim());
  if (!origin) return {};
  if (!allowed.has(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function withCors(req: Request, res: NextResponse) {
  const h = corsHeadersFor(req);
  for (const [k, v] of Object.entries(h)) res.headers.set(k, v);
  return res;
}

function jsonErrorReq(
  req: Request,
  code: ApiErrorCode,
  message: string,
  status: number,
  headers?: Record<string, string>
) {
  const res = jsonError(code, message, status, headers);
  return withCors(req, res);
}

export async function OPTIONS(req: Request) {
  try {
    enforceSameSite(req);
    const res = new NextResponse(null, { status: 204 });
    return withCors(req, res);
  } catch (err: any) {
    const isKnown = typeof err?.code === "string" && typeof err?.status === "number";
    if (isKnown) {
      return jsonErrorReq(req, err.code as ApiErrorCode, String(err.message ?? "Forbidden").slice(0, 500), err.status);
    }
    return jsonErrorReq(req, "SERVER_ERROR", "Server error. Please try again.", 500);
  }
}

/** --------------------------
 * Rate limiting
 * -------------------------- */

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();

  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();

  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  );
}

async function applyRateLimit(ratelimit: Ratelimit, identifier: string) {
  const res = await ratelimit.limit(identifier);
  if (res.success) return { ok: true as const };

  const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false as const, retryAfterSec };
}

/** --------------------------
 * Gate token minting (stateless HMAC)
 * -------------------------- */

function uaHashShort(req: Request) {
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
  const h = createHash("sha256").update(ua).digest("hex");
  return h.slice(0, 16); // short bind
}

/**
 * Token format (opaque string):
 *   v1.<window>.<hmacHex>
 *
 * window = 10-minute bucket number (integer)
 * hmac = HMAC_SHA256(GATE_SECRET, "v1|ip|uahash|window")
 *
 * You verify by recomputing expected (and optionally allow window-1).
 */
function mintGateToken(params: { ip: string; ua16: string; window: number; secret: string }) {
  const { ip, ua16, window, secret } = params;
  const payload = `v1|${ip}|${ua16}|${window}`;
  const sigHex = createHmac("sha256", secret).update(payload).digest("hex");
  return `v1.${window}.${sigHex}`;
}

/** --------------------------
 * POST /api/gate
 * -------------------------- */

export async function POST(req: Request) {
  // Config checks
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return jsonErrorReq(
      req,
      "CONFIG_ERROR",
      "Server is missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN configuration.",
      500
    );
  }

  const gateSecret = String(process.env.GATE_SECRET ?? "").trim();
  if (!gateSecret || gateSecret.length < 24) {
    return jsonErrorReq(
      req,
      "CONFIG_ERROR",
      "Server is missing GATE_SECRET (use a long random secret).",
      500
    );
  }

  // Same-site guard (prevents other sites minting tokens easily)
  try {
    enforceSameSite(req);
  } catch (err: any) {
    const isKnown = typeof err?.code === "string" && typeof err?.status === "number";
    if (isKnown) {
      return jsonErrorReq(req, err.code as ApiErrorCode, String(err.message ?? "Forbidden").slice(0, 500), err.status);
    }
    return jsonErrorReq(req, "SERVER_ERROR", "Server error. Please try again.", 500);
  }

  // Rate limit (stricter than /api/explain)
  const redis = Redis.fromEnv();
  const ratelimit = new Ratelimit({
    redis,
    // Example: 60 gate requests per minute per IP
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: false,
    prefix: "emn:gate:rl",
  });

  const ip = getClientIp(req);
  const identifier = `ip:${ip}`; // IP-only (UA rotation bypass)

  const rl = await applyRateLimit(ratelimit, identifier);
  if (!rl.ok) {
    const retry = rl.retryAfterSec ?? 60;
    return jsonErrorReq(req, "RATE_LIMITED", `Too many requests. Please retry in ~${retry}s.`, 429, {
      "Retry-After": String(retry),
    });
  }

  // Parse body (optional; we accept empty body)
  const ct = (req.headers.get("content-type") ?? "").toLowerCase();
  if (ct.includes("application/json")) {
    try {
      // We intentionally ignore contents; this endpoint just mints a token.
      await req.json().catch(() => null);
    } catch {
      return jsonErrorReq(req, "INVALID_JSON", "Invalid JSON body.", 400);
    }
  }

  // Mint token
  const ua16 = uaHashShort(req);
  const windowSec = 10 * 60;
  const window = Math.floor(Date.now() / 1000 / windowSec);

  const gateToken = mintGateToken({ ip, ua16, window, secret: gateSecret });

  // Response
  const res = NextResponse.json(
    {
      ok: true,
      gate_token: gateToken,
      expires_in_sec: windowSec, // client can just refresh occasionally
      meta: { v: 1, window },
    },
    { status: 200 }
  );

  // Defensive caching headers
  res.headers.set("Cache-Control", "no-store, max-age=0");

  return withCors(req, res);
}
