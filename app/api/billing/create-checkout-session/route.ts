// src/app/api/billing/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const runtime = "nodejs";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  // ✅ No apiVersion override
  return new Stripe(key);
}

async function readSession(): Promise<{ email: string; customerId: string | null } | null> {
  const name = process.env.SESSION_COOKIE_NAME || "emn_session";

  // ✅ Next.js (your version): cookies() returns Promise<ReadonlyRequestCookies>
  const jar = await cookies();
  const c = jar.get(name)?.value;

  if (!c) return null;

  try {
    const raw = Buffer.from(c, "base64url").toString("utf8");
    const j = JSON.parse(raw) as any;
    const email = String(j?.email ?? "").trim().toLowerCase();
    const customerId = j?.customerId ? String(j.customerId) : null;
    if (!email || !email.includes("@")) return null;
    return { email, customerId };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
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

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error("Missing STRIPE_PRICE_ID.");

    // Ensure we have a customer id (fallback: lookup/create by email)
    let customerId = sess.customerId;
    if (!customerId) {
      const existing = await stripe.customers.list({ email: sess.email, limit: 1 });
      customerId =
        existing.data[0]?.id || (await stripe.customers.create({ email: sess.email })).id;
    }

    const origin = new URL(req.url).origin.replace(/\/+$/, "");
    const successUrl = process.env.STRIPE_SUCCESS_URL?.trim() || `${origin}/?billing=success`;
    const cancelUrl = process.env.STRIPE_CANCEL_URL?.trim() || `${origin}/?billing=cancel`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
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
