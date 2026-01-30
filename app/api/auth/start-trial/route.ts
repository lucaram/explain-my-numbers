// src/app/api/auth/start-trial/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHmac, randomBytes, createHash } from "crypto";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sendMagicLinkEmail } from "@/lib/email";
import { tAuthTrial } from "@/lib/i18n/authTrialErrors";

export const runtime = "nodejs";

const TRIAL_DAYS = 7;
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
 * ✅ Stripe Customer lookup (cross-device safe)
 * - If Redis is missing/stale, we search Stripe by email before creating a new customer.
 */
async function findCustomerByEmail(stripe: Stripe, email: string): Promise<Stripe.Customer | null> {
  try {
    const res = await stripe.customers.search({
      query: `email:"${email}"`,
      limit: 1,
    });
    return res.data[0] ?? null;
  } catch {
    return null;
  }
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
 * ✅ IMPORTANT:
 * In local dev, ALWAYS generate the link to http://localhost:3000
 * so cookies get set on localhost (not 127.0.0.1).
 */
function getCanonicalOriginForEmail(req: Request, appOrigins: string) {
  // Take the first configured origin (canonical)
  const firstOrigin =
    (appOrigins || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0] || "";

  // ✅ Local dev: explicitly force localhost
  if (firstOrigin.includes("localhost:3000")) {
    return "http://localhost:3000";
  }

  // ✅ Production / Preview: ALWAYS prefer configured canonical origin
  if (firstOrigin) {
    return firstOrigin.replace(/\/$/, "");
  }

  // Fallback (should rarely happen)
  const xfProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const xfHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = xfHost || req.headers.get("host")?.trim() || "";

  return `${xfProto}://${host}`.replace(/\/$/, "");
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

    // ✅ Determine language (query param wins, then Accept-Language)
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || req.headers.get("accept-language") || "en";

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
        { ok: false, error: tAuthTrial(lang, "INVALID_EMAIL"), error_code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const rlEmail = await applyRateLimit(emailRatelimit, `email:${hashEmailKey(rawEmail)}`);
    if (!rlEmail.ok) {
      const retry = rlEmail.retryAfterSec ?? 1800;
      return NextResponse.json(
        { ok: false, error: tAuthTrial(lang, "RATE_LIMITED_EMAIL"), error_code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(retry) } }
      );
    }

    // 1) Find or create Stripe Customer (Redis-first, Stripe-email-search fallback)
    let customerId = await redis.get<string>(customerKey(rawEmail));
    let customer: Stripe.Customer | null = null;

    // A) Try Redis -> retrieve customer
    if (customerId) {
      try {
        const got = (await stripe.customers.retrieve(customerId)) as Stripe.Customer | Stripe.DeletedCustomer;
        customer = (got as any)?.deleted ? null : (got as Stripe.Customer);
      } catch {
        customer = null;
      }
    }

    // B) If Redis miss/stale, search Stripe by email (cross-device safe)
    if (!customer) {
      customer = await findCustomerByEmail(stripe, rawEmail);

      // If found in Stripe, refresh Redis to the canonical customer id
      if (customer?.id) {
        await redis.set(customerKey(rawEmail), customer.id, { ex: 60 * 60 * 24 * 365 });
      }
    }

    // C) Still nothing? Create new customer
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

    // ✅ Decide intent:
    // - "trial" for first-time eligible users
    // - otherwise "login" (still send a magic link so user can continue on another device)
    const everSubscribed = await hasEverHadSubscription(stripe, customer.id);
    const usedTrial = hasUsedTrial(customer);

    const intent: "trial" | "login" = everSubscribed || usedTrial ? "login" : "trial";

    // 2) Create signed magic link token
    const nonce = base64url(randomBytes(16));
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + MAGIC_LINK_TTL_SECONDS;

    const token = signToken(
      {
        v: 1,
        typ: "magic_link",
        intent, // ✅ "trial" OR "login"
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
      mode: intent as any, // ✅ "trial" | "login"
      trialDays: TRIAL_DAYS,
      lang: lang,
    });

    return NextResponse.json({
      ok: true,
      mode: intent, // "trial" | "login"
      message: intent === "trial" ? "Magic link sent." : "Magic link sent. Use it to sign in on this device.",
      email: maskEmail(rawEmail),

      // helpful flags (safe to keep or remove)
      trialEligible: intent === "trial",
      hadSubscription: everSubscribed,
      trialAlreadyUsed: usedTrial,
    });
  } catch (e) {
    console.error("start-trial failed:", e);
    return NextResponse.json(
      { ok: false, error: "Could not start trial. Please try again.", error_code: "START_TRIAL_FAILED" },
      { status: 500 }
    );
  }
}
