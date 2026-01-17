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

/** --------------------------
 * Webhook idempotency guard (event replay protection)
 * -------------------------- */

function eventKey(eventId: string) {
  return `emn:billing:webhook:evt:${eventId}`;
}

/**
 * Returns true if this event was NOT processed before (first time).
 * Returns false if event was already processed (duplicate/retry).
 */
async function markEventProcessedOnce(eventId: string) {
  const redis = getRedis();
  // NX = only set if not exists
  // Keep for 7 days (enough for Stripe retries / duplicates)
  const ok = await redis.set(eventKey(eventId), "1", { ex: 60 * 60 * 24 * 7, nx: true });
  return ok === "OK";
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

function normalizeInvoiceStatus(status: unknown): EntitlementSnapshot["lastInvoiceStatus"] {
  if (status === "paid" || status === "open" || status === "uncollectible" || status === "void" || status === "draft") {
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown signature verification error";
    return jsonErr(`Webhook signature verification failed. ${msg}`.trim(), 400);
  }

  // ✅ Idempotency guard: ignore retries/duplicates
  try {
    const firstTime = await markEventProcessedOnce(event.id);
    if (!firstTime) return jsonOk();
  } catch (e) {
    // If Redis is down, returning 5xx causes Stripe retries (safer than silently dropping)
    console.error("Webhook idempotency guard failed:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    switch (event.type) {
      // 1) Checkout finished (your paid upgrade)
      case "checkout.session.completed": {
  const session = event.data.object as Stripe.Checkout.Session;

  const customerId = getCustomerIdFromMaybeExpanded(session.customer);
  const subscriptionId = getSubscriptionIdFromCheckout(session);

  if (!customerId) return jsonOk();

  // Fetch the purchased subscription (authoritative fields)
  let purchasedSub: Stripe.Subscription | null = null;
  if (subscriptionId) {
    try {
      purchasedSub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price"],
      });
    } catch {
      purchasedSub = null;
    }
  }

  const now = Math.floor(Date.now() / 1000);

  // ✅ 1) Write snapshot for the purchased subscription
  const snap: EntitlementSnapshot = {
    customerId,
    subscriptionId: purchasedSub?.id ?? subscriptionId ?? null,
    status: purchasedSub?.status ?? "unknown",
    trialEndsAt: typeof purchasedSub?.trial_end === "number" ? purchasedSub.trial_end : null,
    currentPeriodEnd: purchasedSub ? getCurrentPeriodEndFromSubscription(purchasedSub) : null,
    cancelAt: typeof purchasedSub?.cancel_at === "number" ? purchasedSub.cancel_at : null,
    cancelAtPeriodEnd:
      typeof purchasedSub?.cancel_at_period_end === "boolean" ? purchasedSub.cancel_at_period_end : null,
    lastInvoiceStatus: "unknown",
    lastPaymentFailed: false,
    updatedAt: now,
  };

  await writeSnapshot(customerId, snap);

  // ✅ 2) Cleanup: cancel leftover "trial_no_card" subscriptions for the same customer
  // This prevents Stripe showing both "trialing" + "active" subscriptions.
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 50,
    });

    const purchasedId = purchasedSub?.id ?? subscriptionId ?? null;

    const leftovers = subs.data.filter((s) => {
      if (!s || typeof s.id !== "string") return false;
      if (purchasedId && s.id === purchasedId) return false;

      // Only cancel trialing subs
      if (s.status !== "trialing") return false;

      // ✅ Strict: only cancel the ones created by your trial flow
      const phase = (s.metadata && typeof s.metadata.phase === "string") ? s.metadata.phase : "";
      if (phase === "trial_no_card") return true;

      // Optional: also cancel if it looks like your trial pattern
      // (trialing + cancel_at_period_end true)
      if (s.cancel_at_period_end === true) return true;

      return false;
    });

    // Cancel them (best-effort)
    for (const s of leftovers) {
      try {
        await stripe.subscriptions.cancel(s.id);
      } catch {
        // ignore individual failures
      }
    }
  } catch {
    // ignore cleanup failures
  }

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
