// src/app/api/auth/start-trial/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHmac, randomBytes, createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

const TRIAL_DAYS = 3;
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

  const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
  const al = (req.headers.get("accept-language") ?? "").slice(0, 200);
  const key = createHash("sha256").update(`${ua}|${al}`).digest("hex").slice(0, 16);

  return `unknown:${key}`;
}

function hashEmailKey(email: string) {
  return createHash("sha256").update(email).digest("hex").slice(0, 24);
}

async function applyRateLimit(ratelimit: Ratelimit, identifier: string) {
  const res = await ratelimit.limit(identifier);
  if (res.success) return { ok: true as const };

  const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
  return { ok: false as const, retryAfterSec };
}

/**
 * ✅ Any subscription ever disqualifies from trial.
 */
async function hasEverHadSubscription(stripe: Stripe, customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });
  return subs.data.length > 0;
}

/**
 * ✅ Trial already used flag stored on Stripe customer metadata.
 */
function hasUsedTrial(customer: Stripe.Customer) {
  const md = (customer.metadata ?? {}) as Record<string, string | undefined>;
  return Boolean(md.emn_trial_used_at || md.emn_trial_used === "1");
}

/**
 * ✅ IMPORTANT (Gemini-style fix, but safe):
 * In local dev, ALWAYS generate the link to http://localhost:3000
 * so cookies get set on localhost (not 127.0.0.1).
 */
function getCanonicalOriginForEmail(req: Request, appOrigins: string) {
  const isDev =
    process.env.NODE_ENV !== "production" ||
    (appOrigins || "").includes("localhost:3000");

  if (isDev) {
    return "http://localhost:3000";
  }

  // Production: derive from headers (and normalize 127 -> localhost just in case)
  const xfProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const xfHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostRaw = xfHost || req.headers.get("host")?.trim() || "";
  const host = hostRaw.replace(/^127\.0\.0\.1(?=:\d+|$)/, "localhost");

  if (host) {
    const proto = xfProto || "https";
    return `${proto}://${host}`;
  }

  // fallback: first APP_ORIGINS entry
  return appOrigins.split(",").map((s) => s.trim()).filter(Boolean)[0] || "https://example.com";
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
    // ✅ Rate limiting
    // --------------------------
    const ip = getClientIp(req);

    const ipRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"),
      analytics: false,
      prefix: "emn:auth:trial:ip",
    });

    const emailRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "30 m"),
      analytics: false,
      prefix: "emn:auth:trial:email",
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
        { ok: false, error: "Too many requests for this email. Please try again later.", error_code: "RATE_LIMITED" },
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
          created_by: "start_trial",
        },
      });

      await redis.set(customerKey(rawEmail), customer.id, { ex: 60 * 60 * 24 * 365 });
    }

    // ✅ Trial eligibility
    const everSubscribed = await hasEverHadSubscription(stripe, customer.id);
    if (everSubscribed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Free trial is available only for first-time users. Please subscribe to continue.",
          error_code: "TRIAL_NOT_ELIGIBLE",
        },
        { status: 409 }
      );
    }

    if (hasUsedTrial(customer)) {
      return NextResponse.json(
        {
          ok: false,
          error: "You’ve already used your free trial. Please subscribe to continue.",
          error_code: "TRIAL_ALREADY_USED",
        },
        { status: 409 }
      );
    }

    // 2) Create signed magic link token
    const nonce = base64url(randomBytes(16));
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + MAGIC_LINK_TTL_SECONDS;

    const token = signToken(
      {
        v: 1,
        typ: "magic_link",
        intent: "trial",
        email: rawEmail,
        stripeCustomerId: customer.id,
        iat: nowSec,
        exp: expSec,
        nonce,
      },
      MAGIC_LINK_SECRET
    );

    // ✅ Canonical origin (fixes localhost vs 127 cookie mismatch)
    const origin = getCanonicalOriginForEmail(req, APP_ORIGINS);
    const verifyUrl = `${origin}/api/auth/verify-magic-link?token=${encodeURIComponent(token)}`;

    // 3) Email the link
    await sendMagicLinkEmail({
      to: rawEmail,
      verifyUrl,
      mode: "trial",
      trialDays: TRIAL_DAYS,
    });

    return NextResponse.json({
      ok: true,
      message: "Magic link sent.",
      email: maskEmail(rawEmail),
    });
  } catch (e) {
    console.error("start-trial failed:", e);
    return NextResponse.json(
      { ok: false, error: "Could not start trial. Please try again.", error_code: "START_TRIAL_FAILED" },
      { status: 500 }
    );
  }
}
