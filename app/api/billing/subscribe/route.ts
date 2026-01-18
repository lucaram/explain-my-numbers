// app\api\billing\subscribe\route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;

  const r = await fetch(`${origin}/api/billing/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const j = await r.json().catch(() => ({}));
  const url = j?.url || j?.checkoutUrl;

  if (!r.ok || !url) {
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.redirect(url);
}
