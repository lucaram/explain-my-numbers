// src/lib/entitlements.ts
import Stripe from "stripe";
import { Redis } from "@upstash/redis";
import { createHmac, timingSafeEqual } from "crypto";

export type EntitlementResult = {
  canExplain: boolean;
  reason:
    | "missing_session"
    | "invalid_session"
    | "no_customer"
    | "trial_active"
    | "subscription_active"
    | "subscription_cancelled" // ✅ active but cancels at period end
    | "no_entitlement"
    | "stripe_error";
  stripeCustomerId?: string;
  email?: string;
  trialEndsAt?: number | null;
  activeSubscriptionId?: string | null;

  // ✅ added for portal/subscription UI
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: number | null;
};

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session";

function getStripe() {
  const key = String(process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

function getRedis() {
  return Redis.fromEnv();
}

function getMagicSecret() {
  const s = String(process.env.MAGIC_LINK_SECRET ?? "").trim();
  if (!s) throw new Error("Missing MAGIC_LINK_SECRET.");
  return s;
}

/** --------------------------
 * Stripe helper: current period end
 * -------------------------- */
function getCurrentPeriodEndFromSubscription(sub: Stripe.Subscription): number | null {
  const direct = (sub as unknown as { current_period_end?: unknown }).current_period_end;
  if (typeof direct === "number") return direct;

  const items = sub.items?.data;
  if (Array.isArray(items) && items.length > 0) {
    const item = items[0] as unknown as { current_period_end?: unknown };
    if (typeof item.current_period_end === "number") return item.current_period_end;
  }
  return null;
}

/** --------------------------
 * Base64url helpers
 * -------------------------- */
function base64urlToBuffer(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** --------------------------
 * Cookie helpers
 * -------------------------- */
function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;

  const parts = header.split(";");
  for (const p of parts) {
    const i = p.indexOf("=");
    if (i === -1) continue;
    const k = p.slice(0, i).trim();
    const v = p.slice(i + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

/** --------------------------
 * Session verification (signed cookie: body.sig)
 * -------------------------- */
type SessionPayload = {
  v: number;
  email: string;
  stripeCustomerId: string;
  trialSubscriptionId?: string | null;
  trialEndsAt?: number | null;
  iat?: number;
  sid?: string;
};

function verifySignedValue(value: string, magicSecret: string): SessionPayload | null {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = base64url(createHmac("sha256", magicSecret).update(body).digest());

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const json = base64urlToBuffer(body).toString("utf8");
    const parsed = JSON.parse(json) as SessionPayload;

    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== 1) return null;
    if (typeof parsed.email !== "string" || !parsed.email.includes("@")) return null;
    if (typeof parsed.stripeCustomerId !== "string" || !parsed.stripeCustomerId.startsWith("cus_"))
      return null;

    return parsed;
  } catch {
    return null;
  }
}

/** --------------------------
 * Redis snapshot cache (written by webhook)
 * Key matches: emn:ent:cus:<customerId>
 * -------------------------- */
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

async function readSnapshot(customerId: string): Promise<EntitlementSnapshot | null> {
  const redis = getRedis();
  const snap = await redis.get<EntitlementSnapshot>(keyForCustomer(customerId));
  return snap ?? null;
}

async function writeSnapshot(customerId: string, snap: EntitlementSnapshot) {
  const redis = getRedis();
  await redis.set(keyForCustomer(customerId), snap, { ex: 60 * 60 * 24 * 14 }); // 14 days
}

/** --------------------------
 * Entitlement decision from snapshot
 * -------------------------- */
function entitlementFromSnapshot(snap: EntitlementSnapshot, email: string, nowSec: number): EntitlementResult {
  // Trialing with trial end in the future -> allow
  if (snap.status === "trialing" && typeof snap.trialEndsAt === "number" && snap.trialEndsAt > nowSec) {
    return {
      canExplain: true,
      reason: "trial_active",
      stripeCustomerId: snap.customerId,
      email,
      trialEndsAt: snap.trialEndsAt ?? null,
      activeSubscriptionId: snap.subscriptionId ?? null,
      cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: snap.currentPeriodEnd ?? null,
    };
  }

  // Active -> allow (but distinguish if cancelling)
  if (snap.status === "active") {
    const cancelling = snap.cancelAtPeriodEnd === true;
    return {
      canExplain: true,
      reason: cancelling ? "subscription_cancelled" : "subscription_active",
      stripeCustomerId: snap.customerId,
      email,
      trialEndsAt: snap.trialEndsAt ?? null,
      activeSubscriptionId: snap.subscriptionId ?? null,
      cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: snap.currentPeriodEnd ?? null,
    };
  }

  // Optional: Past due but still within current paid period -> allow (less disruptive)
  if (
    snap.status === "past_due" &&
    typeof snap.currentPeriodEnd === "number" &&
    snap.currentPeriodEnd > nowSec
  ) {
    const cancelling = snap.cancelAtPeriodEnd === true;
    return {
      canExplain: true,
      reason: cancelling ? "subscription_cancelled" : "subscription_active",
      stripeCustomerId: snap.customerId,
      email,
      trialEndsAt: snap.trialEndsAt ?? null,
      activeSubscriptionId: snap.subscriptionId ?? null,
      cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: snap.currentPeriodEnd ?? null,
    };
  }

  return {
    canExplain: false,
    reason: "no_entitlement",
    stripeCustomerId: snap.customerId,
    email,
    trialEndsAt: snap.trialEndsAt ?? null,
    activeSubscriptionId: snap.subscriptionId ?? null,
    cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
    currentPeriodEnd: snap.currentPeriodEnd ?? null,
  };
}

/** --------------------------
 * Stripe-based entitlement (single source of truth)
 * IMPORTANT: Prefer ACTIVE over TRIALING if both exist.
 * -------------------------- */
function entitlementFromStripeList(
  customerId: string,
  email: string,
  nowSec: number,
  subs: Stripe.ApiList<Stripe.Subscription>
): { ent: EntitlementResult; snap: EntitlementSnapshot } {
  const active = subs.data.find((s) => s.status === "active");

  const pastDue = subs.data.find((s) => {
    if (s.status !== "past_due") return false;
    const cpe = getCurrentPeriodEndFromSubscription(s);
    return typeof cpe === "number" && cpe > nowSec;
  });

  const trialing = subs.data.find(
    (s) => s.status === "trialing" && typeof s.trial_end === "number" && s.trial_end > nowSec
  );

  // ✅ prefer active -> past_due -> trialing
  const chosen = active ?? pastDue ?? trialing ?? null;

  const snap: EntitlementSnapshot = {
    customerId,
    subscriptionId: chosen?.id ?? null,
    status: (chosen?.status as any) ?? "unknown",
    trialEndsAt: typeof chosen?.trial_end === "number" ? chosen.trial_end : null,
    currentPeriodEnd: chosen ? getCurrentPeriodEndFromSubscription(chosen) : null,
    cancelAt: typeof chosen?.cancel_at === "number" ? chosen.cancel_at : null,
    cancelAtPeriodEnd: typeof chosen?.cancel_at_period_end === "boolean" ? chosen.cancel_at_period_end : null,
    lastInvoiceStatus: "unknown",
    lastPaymentFailed: false,
    updatedAt: nowSec,
  };

  if (active) {
    const cancelling = typeof active.cancel_at_period_end === "boolean" ? active.cancel_at_period_end : false;
    return {
      ent: {
        canExplain: true,
        reason: cancelling ? "subscription_cancelled" : "subscription_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: active.trial_end ?? null,
        activeSubscriptionId: active.id,
        cancelAtPeriodEnd: typeof active.cancel_at_period_end === "boolean" ? active.cancel_at_period_end : null,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(active),
      },
      snap,
    };
  }

  if (pastDue) {
    const cancelling = typeof pastDue.cancel_at_period_end === "boolean" ? pastDue.cancel_at_period_end : false;
    return {
      ent: {
        canExplain: true,
        reason: cancelling ? "subscription_cancelled" : "subscription_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: pastDue.trial_end ?? null,
        activeSubscriptionId: pastDue.id,
        cancelAtPeriodEnd: typeof pastDue.cancel_at_period_end === "boolean" ? pastDue.cancel_at_period_end : null,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(pastDue),
      },
      snap,
    };
  }

  if (trialing) {
    return {
      ent: {
        canExplain: true,
        reason: "trial_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: trialing.trial_end ?? null,
        activeSubscriptionId: trialing.id,
        cancelAtPeriodEnd: typeof trialing.cancel_at_period_end === "boolean" ? trialing.cancel_at_period_end : null,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(trialing),
      },
      snap,
    };
  }

  return {
    ent: {
      canExplain: false,
      reason: "no_entitlement",
      stripeCustomerId: customerId,
      email,
      trialEndsAt: null,
      activeSubscriptionId: null,
      cancelAtPeriodEnd: null,
      currentPeriodEnd: null,
    },
    snap,
  };
}

/** --------------------------
 * Main API
 * -------------------------- */
export async function getEntitlementFromRequest(req: Request): Promise<EntitlementResult> {
  try {
    const magicSecret = getMagicSecret();

    const cookies = parseCookies(req.headers.get("cookie"));
    const raw = cookies[SESSION_COOKIE_NAME];
    if (!raw) return { canExplain: false, reason: "missing_session" };

    const session = verifySignedValue(raw, magicSecret);
    if (!session) return { canExplain: false, reason: "invalid_session" };

    const stripeCustomerId = String(session.stripeCustomerId ?? "").trim();
    if (!stripeCustomerId) return { canExplain: false, reason: "no_customer" };

    const email = String(session.email ?? "").trim().toLowerCase();
    const nowSec = Math.floor(Date.now() / 1000);

    // 1) Session-based trial hint:
    // ✅ If the cookie says trial is active, we still must ensure Stripe does NOT already show active.
    if (typeof session.trialEndsAt === "number" && session.trialEndsAt > nowSec) {
      // try snapshot first
      const snap = await readSnapshot(stripeCustomerId);

      // If snapshot already shows a real subscription state (active/past_due), do NOT return trial.
      if (snap && snap.status !== "unknown") {
        if (snap.status === "active") {
          // fall through
        } else if (
          snap.status === "past_due" &&
          typeof snap.currentPeriodEnd === "number" &&
          snap.currentPeriodEnd > nowSec
        ) {
          // fall through
        } else if (snap.status === "trialing") {
          return entitlementFromSnapshot(snap, email, nowSec);
        } else {
          // fall through
        }
      } else {
        // Snapshot missing/unknown → do ONE Stripe check (deterministic)
        const stripe = getStripe();
        const subs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "all",
          limit: 20,
        });

        const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
        writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

        // If Stripe says trial, return it. If Stripe says active, we fall through (and will return active below too).
        if (ent.reason === "trial_active") return ent;
      }

      // If we reach here, session trial hint exists but Stripe likely has active/past_due.
      // fall through to normal snapshot/stripe logic below.
    }

    // 2) Redis snapshot fast-path (written by webhook)
    const snap = await readSnapshot(stripeCustomerId);
    if (snap && snap.status !== "unknown") {
      return entitlementFromSnapshot(snap, email, nowSec);
    }

    // 3) Stripe fallback (authoritative)
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 20,
    });

    const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
    writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

    return ent;
  } catch {
    return { canExplain: false, reason: "stripe_error" };
  }
}
