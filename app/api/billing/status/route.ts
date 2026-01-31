// src/app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getEntitlementFromRequest } from "@/lib/entitlements";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SESSION_ID_COOKIE_NAME = process.env.SESSION_ID_COOKIE_NAME || "emn_sid";

/** --------------------------
 * Helpers
 * -------------------------- */

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }

  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();

  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const vercel = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;

  const ua = (req.headers.get("user-agent") ?? "").slice(0, 300);
  const al = (req.headers.get("accept-language") ?? "").slice(0, 200);
  const key = createHash("sha256").update(`${ua}|${al}`).digest("hex").slice(0, 16);

  return `unknown:${key}`;
}

function applyNoStoreHeaders(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

// Simple cookie presence check (no dependency on next/headers cookies())
function hasCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  // quick safe match: "; name=" or beginning "name="
  return raw.includes(`${name}=`); 
}

/** --------------------------
 * Main GET Route
 * -------------------------- */

export async function GET(req: Request) {
  const redis = Redis.fromEnv();

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: false,
    prefix: "emn:ent:rl",
  });

  const ip = getClientIp(req);
  const rl = await ratelimit.limit(`ip:${ip}`);
  if (!rl.success) {
    const res = NextResponse.json(
      { ok: false, error: "Too many requests. Please try again soon.", error_code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
    return applyNoStoreHeaders(res);
  }

  // ✅ Hard signal for the confirm-page probe
  const cookie_present = hasCookie(req, SESSION_ID_COOKIE_NAME);

  const ent = await getEntitlementFromRequest(req);
  const nowSec = Math.floor(Date.now() / 1000);

  // ✅ Try to infer whether entitlement actually resolved a session/customer.
  // Adjust these checks to whatever your ent object exposes reliably.
  const stripeCustomerId =
    typeof (ent as any)?.stripeCustomerId === "string" ? (ent as any).stripeCustomerId : null;

  const hasSession =
    cookie_present && !!stripeCustomerId; // strongest stable signal: cookie arrived AND entitlement resolved customer

  // Extract subscription state from entitlement payload
  const cancelAtPeriodEnd =
    typeof (ent as any)?.cancelAtPeriodEnd === "boolean" ? (ent as any).cancelAtPeriodEnd : null;

  const currentPeriodEnd =
    typeof (ent as any)?.currentPeriodEnd === "number" ? (ent as any).currentPeriodEnd : null;

  const cancelAt = typeof (ent as any)?.cancelAt === "number" ? (ent as any).cancelAt : null;

  const isCancelling = cancelAtPeriodEnd === true || (typeof cancelAt === "number" && cancelAt > nowSec);

  const mappedReason =
    ent.reason === "subscription_active" && isCancelling ? "subscription_cancelled" : ent.reason;

  const res = NextResponse.json({
    ok: true,

    // ✅ cookie probe fields (used by /auth/confirm)
    cookie_present,
    hasSession,
    stripeCustomerId, // optional but very helpful for debugging (safe to return)

    // existing fields
    canExplain: ent.canExplain,
    reason: mappedReason,
    trialEndsAt: ent.trialEndsAt ?? null,

    cancelAtPeriodEnd,
    currentPeriodEnd,
    cancelAt,

    activeSubscriptionId: (ent as any)?.activeSubscriptionId ?? null,
    chosenSubscriptionId: (ent as any)?.activeSubscriptionId ?? null,
  });

  return applyNoStoreHeaders(res);
}
