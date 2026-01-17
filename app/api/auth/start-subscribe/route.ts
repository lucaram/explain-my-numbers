// src/app/api/auth/start-subscribe/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHmac, randomBytes, createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

const MAGIC_LINK_TTL_SECONDS = 15 * 60; // 15 minutes

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signToken(payload: object, secret: string) {
  const json = JSON.stringify(payload);
  const body = base64url(json);
  const sig = base64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  const user = u.length <= 2 ? `${u[0] ?? ""}*` : `${u.slice(0, 2)}***${u.slice(-1)}`;
  const dom = d ? d.replace(/(^.).*(\..+$)/, "$1***$2") : "***";
  return `${user}@${dom}`;
}

function customerKey(email: string) {
  return `emn:cus:email:${email}`;
}

/** --------------------------
 * Rate limiting helpers
 * -------------------------- */

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }

  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();

  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  // Fallback: stable per-client-ish bucket (avoid collapsing everyone into 127.0.0.1)
  const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
  const al = (req.headers.get("accept-language") ?? "").slice(0, 200);
  const key = createHash("sha256").update(`${ua}|${al}`).digest("hex").slice(0, 16);

  return `unknown:${key}`;
}

function hashEmailKey(email: string) {
  // non-reversible, stable, short key for Redis
  return createHash("sha256").update(email).digest("hex").slice(0, 24);
}

async function applyRateLimit(ratelimit: Ratelimit, identifier: string) {
  const res = await ratelimit.limit(identifier);
  if (res.success) return { ok: true as const };

  const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false as const, retryAfterSec };
}

export async function POST(req: Request) {
  try {
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const APP_ORIGINS = process.env.APP_ORIGINS;
    const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET;
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM;

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }
    if (!APP_ORIGINS) {
      return NextResponse.json({ ok: false, error: "Missing APP_ORIGINS." }, { status: 500 });
    }
    if (!MAGIC_LINK_SECRET) {
      return NextResponse.json({ ok: false, error: "Missing MAGIC_LINK_SECRET." }, { status: 500 });
    }
    if (!RESEND_API_KEY || !EMAIL_FROM) {
      return NextResponse.json({ ok: false, error: "Missing email configuration." }, { status: 500 });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const redis = Redis.fromEnv();

    // --------------------------
    // ✅ Rate limiting (anti-bot / anti-email-bombing)
    // --------------------------
    const ip = getClientIp(req);

    const ipRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"), // 10 requests / 10 minutes per IP
      analytics: false,
      prefix: "emn:auth:subscribe:ip",
    });

    const emailRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "30 m"), // 3 requests / 30 minutes per email
      analytics: false,
      prefix: "emn:auth:subscribe:email",
    });

    const rlIp = await applyRateLimit(ipRatelimit, `ip:${ip}`);
    if (!rlIp.ok) {
      const retry = rlIp.retryAfterSec ?? 600;
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again soon.", error_code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    const body = (await req.json().catch(() => null)) as { email?: string } | null;
    const rawEmail = (body?.email ?? "").trim().toLowerCase();

    if (!rawEmail || !isValidEmail(rawEmail)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address.", error_code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const rlEmail = await applyRateLimit(emailRatelimit, `email:${hashEmailKey(rawEmail)}`);
    if (!rlEmail.ok) {
      const retry = rlEmail.retryAfterSec ?? 1800;
      return NextResponse.json(
        {
          ok: false,
          error: "Too many requests for this email. Please try again later.",
          error_code: "RATE_LIMITED",
        },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    // 1) Find or create Stripe Customer
    let customerId = await redis.get<string>(customerKey(rawEmail));
    let customer: Stripe.Customer | null = null;

    if (customerId) {
      try {
        const got = (await stripe.customers.retrieve(customerId)) as Stripe.Customer | Stripe.DeletedCustomer;
        customer = (got as any)?.deleted ? null : (got as Stripe.Customer);
      } catch {
        customer = null;
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: rawEmail,
        metadata: {
          product: "explain_my_numbers",
          created_by: "start_subscribe",
        },
      });

      await redis.set(customerKey(rawEmail), customer.id, { ex: 60 * 60 * 24 * 365 });
    }

    // 2) Create magic link token (subscribe redirects to Stripe Checkout on click)
    const nonce = base64url(randomBytes(16));
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + MAGIC_LINK_TTL_SECONDS;

    const token = signToken(
      {
        v: 1,
        typ: "magic_link",
        intent: "subscribe",
        email: rawEmail,
        stripeCustomerId: customer.id,
        iat: nowSec,
        exp: expSec,
        nonce,
      },
      MAGIC_LINK_SECRET
    );

    const verifyUrl = `${APP_ORIGINS.split(",")[0].trim()}/api/auth/verify-magic-link?token=${encodeURIComponent(
      token
    )}`;

    await sendMagicLinkEmail({
      to: rawEmail,
      verifyUrl,
      mode: "subscribe",
    });

    return NextResponse.json({
      ok: true,
      message: "Magic link sent.",
      email: maskEmail(rawEmail),
    });
  } catch (e) {
    console.error("start-subscribe failed:", e);
    return NextResponse.json(
      { ok: false, error: "Could not start subscription. Please try again.", error_code: "START_SUBSCRIBE_FAILED" },
      { status: 500 }
    );
  }
}
