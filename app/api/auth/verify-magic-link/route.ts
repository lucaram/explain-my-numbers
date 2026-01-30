// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const runtime = "nodejs";

// ✅ New: session cookie now stores only a session id (sid)
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

    // timingSafeEqual requires equal-length buffers
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

/**
 * ✅ CRITICAL FIX:
 * If your app is reachable on BOTH:
 *   https://explainmynumbers.app  AND  https://www.explainmynumbers.app
 * then cookies set on one host are NOT visible on the other unless we set a shared cookie domain.
 *
 * This extracts the registrable domain from APP_ORIGINS and returns ".explainmynumbers.app"
 * so cookies work across apex + www.
 *
 * On localhost we return undefined (do not set cookie domain in dev).
 */
function getCookieDomainFromAppOrigins(appOrigins: string | undefined) {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) return undefined;

  const first =
    (appOrigins || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)[0] || "";

  try {
    const u = new URL(first);
    const host = u.hostname.toLowerCase();

    // If someone configured www.explainmynumbers.app or explainmynumbers.app,
    // we want ".explainmynumbers.app" so both work.
    if (host === "localhost" || host.endsWith(".localhost")) return undefined;

    const parts = host.split(".");
    if (parts.length < 2) return undefined;

    // For "www.explainmynumbers.app" => "explainmynumbers.app"
    // For "explainmynumbers.app" => "explainmynumbers.app"
    const base =
      host.startsWith("www.") ? host.slice(4) : host;

    return `.${base}`;
  } catch {
    return undefined;
  }
}

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return "unknown";
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

type MagicIntent = "trial" | "login" | "subscribe";

function normalizeIntent(x: any): MagicIntent {
  if (x === "trial" || x === "login" || x === "subscribe") return x;
  return "subscribe"; // back-compat default
}

// ✅ Create a real random session id (don’t derive from nonce)
function createSessionId() {
  return base64url(randomBytes(24)); // ~32 chars url-safe
}

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

// ✅ Store session payload in Redis (server-side)
async function writeSession(redis: Redis, session: SessionPayload) {
  await redis.set(sessionKey(session.sid), session, { ex: SESSION_TTL_SECONDS });
}

/**
 * ✅ Find “best” current subscription for this customer (for UI chips / quick state)
 */
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

  const unpaid = subs.data.find((s) => s.status === "unpaid");
  if (unpaid) return unpaid;

  return null;
}

/**
 * ✅ “Blocking” = should prevent creating another *paid* checkout session.
 */
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

    // ✅ trialing is NOT blocking here
    return false;
  });
}

/** --------------------------
 * Main GET Route
 * -------------------------- */

