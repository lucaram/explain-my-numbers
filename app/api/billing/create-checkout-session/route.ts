// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

function json(data: any, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(data, { status, headers });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64urlToBuffer(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function verifySignedSessionCookie(cookieValue: string, secret: string) {
  // Expected: <bodyB64>.<sigB64>
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;

  const [bodyB64, sigB64] = parts;

  const expectedSigB64 = base64url(
    createHmac("sha256", secret).update(bodyB64).digest()
  );

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

async function readSession(): Promise<{
  email: string;
  stripeCustomerId: string;
  sid: string;
} | null> {
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
  // UK => GBP
  if (country === "GB") {
    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_GBP;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_GBP.");
    return { priceId, currency: "gbp" as const };
  }

  // EU => EUR
  if (EU_COUNTRIES.has(country)) {
    const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_EURO;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_EURO.");
    return { priceId, currency: "eur" as const };
  }

  // US or everyone else => USD
  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY_USD;
  if (!priceId) throw new Error("Missing STRIPE_PRICE_ID_MONTHLY_USD.");
  return { priceId, currency: "usd" as const };
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();

    // ✅ Read & verify signed session cookie
    const sess = await readSession();
    if (!sess) {
      return json(
        {
          ok: false,
          error: "You must verify your magic link first.",
          error_code: "NO_SESSION",
        },
        401
      );
    }

    // ✅ Rate limit (session-based) — stops a verified user/bot spamming checkout creation
    const redis = Redis.fromEnv();
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 m"), // 10 checkout sessions / 10 minutes per session
      analytics: false,
      prefix: "emn:billing:checkout:rl",
    });

    const limiter = await applyRateLimit(rl, `sid:${sess.sid}`);
    if (!limiter.ok) {
      const retry = limiter.retryAfterSec ?? 600;
      return json(
        {
          ok: false,
          error: "Too many requests. Please try again soon.",
          error_code: "RATE_LIMITED",
        },
        429,
        { "Retry-After": String(retry) }
      );
    }

    // ✅ Pick price by country (GB=>GBP, EU=>EUR, else=>USD)
    const country = getRequestCountry(req);
    const { priceId, currency } = pickMonthlyPriceIdForCountry(country);

    // ✅ You already have the customer id from the signed session cookie
    const customerId = sess.stripeCustomerId;

    const origin = new URL(req.url).origin.replace(/\/+$/, "");
    const successUrl =
      process.env.STRIPE_SUCCESS_URL?.trim() || `${origin}/?billing=success`;
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL?.trim() || `${origin}/?billing=cancel`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        product: "explain_my_numbers",
        created_by: "billing_create_checkout_session",
        email: sess.email,

        // helpful debug/support metadata
        pricing_country: country,
        pricing_currency: currency,
        pricing_price_id: priceId,
      },
    });

    if (!checkout.url) throw new Error("Stripe session created but missing URL.");

    return json({ ok: true, url: checkout.url });
  } catch (e: any) {
    console.error("[create-checkout-session]", e);
    return json(
      { ok: false, error: e?.message ?? "Stripe error.", error_code: "STRIPE_ERROR" },
      500
    );
  }
}
