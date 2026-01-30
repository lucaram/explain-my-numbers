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
    | "subscription_cancelled" // ✅ active but scheduled to cancel
    | "no_entitlement"
    | "stripe_error";
  stripeCustomerId?: string;
  email?: string;
  trialEndsAt?: number | null;
  activeSubscriptionId?: string | null;

  // ✅ added for portal/subscription UI
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: number | null;

  // ✅ IMPORTANT: Stripe can schedule cancel using cancel_at even if cancel_at_period_end is false
  cancelAt?: number | null;
};

const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid"; // ✅ new
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "emn_session"; // legacy fallback

const SESSION_KEY_PREFIX = "emn:sess:";

function getStripe() {
  const key = String(process.env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key, { apiVersion: "2023-10-16" as any });
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
  const direct = (sub as any).current_period_end;
  if (typeof direct === "number") return direct;

  const items = sub.items?.data;
  if (Array.isArray(items) && items.length > 0) {
    const item = items[0] as any;
    if (typeof item.current_period_end === "number") return item.current_period_end;
  }
  return null;
}

/** --------------------------
 * Base64url helpers
 * -------------------------- */
function base64urlToBuffer(s: string) {
  const pad = (4 - (s.length % 4 || 4)) % 4;
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
 * Session verification (signed cookie: body.sig) — legacy fallback
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
    if (typeof parsed.stripeCustomerId !== "string" || !parsed.stripeCustomerId.startsWith("cus_")) return null;

    return parsed;
  } catch {
    return null;
  }
}

/** --------------------------
 * Redis session (emn_sid -> emn:sess:<sid>) — new
 * -------------------------- */
type RedisSession = {
  v: 1;
  email: string;
  stripeCustomerId: string;
  iat: number;
  sid: string;
  trialEndsAt?: number | null;
  trialSubscriptionId?: string | null;
};

function sessionKey(sid: string) {
  return `${SESSION_KEY_PREFIX}${sid}`;
}

function isValidRedisSession(x: any): x is RedisSession {
  if (!x || typeof x !== "object") return false;
  if (x.v !== 1) return false;
  if (typeof x.email !== "string" || !x.email.includes("@")) return false;
  if (typeof x.stripeCustomerId !== "string" || !x.stripeCustomerId.startsWith("cus_")) return false;
  if (typeof x.sid !== "string" || x.sid.length < 10) return false;
  return true;
}

