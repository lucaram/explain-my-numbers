// src/lib/entitlements.ts
import Stripe from "stripe";
import { createHmac, timingSafeEqual } from "crypto";

export type EntitlementResult = {
  canExplain: boolean;
  reason:
    | "missing_session"
    | "invalid_session"
    | "no_customer"
    | "trial_active"
    | "subscription_active"
    | "no_entitlement"
    | "stripe_error";
  stripeCustomerId?: string;
  email?: string;
  trialEndsAt?: number | null;
  activeSubscriptionId?: string | null;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET!;
const SESSION_COOKIE_NAME = "emn_session";

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

function verifySignedValue(value: string) {
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expected = base64url(
    createHmac("sha256", MAGIC_LINK_SECRET).update(body).digest()
  );

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  try {
    const json = base64urlToBuffer(body).toString("utf8");
    return JSON.parse(json) as {
      v: number;
      email: string;
      stripeCustomerId: string;
      trialSubscriptionId?: string | null;
      trialEndsAt?: number | null;
      iat?: number;
      sid?: string;
    };
  } catch {
    return null;
  }
}

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

/**
 * Reads emn_session from Cookie header (server-side), verifies signature,
 * then checks:
 * 1) Session-based trial window (for "no card" trials)
 * 2) Stripe subscriptions (trialing/active)
 */
export async function getEntitlementFromRequest(
  req: Request
): Promise<EntitlementResult> {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !MAGIC_LINK_SECRET) {
      return { canExplain: false, reason: "stripe_error" };
    }

    const cookies = parseCookies(req.headers.get("cookie"));
    const raw = cookies[SESSION_COOKIE_NAME];
    if (!raw) return { canExplain: false, reason: "missing_session" };

    const session = verifySignedValue(raw);
    if (!session) return { canExplain: false, reason: "invalid_session" };

    const stripeCustomerId = session.stripeCustomerId;
    if (!stripeCustomerId) return { canExplain: false, reason: "no_customer" };

    const nowSec = Math.floor(Date.now() / 1000);

    // ✅ Session-based trial (no-card trial) — source of truth if present & in the future
    if (typeof session.trialEndsAt === "number" && session.trialEndsAt > nowSec) {
      return {
        canExplain: true,
        reason: "trial_active",
        stripeCustomerId,
        email: session.email,
        trialEndsAt: session.trialEndsAt,
        activeSubscriptionId: session.trialSubscriptionId ?? null,
      };
    }

    // Primary truth for paid/trialing subs: check subscriptions for this customer.
    // We only care whether there exists any subscription that is:
    // - trialing (trial active)
    // - active (paid active)
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 20,
      expand: ["data.default_payment_method"],
    });

    // trialing: must have trial_end in the future
    const trialing = subs.data.find(
      (s) =>
        s.status === "trialing" &&
        typeof s.trial_end === "number" &&
        s.trial_end > nowSec
    );
    if (trialing) {
      return {
        canExplain: true,
        reason: "trial_active",
        stripeCustomerId,
        email: session.email,
        trialEndsAt: trialing.trial_end ?? null,
        activeSubscriptionId: trialing.id,
      };
    }

    // active: paid subscription active
    const active = subs.data.find((s) => s.status === "active");
    if (active) {
      return {
        canExplain: true,
        reason: "subscription_active",
        stripeCustomerId,
        email: session.email,
        trialEndsAt: active.trial_end ?? null,
        activeSubscriptionId: active.id,
      };
    }

    // If nothing trialing/active, no entitlement.
    return {
      canExplain: false,
      reason: "no_entitlement",
      stripeCustomerId,
      email: session.email,
      trialEndsAt: session.trialEndsAt ?? null,
      activeSubscriptionId: null,
    };
  } catch {
    return { canExplain: false, reason: "stripe_error" };
  }
}
