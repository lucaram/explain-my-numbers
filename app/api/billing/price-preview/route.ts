// app/api/billing/price-preview/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

function getRequestCountry(req: Request): string {
  const c1 = req.headers.get("x-vercel-ip-country");
  if (c1 && c1.trim()) return c1.trim().toUpperCase();

  const c2 = req.headers.get("cf-ipcountry");
  if (c2 && c2.trim()) return c2.trim().toUpperCase();

  return "US";
}

function pickCurrencyForCountry(country: string): "gbp" | "eur" | "usd" {
  if (country === "GB") return "gbp";
  if (EU_COUNTRIES.has(country)) return "eur";
  return "usd"; // US + rest of world
}

function symbolForCurrency(cur: "gbp" | "eur" | "usd") {
  if (cur === "gbp") return "£";
  if (cur === "eur") return "€";
  return "$";
}

/**
 * Price preview endpoint:
 * - Does NOT call Stripe (fast + reliable)
 * - Returns what your UI should display based on country rules
 * - Amounts are your chosen marketing prices (4.99 in each currency)
 */
export async function GET(req: Request) {
  try {
const url = new URL(req.url);

const forced =
  process.env.NODE_ENV === "development"
    ? url.searchParams.get("country")
    : null;

const country = (forced || getRequestCountry(req)).toUpperCase();


    const currency = pickCurrencyForCountry(country);

    // You currently want "4.99" in each supported currency.
    // If you ever change amounts per currency, update this mapping.
    const amount = currency === "gbp" ? 4.99 : 5.99;


    return NextResponse.json({
      ok: true,
      country,
      currency,
      symbol: symbolForCurrency(currency),
      amount,
      interval: "month",
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error." },
      { status: 500 }
    );
  }
}
