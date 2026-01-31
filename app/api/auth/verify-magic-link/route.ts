// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const runtime = "nodejs";

const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const TRIAL_DAYS = 7;
const MAGIC_NONCE_TTL_SECONDS = 15 * 60;
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

  const first = (fallbackOrigins || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];

  if (first) return first.replace(/\/$/, "");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (String(host).includes("localhost")) return "http://localhost:3000";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

function getRequestCountry(req: Request): string {
  const c1 = req.headers.get("x-vercel-ip-country");
  if (c1 && c1.trim()) return c1.trim().toUpperCase();

  const c2 = req.headers.get("cf-ipcountry");
  if (c2 && c2.trim()) return c2.trim().toUpperCase();

  return "US";
}

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
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

type MagicIntent = "trial" | "login" | "subscribe";

function normalizeIntent(x: any): MagicIntent {
  if (x === "trial" || x === "login" || x === "subscribe") return x;
  return "subscribe";
}

function createSessionId() {
  return base64url(randomBytes(24));
}

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

async function writeSession(redis: Redis, session: SessionPayload) {
  await redis.set(sessionKey(session.sid), session, { ex: SESSION_TTL_SECONDS });
}

function applyNoStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");
}

function redirectNoStore(url: string, init?: Parameters<typeof NextResponse.redirect>[1]) {
  const res = NextResponse.redirect(url, init as any);
  applyNoStore(res);
  return res;
}

async function getBestSubForCustomer(stripe: Stripe, customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  const nowSec = Math.floor(Date.now() / 1000);

  const active = subs.data.find((s) => s.status === "active");
  if (active) return active;

  const pastDue = subs.data.find((s) => {
    if (s.status !== "past_due") return false;
    const cpe = typeof (s as any)?.current_period_end === "number" ? (s as any).current_period_end : null;
    return typeof cpe === "number" && cpe > nowSec;
  });
  if (pastDue) return pastDue;

  const trialing = subs.data.find(
    (s) => s.status === "trialing" && typeof s.trial_end === "number" && s.trial_end > nowSec
  );
  if (trialing) return trialing;

  return null;
}

