// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { createHmac, timingSafeEqual, createHash } from "crypto";

export const runtime = "nodejs";

const SESSION_COOKIE_NAME = "emn_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const TRIAL_DAYS = 3;
const MAGIC_NONCE_TTL_SECONDS = 15 * 60; // must match magic link TTL

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

function pickPrimaryOrigin(origins: string) {
  return origins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
}

function verifySignedToken(token: string, magicSecret: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, sig] = parts;

  const expectedSig = base64url(createHmac("sha256", magicSecret).update(body).digest());

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  const json = base64urlToBuffer(body).toString("utf8");
  try {
    return JSON.parse(json) as any;
  } catch {
    return null;
  }
}

function safeRedirect(appOrigin: string, pathWithQuery: string) {
  return NextResponse.redirect(`${appOrigin}${pathWithQuery}`, { status: 302 });
}

function nonceKey(nonce: string) {
  return `emn:magic:nonce:${nonce}`;
}

export async function GET(req: Request) {
  const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || "";
  const APP_ORIGINS = process.env.APP_ORIGINS || "";
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
  const PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY || "";

  const origin = pickPrimaryOrigin(APP_ORIGINS);

  if (!MAGIC_LINK_SECRET || !origin) {
    return NextResponse.json(
      { ok: false, error: "Server misconfigured (missing MAGIC_LINK_SECRET or APP_ORIGINS)." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";

    if (!token) return safeRedirect(origin, "/?magic=error&reason=missing_token");

    const payload = verifySignedToken(token, MAGIC_LINK_SECRET);
    if (!payload) return safeRedirect(origin, "/?magic=error&reason=bad_signature");

    if (payload.typ !== "magic_link" || payload.v !== 1) {
      return safeRedirect(origin, "/?magic=error&reason=bad_payload");
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== "number" || nowSec > payload.exp) {
      return safeRedirect(origin, "/?magic=error&reason=expired");
    }

    if (typeof payload.email !== "string" || !payload.email.includes("@")) {
      return safeRedirect(origin, "/?magic=error&reason=bad_email");
    }

    if (typeof payload.stripeCustomerId !== "string" || !payload.stripeCustomerId.startsWith("cus_")) {
      return safeRedirect(origin, "/?magic=error&reason=bad_customer");
    }

    if (payload.intent !== "trial" && payload.intent !== "subscribe") {
      return safeRedirect(origin, "/?magic=error&reason=bad_intent");
    }

    if (typeof payload.nonce !== "string" || payload.nonce.length < 10) {
      return safeRedirect(origin, "/?magic=error&reason=bad_nonce");
    }

    // --- nonce replay protection ---
    const redis = Redis.fromEnv();
    const alreadyUsed = await redis.get(nonceKey(payload.nonce));
    if (alreadyUsed) {
      return safeRedirect(origin, "/?magic=error&reason=link_used");
    }
    await redis.set(nonceKey(payload.nonce), "1", { ex: MAGIC_NONCE_TTL_SECONDS });

    // --- create session cookie now (valid for both flows) ---
    const session = {
      v: 1,
      email: payload.email,
      stripeCustomerId: payload.stripeCustomerId,
      iat: nowSec,
      sid: base64url(
        createHash("sha256").update(`${payload.stripeCustomerId}:${payload.email}`).digest()
      ).slice(0, 22),
    };

    const sessionB64 = base64url(JSON.stringify(session));
    const sessionSig = base64url(createHmac("sha256", MAGIC_LINK_SECRET).update(sessionB64).digest());
    const cookieValue = `${sessionB64}.${sessionSig}`;

    // --- intent routing ---
    if (payload.intent === "trial") {
      if (!STRIPE_SECRET_KEY || !PRICE_ID) {
        return safeRedirect(origin, "/?magic=error&reason=server_config");
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY);

      // ✅ NEW: enforce "trial only once per Stripe customer"
      // If this customer has EVER had a subscription (trial or paid), block another trial.
      const existing = await stripe.subscriptions.list({
        customer: payload.stripeCustomerId,
        status: "all",
        limit: 1,
      });

      if (existing.data.length > 0) {
        // You can choose a different UX here.
        // This redirects back to home with a hint param the UI can display.
        const res = safeRedirect(origin, "/?magic=ok&intent=subscribe_required");

        res.cookies.set({
          name: SESSION_COOKIE_NAME,
          value: cookieValue,
          httpOnly: true,
          sameSite: "lax",
          secure: origin.startsWith("https://"),
          path: "/",
          maxAge: SESSION_TTL_SECONDS,
        });

        return res;
      }

      // Create trial subscription NOW (at click time)
const idempotencyKey = `emn:trial_on_click:${payload.stripeCustomerId}`;

      const sub = await stripe.subscriptions.create(
        {
          customer: payload.stripeCustomerId,
          items: [{ price: PRICE_ID, quantity: 1 }],
          trial_period_days: TRIAL_DAYS,
          cancel_at_period_end: true,
          metadata: {
            product: "explain_my_numbers",
            phase: "trial_no_card",
            created_by: "magic_link_click",
          },
        },
        { idempotencyKey }
      );

      const res = safeRedirect(origin, "/?magic=ok&intent=trial");

      res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: cookieValue,
        httpOnly: true,
        sameSite: "lax",
        secure: origin.startsWith("https://"),
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });

      // Optional: give frontend a hint via a non-httpOnly cookie (safe)
      res.cookies.set({
        name: "emn_trial_ends",
        value: String(sub.trial_end ?? ""),
        httpOnly: false,
        sameSite: "lax",
        secure: origin.startsWith("https://"),
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    // intent === "subscribe"
    if (!STRIPE_SECRET_KEY || !PRICE_ID) {
      return safeRedirect(origin, "/?magic=error&reason=server_config");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: payload.stripeCustomerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/?subscribe=success`,
      cancel_url: `${origin}/?subscribe=cancel`,
      metadata: {
        product: "explain_my_numbers",
        created_by: "magic_link_click",
      },
    });

    if (!checkout.url) {
      return safeRedirect(origin, "/?magic=error&reason=no_checkout_url");
    }

    const res = NextResponse.redirect(checkout.url, { status: 303 });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      sameSite: "lax",
      secure: origin.startsWith("https://"),
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return res;
  } catch (e) {
    console.error("verify-magic-link failed:", e);
    return safeRedirect(origin, "/?magic=error&reason=server");
  }
}
