// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual, createHash } from "crypto";

export const runtime = "nodejs";

// Session cookie (httpOnly). Keep this simple for v1.
const SESSION_COOKIE_NAME = "emn_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function base64urlToBuffer(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// Helper: pick one origin string (supports comma-separated APP_ORIGINS)
function pickPrimaryOrigin(origins: string) {
  return origins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
}

function verifySignedToken(token: string, magicSecret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, sig] = parts;

  const expectedSig = base64url(
    createHmac("sha256", magicSecret).update(body).digest()
  );

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  const json = base64urlToBuffer(body).toString("utf8");
  try {
    return JSON.parse(json) as any;
  } catch {
    return null;
  }
}

function safeRedirect(appOrigin: string, pathWithQuery: string) {
  return NextResponse.redirect(`${appOrigin}${pathWithQuery}`);
}

export async function GET(req: Request) {
  // --- read env at request-time (prevents build-time crashes) ---
  const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "";
  const APP_ORIGINS = process.env.APP_ORIGINS || "";

  const origin = pickPrimaryOrigin(APP_ORIGINS);

  // If config is missing, return a safe fallback (don’t crash)
  if (!MAGIC_LINK_SECRET || !origin) {
    // Can't safely redirect without an origin; return JSON instead.
    return NextResponse.json(
      { ok: false, error: "Server misconfigured (missing MAGIC_LINK_SECRET or APP_ORIGINS)." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";

    if (!token) return safeRedirect(origin, "/?magic=error&reason=missing_token");

    const payload = verifySignedToken(token, MAGIC_LINK_SECRET);
    if (!payload) return safeRedirect(origin, "/?magic=error&reason=bad_signature");

    if (payload.typ !== "magic_link" || payload.v !== 1) {
      return safeRedirect(origin, "/?magic=error&reason=bad_payload");
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== "number" || nowSec > payload.exp) {
      return safeRedirect(origin, "/?magic=error&reason=expired");
    }

    if (typeof payload.email !== "string" || !payload.email.includes("@")) {
      return safeRedirect(origin, "/?magic=error&reason=bad_email");
    }

    if (
      typeof payload.stripeCustomerId !== "string" ||
      !payload.stripeCustomerId.startsWith("cus_")
    ) {
      return safeRedirect(origin, "/?magic=error&reason=bad_customer");
    }

    const session = {
      v: 1,
      email: payload.email,
      stripeCustomerId: payload.stripeCustomerId,
      trialSubscriptionId: payload.trialSubscriptionId ?? null,
      trialEndsAt: payload.trialEndsAt ?? null,
      iat: nowSec,
      sid: base64url(
        createHash("sha256")
          .update(`${payload.stripeCustomerId}:${payload.email}`)
          .digest()
      ).slice(0, 22),
    };

    const sessionB64 = base64url(JSON.stringify(session));
    const sessionSig = base64url(
      createHmac("sha256", MAGIC_LINK_SECRET).update(sessionB64).digest()
    );
    const cookieValue = `${sessionB64}.${sessionSig}`;

    const res = safeRedirect(origin, "/?magic=ok");

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return res;
  } catch {
    return safeRedirect(origin, "/?magic=error&reason=server");
  }
}
