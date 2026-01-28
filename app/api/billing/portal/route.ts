// src/app/api/billing/portal/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createHmac, timingSafeEqual } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const runtime = "nodejs";

const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session"; // legacy fallback
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

const SESSION_KEY_PREFIX = "emn:sess:";

function json(data: any, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

/** --------------------------
 * Legacy signed-cookie helpers (fallback only)
 * -------------------------- */

function base64urlToBuffer(s: string) {
  const pad = (4 - (s.length % 4 || 4)) % 4;
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function verifySignedSessionCookie(cookieValue: string, secret: string) {
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [bodyB64, sigB64] = parts;

  const expectedSigB64 = base64url(createHmac("sha256", secret).update(bodyB64).digest());

  const a = Buffer.from(sigB64);
  const b = Buffer.from(expectedSigB64);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const jsonStr = base64urlToBuffer(bodyB64).toString("utf8");
    const session = JSON.parse(jsonStr) as any;

    const email = String(session?.email ?? "").trim().toLowerCase();
    const stripeCustomerId = String(session?.stripeCustomerId ?? "").trim();
    const sid = String(session?.sid ?? "").trim();

    if (!email || !email.includes("@")) return null;
    if (!stripeCustomerId || !stripeCustomerId.startsWith("cus_")) return null;
    if (!sid) return null;

    return { email, stripeCustomerId, sid };
  } catch {
    return null;
  }
}

/** --------------------------
 * Redis session helpers (new)
 * -------------------------- */

type RedisSession = {
  v: 1;
  email: string;
  stripeCustomerId: string;
  iat: number;
  sid: string;
  trialEndsAt?: number | null;
  trialSubscriptionId?: string | null;
};

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

function isValidRedisSession(x: any): x is RedisSession {
  if (!x || typeof x !== "object") return false;
  if (x.v !== 1) return false;
  if (typeof x.email !== "string" || !x.email.includes("@")) return false;
  if (typeof x.stripeCustomerId !== "string" || !x.stripeCustomerId.startsWith("cus_")) return false;
  if (typeof x.sid !== "string" || x.sid.length < 10) return false;
  return true;
}

async function readSession(): Promise<{ email: string; stripeCustomerId: string; sid: string } | null> {
  const jar = await cookies();

  // ✅ NEW: emn_sid -> Redis session
  const sid = jar.get(SESSION_ID_COOKIE_NAME)?.value?.trim();
  if (sid) {
    const redis = Redis.fromEnv();
    const got = await redis.get(sessionKey(sid));
    if (isValidRedisSession(got)) {
      return { email: got.email, stripeCustomerId: got.stripeCustomerId, sid: got.sid };
    }
  }

  // ✅ FALLBACK: old signed cookie (temporary migration support)
  const legacy = jar.get(SESSION_COOKIE_NAME)?.value;
  if (legacy) {
    const secret = String(process.env.MAGIC_LINK_SECRET ?? "").trim();
    if (!secret) return null;
    return verifySignedSessionCookie(legacy, secret);
  }

  return null;
}

async function applyRateLimit(ratelimit: Ratelimit, identifier: string) {
  const res = await ratelimit.limit(identifier);
  if (res.success) return { ok: true as const };

  const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false as const, retryAfterSec };
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    // ✅ Read session (Redis-first)
    const sess = await readSession();
    if (!sess) {
      return json({ ok: false, error: "You must verify your magic link first.", error_code: "NO_SESSION" }, 401);
    }

    // ✅ Rate limit (sid-based)
    const redis = Redis.fromEnv();
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      analytics: false,
      prefix: "emn:billing:portal:rl",
    });

    const limiter = await applyRateLimit(rl, `sid:${sess.sid}`);
    if (!limiter.ok) {
      const retry = limiter.retryAfterSec ?? 600;
      return json(
        { ok: false, error: "Too many requests. Please try again soon.", error_code: "RATE_LIMITED" },
        429,
        { "Retry-After": String(retry) }
      );
    }

    // ✅ Where Stripe returns the user after portal
    const origin = new URL(req.url).origin.replace(/\/+$/, "");
    const returnUrl =
      process.env.STRIPE_PORTAL_RETURN_URL?.trim() ||
      process.env.STRIPE_SUCCESS_URL?.trim() ||
      `${origin}/?portal=return`;

    // ✅ Create Stripe Customer Portal session
    const portal = await stripe.billingPortal.sessions.create({
      customer: sess.stripeCustomerId,
      return_url: returnUrl,
    });

    return json({ ok: true, url: portal.url });
  } catch (e: any) {
    console.error("[billing/portal]", e);
    return json({ ok: false, error: e?.message ?? "Server error.", error_code: "PORTAL_ERROR" }, 500);
  }
}
