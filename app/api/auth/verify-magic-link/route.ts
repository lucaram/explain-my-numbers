// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, timingSafeEqual, createHash, randomBytes } from "crypto";

export const runtime = "nodejs";

// ✅ NEW: session cookie now stores only a session id (sid)
const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid";

// (kept: your old name env may still exist elsewhere; leave it for now)
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session";

const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const TRIAL_DAYS = 7;
const MAGIC_NONCE_TTL_SECONDS = 15 * 60;

// ✅ Redis session key prefix
const SESSION_KEY_PREFIX = "emn:sess:";

/** --------------------------
 * Helpers
 * -------------------------- */

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function verifySignedToken(token: string, magicSecret: string) {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expectedSig = base64url(createHmac("sha256", magicSecret).update(body).digest());

    // Important: timingSafeEqual requires equal length buffers
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;

    const pad = "=".repeat((4 - (body.length % 4 || 4)) % 4);
    const b64 = (body + pad).replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getCanonicalOrigin(req: Request, fallbackOrigins: string) {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) return "http://localhost:3000";

  // ✅ Prefer configured origin (canonical)
  const first = (fallbackOrigins || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];

  if (first) return first.replace(/\/$/, "");

  // Fallback to request host
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host.includes("localhost")) return "http://localhost:3000";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

/**
 * Country detection:
 * - Prefer Vercel geolocation header when deployed: x-vercel-ip-country
 * - Fallback to Cloudflare: cf-ipcountry
 * - Default to US (matches requirement: "any other country defaults to USD")
 */
function getRequestCountry(req: Request): string {
  const c1 = req.headers.get("x-vercel-ip-country");
  if (c1 && c1.trim()) return c1.trim().toUpperCase();

  const c2 = req.headers.get("cf-ipcountry");
  if (c2 && c2.trim()) return c2.trim().toUpperCase();

  return "US";
}

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

function pickMonthlyPriceIdForCountry(country: string) {
  if (country === "GB") {
    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_GBP;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_GBP.");
    return { priceId, currency: "gbp" as const };
  }

  if (EU_COUNTRIES.has(country)) {
    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_EURO;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_EURO.");
    return { priceId, currency: "eur" as const };
  }

  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_USD;
  if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_USD.");
  return { priceId, currency: "usd" as const };
}

type SessionPayload = {
  v: 1;
  email: string;
  stripeCustomerId: string;
  iat: number;
  sid: string;
  trialEndsAt?: number | null;
  trialSubscriptionId?: string | null;
};

// ✅ NEW: create a real random session id (don’t derive from nonce)
function createSessionId() {
  return base64url(randomBytes(24)); // ~32 chars url-safe
}

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

// ✅ NEW: store session payload in Redis (server-side)
async function writeSession(redis: Redis, session: SessionPayload) {
  await redis.set(sessionKey(session.sid), session, { ex: SESSION_TTL_SECONDS });
}

/** --------------------------
 * Main GET Route
 * -------------------------- */

