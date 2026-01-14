// app/api/auth/start-trial/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHmac, randomBytes } from "crypto";
import { Redis } from "@upstash/redis";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY!; // your £4.99/month price id
const APP_ORIGIN = process.env.APP_ORIGIN!; // e.g. https://explain-my-numbers-murex.vercel.app
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET!; // random strong secret

const TRIAL_DAYS = 3;
const MAGIC_LINK_TTL_SECONDS = 15 * 60; // link valid for 15 minutes

function isValidEmail(email: string) {
  // pragmatic validation (not perfect, but good enough for gating)
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

function signToken(payload: object) {
  const json = JSON.stringify(payload);
  const body = base64url(json);
  const sig = base64url(createHmac("sha256", MAGIC_LINK_SECRET).update(body).digest());
  return `${body}.${sig}`;
}

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  const user = u.length <= 2 ? `${u[0] ?? ""}*` : `${u.slice(0, 2)}***${u.slice(-1)}`;
  const dom = d ? d.replace(/(^.).*(\..+$)/, "$1***$2") : "***";
  return `${user}@${dom}`;
}

// Upstash keying (prevents duplicate Stripe customers per email)
function customerKey(email: string) {
  return `emn:cus:email:${email}`;
}

/**
 * POST body: { email: string }
 *
 * Creates (or reuses) a Stripe Customer, then creates a 3-day trial subscription
 * that stops at trial end (no card collected, no auto-charge).
 *
 * Sends a magic link containing a signed token, which verify-magic-link will validate
 * and set the session cookie used by entitlements.
 */
export async function POST(req: Request) {
  try {
    // --- config checks (fail fast) ---
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }
    if (!PRICE_ID) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID_MONTHLY." }, { status: 500 });
    }
    if (!APP_ORIGIN) {
      return NextResponse.json({ ok: false, error: "Missing APP_ORIGIN." }, { status: 500 });
    }
    if (!MAGIC_LINK_SECRET) {
      return NextResponse.json({ ok: false, error: "Missing MAGIC_LINK_SECRET." }, { status: 500 });
    }

    // Email config is validated again inside lib/email.ts, but fail fast here too
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
      return NextResponse.json({ ok: false, error: "Missing email configuration." }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as { email?: string } | null;
    const rawEmail = (body?.email ?? "").trim().toLowerCase();

    if (!rawEmail || !isValidEmail(rawEmail)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address.", error_code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const redis = Redis.fromEnv();

    // --- 1) Find or create Stripe Customer (Upstash-backed) ---
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

      // cache customer id for 1 year (adjust if you want)
      await redis.set(customerKey(rawEmail), customer.id, { ex: 60 * 60 * 24 * 365 });
    }

    // --- 2) Create a 3-day trial subscription (idempotent, no card, hard stop) ---
    // Prevent duplicates on retries by using a stable per-day idempotency key.
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const idempotencyKey = `emn:start_trial:${rawEmail}:${day}`;

    const sub = await stripe.subscriptions.create(
      {
        customer: customer.id,
        items: [{ price: PRICE_ID, quantity: 1 }],
        trial_period_days: TRIAL_DAYS,
        cancel_at_period_end: true, // clean "stop at end of trial" behavior (no surprise billing)
        metadata: {
          product: "explain_my_numbers",
          phase: "trial_no_card",
        },
      },
      { idempotencyKey }
    );

    // --- 3) Create a signed magic link token (short-lived) ---
    const nonce = base64url(randomBytes(16));
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + MAGIC_LINK_TTL_SECONDS;

    const token = signToken({
      v: 1,
      typ: "magic_link",
      email: rawEmail,
      stripeCustomerId: customer.id,
      trialSubscriptionId: sub.id,
      trialEndsAt: sub.trial_end ?? null, // Stripe is source of truth
      iat: nowSec,
      exp: expSec,
      nonce,
    });

    // Your verify route is here (as you confirmed):
    // app/api/auth/verify-magic-link/route.ts
    const verifyUrl = `${APP_ORIGIN}/api/auth/verify-magic-link?token=${encodeURIComponent(token)}`;

    // --- 4) Email the link ---
    await sendMagicLinkEmail({
      to: rawEmail,
      verifyUrl,
      trialDays: TRIAL_DAYS,
    });

    return NextResponse.json({
      ok: true,
      message: "Magic link sent.",
      email: maskEmail(rawEmail),
    });
  } catch {
    // Don’t leak internals
    return NextResponse.json(
      { ok: false, error: "Could not start trial. Please try again.", error_code: "START_TRIAL_FAILED" },
      { status: 500 }
    );
  }
}
