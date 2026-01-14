// app/api/billing/webhook/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

function getRedis() {
  return Redis.fromEnv();
}


// Stored snapshot (optional cache / audit)
type EntitlementSnapshot = {
  customerId: string;
  subscriptionId: string | null;
  status: Stripe.Subscription.Status | "unknown";
  trialEndsAt: number | null; // unix seconds
  currentPeriodEnd: number | null; // unix seconds
  cancelAt: number | null; // unix seconds
  cancelAtPeriodEnd: boolean | null;
  lastInvoiceStatus: "paid" | "open" | "uncollectible" | "void" | "draft" | "unknown";
  lastPaymentFailed: boolean;
  updatedAt: number; // unix seconds
};

function keyForCustomer(customerId: string) {
  return `emn:ent:cus:${customerId}`;
}

async function writeSnapshot(customerId: string, snap: EntitlementSnapshot) {
  const redis = getRedis();
  // keep for a while (you can increase later)
  // This is only a cache/snapshot; Stripe remains the source of truth.
  await redis.set(keyForCustomer(customerId), snap, { ex: 60 * 60 * 24 * 14 }); // 14 days
}


function jsonOk() {
  return NextResponse.json({ ok: true });
}

function jsonErr(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

/**
 * Stripe SDK types differ across versions.
 * These helpers read fields defensively without using `any` everywhere.
 */

function getCustomerIdFromMaybeExpanded(
  customer: Stripe.Subscription["customer"] | Stripe.Checkout.Session["customer"] | Stripe.Invoice["customer"]
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  // expanded object
  if (typeof (customer as Stripe.Customer).id === "string") return (customer as Stripe.Customer).id;
  return null;
}

function getSubscriptionIdFromCheckout(session: Stripe.Checkout.Session): string | null {
  const sub = session.subscription;
  if (!sub) return null;
  if (typeof sub === "string") return sub;
  if (typeof (sub as Stripe.Subscription).id === "string") return (sub as Stripe.Subscription).id;
  return null;
}

/**
 * In some Stripe type versions, Subscription.current_period_end is not present on the TS type.
 * But the API still returns it, or you can derive it from the first subscription item period end.
 */
function getCurrentPeriodEndFromSubscription(sub: Stripe.Subscription): number | null {
  // Try direct property if it exists at runtime
  const direct = (sub as unknown as { current_period_end?: unknown }).current_period_end;
  if (typeof direct === "number") return direct;

  // Fallback: first subscription item period end (if expanded)
  const items = sub.items?.data;
  if (Array.isArray(items) && items.length > 0) {
    const item = items[0] as unknown as { current_period_end?: unknown };
    if (typeof item.current_period_end === "number") return item.current_period_end;
  }

  return null;
}

/**
 * Some Stripe type versions don’t expose Invoice.subscription on the TS type.
 * Read it safely from the raw object.
 */
function getSubscriptionIdFromInvoice(inv: Stripe.Invoice): string | null {
  const maybe = (inv as unknown as { subscription?: unknown }).subscription;
  if (!maybe) return null;
  if (typeof maybe === "string") return maybe;
  if (typeof (maybe as { id?: unknown }).id === "string") return (maybe as { id: string }).id;
  return null;
}

function normalizeInvoiceStatus(
  status: unknown
): EntitlementSnapshot["lastInvoiceStatus"] {
  if (
    status === "paid" ||
    status === "open" ||
    status === "uncollectible" ||
    status === "void" ||
    status === "draft"
  ) {
    return status;
  }
  return "unknown";
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY) return jsonErr("Missing STRIPE_SECRET_KEY.", 500);
  if (!secret) return jsonErr("Missing STRIPE_WEBHOOK_SECRET.", 500);

  const sig = req.headers.get("stripe-signature");
  if (!sig) return jsonErr("Missing stripe-signature header.", 400);

  // Stripe requires the *raw* body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  const stripe = getStripe();

try {
  event = stripe.webhooks.constructEvent(rawBody, sig, secret);
}
 catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Unknown signature verification error";
    return jsonErr(`Webhook signature verification failed. ${msg}`.trim(), 400);
  }

  try {
    switch (event.type) {
      // 1) Checkout finished (your paid upgrade)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = getCustomerIdFromMaybeExpanded(session.customer);
        const subscriptionId = getSubscriptionIdFromCheckout(session);

        if (!customerId) return jsonOk();

        // Fetch subscription for authoritative fields (status, trial_end, etc.)
        let sub: Stripe.Subscription | null = null;
if (subscriptionId) {
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });
  } catch {
    sub = null;
  }
}

        const now = Math.floor(Date.now() / 1000);

        const snap: EntitlementSnapshot = {
          customerId,
          subscriptionId: sub?.id ?? subscriptionId ?? null,
          status: sub?.status ?? "unknown",
          trialEndsAt: typeof sub?.trial_end === "number" ? sub.trial_end : null,
          currentPeriodEnd: sub ? getCurrentPeriodEndFromSubscription(sub) : null,
          cancelAt: typeof sub?.cancel_at === "number" ? sub.cancel_at : null,
          cancelAtPeriodEnd: typeof sub?.cancel_at_period_end === "boolean" ? sub.cancel_at_period_end : null,
          lastInvoiceStatus: "unknown",
          lastPaymentFailed: false,
          updatedAt: now,
        };

        await writeSnapshot(customerId, snap);
        return jsonOk();
      }

      // 2/3/4) Subscription lifecycle
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const customerId = getCustomerIdFromMaybeExpanded(sub.customer);
        if (!customerId) return jsonOk();

        const now = Math.floor(Date.now() / 1000);

        const snap: EntitlementSnapshot = {
          customerId,
          subscriptionId: sub.id ?? null,
          status: sub.status ?? "unknown",
          trialEndsAt: typeof sub.trial_end === "number" ? sub.trial_end : null,
          currentPeriodEnd: getCurrentPeriodEndFromSubscription(sub),
          cancelAt: typeof sub.cancel_at === "number" ? sub.cancel_at : null,
          cancelAtPeriodEnd: typeof sub.cancel_at_period_end === "boolean" ? sub.cancel_at_period_end : null,
          lastInvoiceStatus: "unknown",
          lastPaymentFailed: false,
          updatedAt: now,
        };

        await writeSnapshot(customerId, snap);
        return jsonOk();
      }

      // 5) Payment failed (dunning / access should eventually be blocked)
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;

        const customerId = getCustomerIdFromMaybeExpanded(inv.customer);
        const subscriptionId = getSubscriptionIdFromInvoice(inv);

        if (!customerId) return jsonOk();

        const now = Math.floor(Date.now() / 1000);

        const snap: EntitlementSnapshot = {
          customerId,
          subscriptionId: subscriptionId ?? null,
          status: "unknown",
          trialEndsAt: null,
          currentPeriodEnd: null,
          cancelAt: null,
          cancelAtPeriodEnd: null,
          lastInvoiceStatus: normalizeInvoiceStatus((inv as unknown as { status?: unknown }).status),
          lastPaymentFailed: true,
          updatedAt: now,
        };

        await writeSnapshot(customerId, snap);
        return jsonOk();
      }

      default:
        // Ignore everything else
        return jsonOk();
    }
  } catch (err) {
    // Stripe wants a 2xx if you handled it; 5xx triggers retries.
    console.error("Webhook handler error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