export async function GET(req: Request) {
  const { MAGIC_LINK_SECRET, STRIPE_SECRET_KEY, APP_ORIGINS, NODE_ENV } = process.env;

  const origin = getCanonicalOrigin(req, APP_ORIGINS || "");
  const cookieDomain = getCookieDomainFromAppOrigins(APP_ORIGINS);
  const isDev = NODE_ENV === "development";
  const url = new URL(req.url);

  // dev safety: avoid 127 cookie mismatch
  if (isDev && url.origin.includes("127.0.0.1")) {
    return NextResponse.redirect(`http://localhost:3000${url.pathname}${url.search}`);
  }

  const redis = Redis.fromEnv();
  const stripe = new Stripe(String(STRIPE_SECRET_KEY ?? "").trim());

  try {
    const token = url.searchParams.get("token") || "";
    const secret = String(MAGIC_LINK_SECRET ?? "").trim();
    if (!secret) return NextResponse.redirect(`${origin}/?magic=error&reason=missing_secret`);

    // 1) Rate Limit
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "5 m"),
      prefix: "emn:auth:verify",
    });
    const rl = await ratelimit.limit(getClientIp(req));
    if (!rl.success) return NextResponse.redirect(`${origin}/?magic=error&reason=rate_limited`);

    // 2) Verify Token
    const payload = verifySignedToken(token, secret);
    const nowSec = Math.floor(Date.now() / 1000);

    if (!payload || payload.exp < nowSec || payload.typ !== "magic_link") {
      return NextResponse.redirect(`${origin}/?magic=error&reason=invalid_token`);
    }

    const intent = normalizeIntent(payload.intent);

    // 3) Nonce (One-time use)
    const nonceKey = `emn:magic:nonce:${payload.nonce}`;
    const used = await redis.get(nonceKey);
    if (used) return NextResponse.redirect(`${origin}/?magic=error&reason=link_used`);
    await redis.set(nonceKey, "1", { ex: MAGIC_NONCE_TTL_SECONDS });

    // ✅ Each device gets its own independent session id
    const sid = createSessionId();

    const baseSession: SessionPayload = {
      v: 1,
      email: String(payload.email ?? "").trim().toLowerCase(),
      stripeCustomerId: String(payload.stripeCustomerId ?? "").trim(),
      iat: nowSec,
      sid,
    };

    if (!baseSession.email || !baseSession.email.includes("@") || !baseSession.stripeCustomerId.startsWith("cus_")) {
      return NextResponse.redirect(`${origin}/?magic=error&reason=invalid_payload`);
    }

    // ✅ Determine pricing by country (used for trial creation + subscribe checkout)
    const country = getRequestCountry(req);
    const { priceId, currency } = pickMonthlyPriceIdForCountry(country);

    /**
     * ✅ INTENT: LOGIN
     * - Set Redis session + cookies
     * - If currently trialing, set emn_trial_ends cookie so UI shows trial chip again
     */
    if (intent === "login") {
      let session: SessionPayload = { ...baseSession };

      try {
        const best = await getBestSubForCustomer(stripe, baseSession.stripeCustomerId);
        if (best && best.status === "trialing" && typeof best.trial_end === "number") {
          session = { ...session, trialEndsAt: best.trial_end, trialSubscriptionId: best.id };
        }
      } catch {
        // ignore
      }

      const res = NextResponse.redirect(`${origin}/?magic=success&intent=login`);

      await writeSession(redis, session);
      setSessionIdCookie(res, session.sid, isDev, cookieDomain);

      if (typeof session.trialEndsAt === "number") {
        res.cookies.set({
          name: "emn_trial_ends",
          value: String(session.trialEndsAt),
          httpOnly: false,
          secure: !isDev,
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_TTL_SECONDS,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });
      }

      return res;
    }

    /**
     * ✅ INTENT: TRIAL
     * - Create trial subscription only if eligible
     */
    if (intent === "trial") {
      const customer = (await stripe.customers.retrieve(baseSession.stripeCustomerId)) as
        | Stripe.Customer
        | Stripe.DeletedCustomer;

      if ((customer as any)?.deleted) {
        return NextResponse.redirect(`${origin}/?magic=error&reason=no_customer`);
      }

      const md = ((customer as Stripe.Customer).metadata ?? {}) as Record<string, string | undefined>;

      // If already subscribed (paid/owed) or trial used, do NOT create anything: just sign in.
      const blockingPaid = await hasBlockingPaidSubscription(stripe, baseSession.stripeCustomerId);
      if (blockingPaid || md.emn_trial_used === "1") {
        const res = NextResponse.redirect(`${origin}/?magic=ok&intent=subscribe_required`);
        await writeSession(redis, baseSession);
        setSessionIdCookie(res, baseSession.sid, isDev, cookieDomain);

        // Clear trial cookie
        res.cookies.set({
          name: "emn_trial_ends",
          value: "",
          httpOnly: false,
          secure: !isDev,
          sameSite: "lax",
          path: "/",
          maxAge: 0,
          ...(cookieDomain ? { domain: cookieDomain } : {}),
        });

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
            pricing_country: country,
            pricing_currency: currency,
            pricing_price_id: priceId,
          },
        },
        { idempotencyKey: `sub_${payload.nonce}` }
      );

      await stripe.customers.update(
        baseSession.stripeCustomerId,
        { metadata: { ...md, emn_trial_used: "1", emn_trial_used_at: String(nowSec) } },
        { idempotencyKey: `cust_${payload.nonce}` }
      );

      const sessionWithTrial: SessionPayload = {
        ...baseSession,
        trialEndsAt: sub.trial_end,
        trialSubscriptionId: sub.id,
      };

      const res = NextResponse.redirect(`${origin}/?magic=success&intent=trial`);

      await writeSession(redis, sessionWithTrial);
      setSessionIdCookie(res, sessionWithTrial.sid, isDev, cookieDomain);

      res.cookies.set({
        name: "emn_trial_ends",
        value: String(sub.trial_end),
        httpOnly: false,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });

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

      const res = NextResponse.redirect(portal.url, { status: 303 });

      await writeSession(redis, baseSession);
      setSessionIdCookie(res, baseSession.sid, isDev, cookieDomain);

      // Clear trial cookie
      res.cookies.set({
        name: "emn_trial_ends",
        value: "",
        httpOnly: false,
        secure: !isDev,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });

      return res;
    }

    // Otherwise proceed to Checkout (even if they are currently trialing)
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
        pricing_country: country,
        pricing_currency: currency,
        pricing_price_id: priceId,
      },
    });

    const res = NextResponse.redirect(checkout.url!, { status: 303 });

    await writeSession(redis, baseSession);
    setSessionIdCookie(res, baseSession.sid, isDev, cookieDomain);

    return res;
  } catch (e) {
    console.error("VERIFY_ERROR:", e);
    return NextResponse.redirect(`${origin}/?magic=error&reason=server`);
  }
}

// ✅ Only set emn_sid cookie now (shared domain if configured)
function setSessionIdCookie(res: NextResponse, sid: string, devMode: boolean, cookieDomain?: string) {
  res.cookies.set({
    name: SESSION_ID_COOKIE_NAME,
    value: sid,
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  // ✅ Optional safety: clear the old cookie if it exists
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}