async function hasBlockingPaidSubscription(stripe: Stripe, customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });

  const nowSec = Math.floor(Date.now() / 1000);

  return subs.data.some((s) => {
    if (s.status === "active" || s.status === "unpaid") return true;

    if (s.status === "past_due") {
      const cpe = typeof (s as any)?.current_period_end === "number" ? (s as any).current_period_end : null;
      return typeof cpe === "number" && cpe > nowSec;
    }
    return false;
  });
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
    return redirectNoStore(`http://localhost:3000${url.pathname}${url.search}`);
  }

  const redis = Redis.fromEnv();
  const stripe = new Stripe(String(STRIPE_SECRET_KEY ?? "").trim());

  try {
    const token = url.searchParams.get("token") || "";
    const secret = String(MAGIC_LINK_SECRET ?? "").trim();
    if (!secret) return redirectNoStore(`${origin}/?magic=error&reason=missing_secret`);

    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"),
      prefix: "emn:auth:verify",
    });
    const rl = await ratelimit.limit(getClientIp(req));
    if (!rl.success) return redirectNoStore(`${origin}/?magic=error&reason=rate_limited`);

    const payload = verifySignedToken(token, secret);
    const nowSec = Math.floor(Date.now() / 1000);

    if (!payload || payload.exp < nowSec || payload.typ !== "magic_link") {
      return redirectNoStore(`${origin}/?magic=error&reason=invalid_token`);
    }

    const intent = normalizeIntent(payload.intent);

    const nonceKey = `emn:magic:nonce:${payload.nonce}`;
    const used = await redis.get(nonceKey);
    if (used) return redirectNoStore(`${origin}/?magic=error&reason=link_used`);
    await redis.set(nonceKey, "1", { ex: MAGIC_NONCE_TTL_SECONDS });

    const sid = createSessionId();

    const baseSession: SessionPayload = {
      v: 1,
      email: String(payload.email ?? "").trim().toLowerCase(),
      stripeCustomerId: String(payload.stripeCustomerId ?? "").trim(),
      iat: nowSec,
      sid,
    };

    if (!baseSession.email || !baseSession.email.includes("@") || !baseSession.stripeCustomerId.startsWith("cus_")) {
      return redirectNoStore(`${origin}/?magic=error&reason=invalid_payload`);
    }

    const country = getRequestCountry(req);
    const { priceId } = pickMonthlyPriceIdForCountry(country);

    /**
     * ✅ INTENT: LOGIN
     */
    if (intent === "login") {
      let session: SessionPayload = { ...baseSession };
      try {
        const best = await getBestSubForCustomer(stripe, baseSession.stripeCustomerId);
        if (best && best.status === "trialing" && typeof best.trial_end === "number") {
          session = { ...session, trialEndsAt: best.trial_end, trialSubscriptionId: best.id };
        }
      } catch {}

      const res = redirectNoStore(`${origin}/?magic=success&intent=login&sid_set=1`);
      await writeSession(redis, session);
      setSessionIdCookie(res, session.sid, isDev, session.trialEndsAt);
      return res;
    }

    /**
     * ✅ INTENT: TRIAL
     */
    if (intent === "trial") {
      const customer = (await stripe.customers.retrieve(baseSession.stripeCustomerId)) as Stripe.Customer;

      if ((customer as any)?.deleted) {
        return redirectNoStore(`${origin}/?magic=error&reason=no_customer`);
      }

      const md = (customer.metadata ?? {}) as Record<string, string | undefined>;
      const blockingPaid = await hasBlockingPaidSubscription(stripe, baseSession.stripeCustomerId);

      if (blockingPaid || md.emn_trial_used === "1") {
        const res = redirectNoStore(`${origin}/?magic=ok&intent=subscribe_required&sid_set=1`);
        await writeSession(redis, baseSession);
        setSessionIdCookie(res, baseSession.sid, isDev);
        return res;
      }

      const sub = await stripe.subscriptions.create(
        {
          customer: baseSession.stripeCustomerId,
          items: [{ price: priceId, quantity: 1 }],
          trial_period_days: TRIAL_DAYS,
          cancel_at_period_end: true,
          metadata: {
            product: "explain_my_numbers",
            created_by: "verify_magic_link_trial",
            email: baseSession.email,
          },
        },
        { idempotencyKey: `sub_${payload.nonce}` }
      );

      await stripe.customers.update(
        baseSession.stripeCustomerId,
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

      const res = redirectNoStore(`${origin}/?magic=success&intent=trial&sid_set=1`);
      await writeSession(redis, sessionWithTrial);
      setSessionIdCookie(res, sessionWithTrial.sid, isDev, sub.trial_end);
      return res;
    }

    /**
     * ✅ INTENT: SUBSCRIBE
     */
    const blockingPaid = await hasBlockingPaidSubscription(stripe, baseSession.stripeCustomerId);

    if (blockingPaid) {
      const portal = await stripe.billingPortal.sessions.create({
        customer: baseSession.stripeCustomerId,
        return_url: `${origin}/?portal=return`,
      });

      const res = redirectNoStore(portal.url, { status: 303 });
      await writeSession(redis, baseSession);
      setSessionIdCookie(res, baseSession.sid, isDev);
      return res;
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: baseSession.stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?subscribe=success`,
      cancel_url: `${origin}/?subscribe=cancel`,
      allow_promotion_codes: true,
      metadata: {
        product: "explain_my_numbers",
        created_by: "verify_magic_link_subscribe",
        email: baseSession.email,
      },
    });

    const res = redirectNoStore(checkout.url!, { status: 303 });
    await writeSession(redis, baseSession);
    setSessionIdCookie(res, baseSession.sid, isDev);
    return res;
  } catch (e) {
    console.error("VERIFY_ERROR:", e);
    return redirectNoStore(`${origin}/?magic=error&reason=server`);
  }
}

/** * ✅ UPDATED for Mobile Compatibility: 
 * Removed domain-scoping to ensure cookies work in restricted iOS/Android Webviews.
 */
function setSessionIdCookie(res: NextResponse, sid: string, devMode: boolean, trialEndsAt?: number | null) {
  const baseOptions = {
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };

  // Set new session ID
  res.cookies.set({
    ...baseOptions,
    name: SESSION_ID_COOKIE_NAME,
    value: sid,
  });

  // Clear legacy session
  res.cookies.set({
    ...baseOptions,
    name: SESSION_COOKIE_NAME,
    value: "",
    maxAge: 0,
  });

  // ✅ Always sync the trial chip cookie here to prevent UI flicker
  if (typeof trialEndsAt === "number") {
    res.cookies.set({
      ...baseOptions,
      name: "emn_trial_ends",
      value: String(trialEndsAt),
      httpOnly: false, // Frontend needs to read this
    });
  }
}