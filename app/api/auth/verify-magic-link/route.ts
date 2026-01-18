import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, timingSafeEqual, createHash } from "crypto";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const TRIAL_DAYS = 3;
const MAGIC_NONCE_TTL_SECONDS = 15 * 60;

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
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const pad = "=".repeat((4 - (body.length % 4 || 4)) % 4);
    const b64 = (body + pad).replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch { return null; }
}

function getCanonicalOrigin(req: Request, fallbackOrigins: string) {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) return "http://localhost:3000";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host.includes("localhost")) return "http://localhost:3000";
  return `${proto}://${host}`.replace(/\/$/, "");
}

function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
}

type SessionPayload = {
  v: 1; email: string; stripeCustomerId: string; iat: number; sid: string;
  trialEndsAt?: number | null; trialSubscriptionId?: string | null;
};

function signSessionCookie(session: SessionPayload, secret: string) {
  const body = base64url(JSON.stringify(session));
  const sig = base64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

/** --------------------------
 * Main GET Route
 * -------------------------- */

export async function GET(req: Request) {
  const { MAGIC_LINK_SECRET, STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MONTHLY, APP_ORIGINS, NODE_ENV } = process.env;
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
    const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "5 m"), prefix: "emn:auth:verify" });
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

    const baseSession: SessionPayload = {
      v: 1, email: payload.email, stripeCustomerId: payload.stripeCustomerId,
      iat: nowSec, sid: createHash("sha256").update(payload.nonce).digest("hex").slice(0, 12),
    };

    // --- TRIAL Intent ---
    if (payload.intent === "trial") {
      const customer = (await stripe.customers.retrieve(payload.stripeCustomerId)) as Stripe.Customer;
      const md = (customer.metadata ?? {}) as Record<string, string | undefined>;
      const subs = await stripe.subscriptions.list({ customer: payload.stripeCustomerId, limit: 1 });

      if (subs.data.length > 0 || md.emn_trial_used === "1") {
        const res = NextResponse.redirect(`${origin}/?magic=ok&intent=subscribe_required`);
        setAuthCookie(res, baseSession, MAGIC_LINK_SECRET!, isDev);
        return res;
      }

      // FIXED: Unique Idempotency Keys
      const sub = await stripe.subscriptions.create({
        customer: payload.stripeCustomerId,
        items: [{ price: STRIPE_PRICE_ID_MONTHLY!, quantity: 1 }],
        trial_period_days: TRIAL_DAYS,
        cancel_at_period_end: true,
      }, { idempotencyKey: `sub_${payload.nonce}` });

      await stripe.customers.update(payload.stripeCustomerId, { 
        metadata: { ...md, emn_trial_used: "1", emn_trial_used_at: String(nowSec) } 
      }, { idempotencyKey: `cust_${payload.nonce}` });

      const res = NextResponse.redirect(`${origin}/?magic=success&intent=trial`);
      setAuthCookie(res, { ...baseSession, trialEndsAt: sub.trial_end, trialSubscriptionId: sub.id }, MAGIC_LINK_SECRET!, isDev);
      
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
      line_items: [{ price: STRIPE_PRICE_ID_MONTHLY!, quantity: 1 }],
      success_url: `${origin}/?subscribe=success`,
      cancel_url: `${origin}/?subscribe=cancel`,
    });

    const res = NextResponse.redirect(checkout.url!, { status: 303 });
    setAuthCookie(res, baseSession, MAGIC_LINK_SECRET!, isDev);
    return res;

  } catch (e) {
    console.error("VERIFY_ERROR:", e);
    return NextResponse.redirect(`${origin}/?magic=error&reason=server`);
  }
}

function setAuthCookie(res: NextResponse, session: SessionPayload, secret: string, devMode: boolean) {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: signSessionCookie(session, secret),
    httpOnly: true,
    secure: !devMode,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}