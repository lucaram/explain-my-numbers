// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getEntitlementFromRequest } from "@/lib/entitlements";

export const runtime = "nodejs";

const PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY || "";
const APP_ORIGINS = process.env.APP_ORIGINS || "";

// Helper: instantiate Stripe only at request-time (prevents build-time crashes)
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  return new Stripe(key);
}

// Helper: pick one origin string (supports comma-separated APP_ORIGINS too)
function pickPrimaryOrigin(origins: string) {
  // If you ever store multiple, we use the first as canonical redirect base.
  return origins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
}

export async function POST(req: Request) {
  try {
    // --- config checks (fail fast, but only at runtime) ---
    if (!PRICE_ID) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID_MONTHLY." }, { status: 500 });
    }
    if (!APP_ORIGINS) {
      return NextResponse.json({ ok: false, error: "Missing APP_ORIGINS." }, { status: 500 });
    }

    const origin = pickPrimaryOrigin(APP_ORIGINS);
    if (!origin) {
      return NextResponse.json({ ok: false, error: "APP_ORIGINS is empty." }, { status: 500 });
    }

    // Must have a valid session cookie to upgrade.
    const ent = await getEntitlementFromRequest(req);

    if (!ent.stripeCustomerId) {
      return NextResponse.json(
        { ok: false, error: "You must verify your magic link first.", error_code: "NO_SESSION" },
        { status: 401 }
      );
    }

    // If already active subscription, no need to checkout.
    if (ent.reason === "subscription_active") {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    const stripe = getStripe();

    // Create Stripe Checkout for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: ent.stripeCustomerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: false,
      success_url: `${origin}/?billing=success`,
      cancel_url: `${origin}/?billing=cancel`,
      subscription_data: {
        metadata: {
          product: "explain_my_numbers",
          phase: "paid_monthly",
        },
      },
      metadata: {
        product: "explain_my_numbers",
        kind: "upgrade_checkout",
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    // Keep logs server-side; don’t leak internals to client
    console.error("create-checkout-session error:", err?.message || err);
    return NextResponse.json(
      { ok: false, error: "Could not start checkout. Please try again.", error_code: "CHECKOUT_FAILED" },
      { status: 500 }
    );
  }
}
