// src/app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getEntitlementFromRequest } from "@/lib/entitlements";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createHash } from "crypto";

export const runtime = "nodejs";

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

export async function GET(req: Request) {
  // ✅ Lightweight IP rate limit (protects Stripe/Redis work inside entitlement)
  const redis = Redis.fromEnv();
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"), // 60/min/IP
    analytics: false,
    prefix: "emn:ent:rl",
  });

  const ip = getClientIp(req);
  const rl = await ratelimit.limit(`ip:${ip}`);
  if (!rl.success) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again soon.", error_code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const ent = await getEntitlementFromRequest(req);

  // ✅ Frontend expects possible: "subscription_cancelled"
  // We only map to that if ent exposes cancelAtPeriodEnd=true.
  // (If entitlements.ts doesn't include it yet, this remains undefined and we won't map.)
  const cancelAtPeriodEnd =
    typeof (ent as any)?.cancelAtPeriodEnd === "boolean" ? (ent as any).cancelAtPeriodEnd : null;

  const currentPeriodEnd =
    typeof (ent as any)?.currentPeriodEnd === "number" ? (ent as any).currentPeriodEnd : null;

  const mappedReason =
    ent.reason === "subscription_active" && cancelAtPeriodEnd === true
      ? "subscription_cancelled"
      : ent.reason;

  return NextResponse.json({
    ok: true,
    canExplain: ent.canExplain,
    reason: mappedReason,
    trialEndsAt: ent.trialEndsAt ?? null,

    // ✅ extra optional fields (harmless, helps UI later)
    cancelAtPeriodEnd,
    currentPeriodEnd,
    activeSubscriptionId: (ent as any)?.activeSubscriptionId ?? null,
  });
}
