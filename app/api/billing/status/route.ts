import { NextResponse } from "next/server";
import { getEntitlementFromRequest } from "@/lib/entitlements";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const ent = await getEntitlementFromRequest(req);

  // Keep payload tiny + UI-friendly
  return NextResponse.json({
    ok: true,
    canExplain: ent.canExplain,
    reason: ent.reason, // trial_active | subscription_active | no_entitlement | missing_session | ...
    trialEndsAt: ent.trialEndsAt ?? null, // unix seconds (or null)
  });
}