async function readRedisSessionFromRequest(req: Request): Promise<RedisSession | null> {
  const cookies = parseCookies(req.headers.get("cookie"));
  const sid = String(cookies[SESSION_ID_COOKIE_NAME] ?? "").trim();
  if (!sid) return null;

  try {
    const redis = getRedis();
    const got = await redis.get<RedisSession>(sessionKey(sid));
    return got && isValidRedisSession(got) ? got : null;
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
 * Cancelling helper
 * Stripe can mean "will cancel" by:
 * - cancel_at_period_end === true
 * - OR cancel_at is a future timestamp (even if cancel_at_period_end is false)
 * -------------------------- */
function isCancellingFromSnapshot(snap: EntitlementSnapshot, nowSec: number) {
  return snap.cancelAtPeriodEnd === true || (typeof snap.cancelAt === "number" && snap.cancelAt > nowSec);
}

function isCancellingFromSub(sub: Stripe.Subscription, nowSec: number) {
  const cancelAtPeriodEnd =
    typeof (sub as any)?.cancel_at_period_end === "boolean" ? (sub as any).cancel_at_period_end : false;

  const cancelAt = typeof (sub as any)?.cancel_at === "number" ? (sub as any).cancel_at : null;

  return cancelAtPeriodEnd === true || (typeof cancelAt === "number" && cancelAt > nowSec);
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
      cancelAt: snap.cancelAt ?? null,
    };
  }

  // Active -> allow (but distinguish if cancelling)
  if (snap.status === "active") {
    const cancelling = isCancellingFromSnapshot(snap, nowSec);
    return {
      canExplain: true,
      reason: cancelling ? "subscription_cancelled" : "subscription_active",
      stripeCustomerId: snap.customerId,
      email,
      trialEndsAt: snap.trialEndsAt ?? null,
      activeSubscriptionId: snap.subscriptionId ?? null,
      cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: snap.currentPeriodEnd ?? null,
      cancelAt: snap.cancelAt ?? null,
    };
  }

  // Optional: Past due but still within current paid period -> allow (less disruptive)
  if (snap.status === "past_due" && typeof snap.currentPeriodEnd === "number" && snap.currentPeriodEnd > nowSec) {
    const cancelling = isCancellingFromSnapshot(snap, nowSec);
    return {
      canExplain: true,
      reason: cancelling ? "subscription_cancelled" : "subscription_active",
      stripeCustomerId: snap.customerId,
      email,
      trialEndsAt: snap.trialEndsAt ?? null,
      activeSubscriptionId: snap.subscriptionId ?? null,
      cancelAtPeriodEnd: snap.cancelAtPeriodEnd ?? null,
      currentPeriodEnd: snap.currentPeriodEnd ?? null,
      cancelAt: snap.cancelAt ?? null,
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
    cancelAt: snap.cancelAt ?? null,
  };
}

/** --------------------------
 * Multi-currency plan filter (GBP/EUR/USD)
 * If none are set, we do NOT filter.
 * -------------------------- */
function getWantedMonthlyPriceIds(): string[] {
  const ids = [
    String(process.env.STRIPE_PRICE_ID_MONTHLY_GBP ?? "").trim(),
    String(process.env.STRIPE_PRICE_ID_MONTHLY_EURO ?? "").trim(),
    String(process.env.STRIPE_PRICE_ID_MONTHLY_USD ?? "").trim(),
  ].filter(Boolean);

  return Array.from(new Set(ids));
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
  const wantedPriceIds = getWantedMonthlyPriceIds();

  const isWantedPlan = (s: Stripe.Subscription) => {
    if (wantedPriceIds.length === 0) return true; // if env missing, don’t filter
    const items = s.items?.data ?? [];
    return items.some((it) => {
      const price = it.price as any;
      const id = typeof price?.id === "string" ? price.id : "";
      return !!id && wantedPriceIds.includes(id);
    });
  };

  const relevant = subs.data.filter(isWantedPlan);
  const pool = relevant.length > 0 ? relevant : subs.data;

  const active =
    pool.find((s) => s.status === "active" && (s as any).cancel_at_period_end !== true) ??
    pool.find((s) => s.status === "active");

  const pastDue = pool.find((s) => {
    if (s.status !== "past_due") return false;
    const cpe = getCurrentPeriodEndFromSubscription(s);
    return typeof cpe === "number" && cpe > nowSec;
  });

  const trialing = pool.find(
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
    cancelAt: typeof (chosen as any)?.cancel_at === "number" ? (chosen as any).cancel_at : null,
    cancelAtPeriodEnd:
      typeof (chosen as any)?.cancel_at_period_end === "boolean" ? (chosen as any).cancel_at_period_end : null,
    lastInvoiceStatus: "unknown",
    lastPaymentFailed: false,
    updatedAt: nowSec,
  };

  if (active) {
    const cancelAtPeriodEnd =
      typeof (active as any)?.cancel_at_period_end === "boolean" ? (active as any).cancel_at_period_end : false;

    const cancelAt = typeof (active as any)?.cancel_at === "number" ? (active as any).cancel_at : null;

    const cancelling = cancelAtPeriodEnd === true || (typeof cancelAt === "number" && cancelAt > nowSec);

    return {
      ent: {
        canExplain: true,
        reason: cancelling ? "subscription_cancelled" : "subscription_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: active.trial_end ?? null,
        activeSubscriptionId: active.id,
        cancelAtPeriodEnd:
          typeof (active as any)?.cancel_at_period_end === "boolean" ? (active as any).cancel_at_period_end : null,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(active),
        cancelAt,
      },
      snap,
    };
  }

  if (pastDue) {
    const cancelAtPeriodEnd =
      typeof (pastDue as any)?.cancel_at_period_end === "boolean" ? (pastDue as any).cancel_at_period_end : false;

    const cancelAt = typeof (pastDue as any)?.cancel_at === "number" ? (pastDue as any).cancel_at : null;

    const cancelling = cancelAtPeriodEnd === true || (typeof cancelAt === "number" && cancelAt > nowSec);

    return {
      ent: {
        canExplain: true,
        reason: cancelling ? "subscription_cancelled" : "subscription_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: pastDue.trial_end ?? null,
        activeSubscriptionId: pastDue.id,
        cancelAtPeriodEnd:
          typeof (pastDue as any)?.cancel_at_period_end === "boolean" ? (pastDue as any).cancel_at_period_end : null,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(pastDue),
        cancelAt,
      },
      snap,
    };
  }

  if (trialing) {
    const cancelAtPeriodEnd =
      typeof (trialing as any)?.cancel_at_period_end === "boolean" ? (trialing as any).cancel_at_period_end : null;

    const cancelAt = typeof (trialing as any)?.cancel_at === "number" ? (trialing as any).cancel_at : null;

    return {
      ent: {
        canExplain: true,
        reason: "trial_active",
        stripeCustomerId: customerId,
        email,
        trialEndsAt: trialing.trial_end ?? null,
        activeSubscriptionId: trialing.id,
        cancelAtPeriodEnd,
        currentPeriodEnd: getCurrentPeriodEndFromSubscription(trialing),
        cancelAt,
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
      cancelAt: null,
    },
    snap,
  };
}

/** --------------------------
 * Main API
 * -------------------------- */
export async function getEntitlementFromRequest(req: Request): Promise<EntitlementResult> {
  const nowSec = Math.floor(Date.now() / 1000);

  // Always try to parse/verify the session first so we can use it as a fallback.
  let session: SessionPayload | null = null; // legacy fallback only
  let email = "";
  let stripeCustomerId = "";

  try {
    // ✅ 0) Preferred: Redis session via emn_sid
    const redisSession = await readRedisSessionFromRequest(req);
    if (redisSession) {
      email = String(redisSession.email ?? "").trim().toLowerCase();
      stripeCustomerId = String(redisSession.stripeCustomerId ?? "").trim();

      if (!stripeCustomerId) return { canExplain: false, reason: "no_customer" };

      // 1) Session-based trial hint (Redis)
      if (typeof redisSession.trialEndsAt === "number" && redisSession.trialEndsAt > nowSec) {
        const snap = await readSnapshot(stripeCustomerId);

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
          const stripe = getStripe();
          const subs = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "all",
            limit: 50,
            expand: ["data.items.data.price"],
          });

          const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
          writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

          if (ent.reason === "trial_active") return ent;
        }
        // fall through
      }

      // 2) Redis snapshot fast-path (webhook cache)
      const snap = await readSnapshot(stripeCustomerId);
      if (snap && snap.status !== "unknown") {
        if (snap.status === "trialing" || snap.status === "active") {
          const stripe = getStripe();
          const subs = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "all",
            limit: 50,
            expand: ["data.items.data.price"],
          });

          const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
          writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);
          return ent;
        }

        return entitlementFromSnapshot(snap, email, nowSec);
      }

      // 3) Stripe fallback (authoritative)
      const stripe = getStripe();
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 50,
        expand: ["data.items.data.price"],
      });

      const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
      writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

      return ent;
    }

    // ✅ 0b) Fallback: legacy signed cookie emn_session
    const magicSecret = getMagicSecret();

    const cookies = parseCookies(req.headers.get("cookie"));
    const raw = cookies[SESSION_COOKIE_NAME];
    if (!raw) return { canExplain: false, reason: "missing_session" };

    session = verifySignedValue(raw, magicSecret);
    if (!session) return { canExplain: false, reason: "invalid_session" };

    stripeCustomerId = String(session.stripeCustomerId ?? "").trim();
    if (!stripeCustomerId) return { canExplain: false, reason: "no_customer" };

    email = String(session.email ?? "").trim().toLowerCase();

    // 1) Session-based trial hint (legacy cookie)
    if (typeof session.trialEndsAt === "number" && session.trialEndsAt > nowSec) {
      const snap = await readSnapshot(stripeCustomerId);

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
        const stripe = getStripe();
        const subs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "all",
          limit: 50,
          expand: ["data.items.data.price"],
        });

        const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
        writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

        if (ent.reason === "trial_active") return ent;
      }
      // fall through
    }

    // 2) Redis snapshot fast-path (written by webhook)
    const snap = await readSnapshot(stripeCustomerId);
    if (snap && snap.status !== "unknown") {
      if (snap.status === "trialing" || snap.status === "active") {
        const stripe = getStripe();
        const subs = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "all",
          limit: 50,
          expand: ["data.items.data.price"],
        });

        const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
        writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);
        return ent;
      }

      return entitlementFromSnapshot(snap, email, nowSec);
    }

    // 3) Stripe fallback (authoritative)
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 50,
      expand: ["data.items.data.price"],
    });

    const { ent, snap: snapToWrite } = entitlementFromStripeList(stripeCustomerId, email, nowSec, subs);
    writeSnapshot(stripeCustomerId, snapToWrite).catch(() => null);

    return ent;
  } catch (e) {
    // ✅ Reliability fallback:
    // If Stripe/Redis fails temporarily, trust session hints enough to avoid locking users out.
    // Priority: Redis session -> legacy signed cookie.

    try {
      const redisSession = await readRedisSessionFromRequest(req);
      if (redisSession) {
        const sidEmail = String(redisSession.email ?? "").trim().toLowerCase();
        const sidCustomerId = String(redisSession.stripeCustomerId ?? "").trim();

        if (sidCustomerId && typeof redisSession.trialEndsAt === "number" && redisSession.trialEndsAt > nowSec) {
          return {
            canExplain: true,
            reason: "trial_active",
            stripeCustomerId: sidCustomerId,
            email: sidEmail,
            trialEndsAt: redisSession.trialEndsAt ?? null,
            activeSubscriptionId: redisSession.trialSubscriptionId ?? null,
            cancelAtPeriodEnd: null,
            currentPeriodEnd: null,
            cancelAt: null,
          };
        }
      }
    } catch {
      // ignore
    }

    if (session && stripeCustomerId) {
      if (typeof session.trialEndsAt === "number" && session.trialEndsAt > nowSec) {
        return {
          canExplain: true,
          reason: "trial_active",
          stripeCustomerId,
          email,
          trialEndsAt: session.trialEndsAt ?? null,
          activeSubscriptionId: session.trialSubscriptionId ?? null,
          cancelAtPeriodEnd: null,
          currentPeriodEnd: null,
          cancelAt: null,
        };
      }
    }

    return { canExplain: false, reason: "stripe_error" };
  }
}