export async function GET(req: Request) {
  const { MAGIC_LINK_SECRET, STRIPE_SECRET_KEY, APP_ORIGINS, NODE_ENV } = process.env;

  const origin = getCanonicalOrigin(req, APP_ORIGINS || "");
  const isDev = NODE_ENV === "development";
  const url = new URL(req.url);

  if (isDev && url.origin.includes("127.0.0.1")) {
    return NextResponse.redirect(`http://localhost:3000${url.pathname}${url.search}`);
  }

  const redis = Redis.fromEnv();
  const stripe = new Stripe(STRIPE_SECRET_KEY!);

  try {
    const token = url.searchParams.get("token") || "";

    // 1) Rate Limit
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"),
      prefix: "emn:auth:verify",
    });
    const rl = await ratelimit.limit(getClientIp(req));
    if (!rl.success) return NextResponse.redirect(`${origin}/?magic=error&reason=rate_limited`);

    // 2) Verify Token
    const payload = verifySignedToken(token, MAGIC_LINK_SECRET!);
    const nowSec = Math.floor(Date.now() / 1000);

    if (!payload || payload.exp < nowSec || payload.typ !== "magic_link") {
      return NextResponse.redirect(`${origin}/?magic=error&reason=invalid_token`);
    }

    // 3) Nonce (One-time use)
    const nonceKey = `emn:magic:nonce:${payload.nonce}`;
    const used = await redis.get(nonceKey);
    if (used) return NextResponse.redirect(`${origin}/?magic=error&reason=link_used`);
    await redis.set(nonceKey, "1", { ex: MAGIC_NONCE_TTL_SECONDS });

    // ✅ NEW: each device gets its own independent session id
    const sid = createSessionId();

    const baseSession: SessionPayload = {
      v: 1,
      email: payload.email,
      stripeCustomerId: payload.stripeCustomerId,
      iat: nowSec,
      sid,
    };

    // ✅ Determine pricing by country (GB=>GBP, EU=>EUR, else=>USD)
    const country = getRequestCountry(req);
    const { priceId, currency } = pickMonthlyPriceIdForCountry(country);

    // --- TRIAL Intent ---
    if (payload.intent === "trial") {
      const customer = (await stripe.customers.retrieve(payload.stripeCustomerId)) as Stripe.Customer;
      const md = (customer.metadata ?? {}) as Record<string, string | undefined>;
      const subs = await stripe.subscriptions.list({ customer: payload.stripeCustomerId, limit: 1 });

      if (subs.data.length > 0 || md.emn_trial_used === "1") {
        const res = NextResponse.redirect(`${origin}/?magic=ok&intent=subscribe_required`);

        // ✅ write session to Redis + set sid cookie
        await writeSession(redis, baseSession);
        setSessionIdCookie(res, baseSession.sid, isDev);

        return res;
      }

      // FIXED: Unique Idempotency Keys
      const sub = await stripe.subscriptions.create(
        {
          customer: payload.stripeCustomerId,
          items: [{ price: priceId, quantity: 1 }],
          trial_period_days: TRIAL_DAYS,
          cancel_at_period_end: true,
          metadata: {
            product: "explain_my_numbers",
            created_by: "verify_magic_link_trial",
            email: payload.email,
            pricing_country: country,
            pricing_currency: currency,
            pricing_price_id: priceId,
          },
        },
        { idempotencyKey: `sub_${payload.nonce}` }
      );

      await stripe.customers.update(
        payload.stripeCustomerId,
        {
          metadata: { ...md, emn_trial_used: "1", emn_trial_used_at: String(nowSec) },
        },
        { idempotencyKey: `cust_${payload.nonce}` }
      );

      const sessionWithTrial: SessionPayload = {
        ...baseSession,
        trialEndsAt: sub.trial_end,
        trialSubscriptionId: sub.id,
      };

      const res = NextResponse.redirect(`${origin}/?magic=success&intent=trial`);

      // ✅ write session to Redis + set sid cookie
      await writeSession(redis, sessionWithTrial);
      setSessionIdCookie(res, sessionWithTrial.sid, isDev);

      // Secondary cookie for frontend countdowns
      res.cookies.set({
        name: "emn_trial_ends",
        value: String(sub.trial_end),
        httpOnly: false,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });

      return res;
    }

    // --- SUBSCRIBE Intent ---
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: payload.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?subscribe=success`,
      cancel_url: `${origin}/?subscribe=cancel`,
      allow_promotion_codes: true,
      metadata: {
        product: "explain_my_numbers",
        created_by: "verify_magic_link_subscribe",
        email: payload.email,
        pricing_country: country,
        pricing_currency: currency,
        pricing_price_id: priceId,
      },
    });

    const res = NextResponse.redirect(checkout.url!, { status: 303 });

    // ✅ write session to Redis + set sid cookie
    await writeSession(redis, baseSession);
    setSessionIdCookie(res, baseSession.sid, isDev);

    return res;
  } catch (e) {
    console.error("VERIFY_ERROR:", e);
    return NextResponse.redirect(`${origin}/?magic=error&reason=server`);
  }
}

// ✅ NEW: only set emn_sid cookie now
function setSessionIdCookie(res: NextResponse, sid: string, devMode: boolean) {
  res.cookies.set({
    name: SESSION_ID_COOKIE_NAME,
    value: sid,
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  // ✅ Optional safety: clear the old cookie if it exists
  // (prevents confusion if some routes still look for emn_session temporarily)
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
