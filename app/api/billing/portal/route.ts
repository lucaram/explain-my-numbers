// src/app/api/billing/portal/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createHmac, timingSafeEqual } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const runtime = "nodejs";

function json(data: any, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

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

async function readSession(): Promise<{ email: string; stripeCustomerId: string; sid: string } | null> {
  const name = process.env.SESSION_COOKIE_NAME || "emn_session";
  const jar = await cookies();
  const c = jar.get(name)?.value;
  if (!c) return null;

  const secret = String(process.env.MAGIC_LINK_SECRET ?? "").trim();
  if (!secret) return null;

  return verifySignedSessionCookie(c, secret);
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

    // ✅ Read & verify signed session cookie
    const sess = await readSession();
    if (!sess) {
      return json(
        { ok: false, error: "You must verify your magic link first.", error_code: "NO_SESSION" },
        401
      );
    }

    // ✅ Rate limit (session-based)
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
