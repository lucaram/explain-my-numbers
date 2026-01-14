// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getEntitlementFromRequest } from "@/lib/entitlements";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_ID = process.env.STRIPE_PRICE_ID_MONTHLY!;
const APP_ORIGIN = process.env.APP_ORIGIN!;

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_SECRET_KEY." }, { status: 500 });
    }
    if (!PRICE_ID) {
      return NextResponse.json({ ok: false, error: "Missing STRIPE_PRICE_ID_MONTHLY." }, { status: 500 });
    }
    if (!APP_ORIGIN) {
      return NextResponse.json({ ok: false, error: "Missing APP_ORIGIN." }, { status: 500 });
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

    // Create Stripe Checkout for subscription
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: ent.stripeCustomerId,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: false,
      success_url: `${APP_ORIGIN}/?billing=success`,
      cancel_url: `${APP_ORIGIN}/?billing=cancel`,
      // Optional: improves clarity in Stripe UI
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
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not start checkout. Please try again.", error_code: "CHECKOUT_FAILED" },
      { status: 500 }
    );
  }
}
