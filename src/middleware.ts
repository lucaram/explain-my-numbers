// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

function base64Nonce(bytes = 16) {
  // Edge-safe random nonce
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);

  // base64
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s);
}

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const nonce = base64Nonce();

  // ✅ CSP tuned for Next.js + your app (no iframes, browser-only)
  // Notes:
  // - keep 'unsafe-inline' for styles (Next can inject inline styles)
  // - script-src uses a nonce to block random inline scripts
  // - add external analytics/CDNs explicitly if you ever introduce them
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",

    // Next can use inline styles; keep for now.
    "style-src 'self' 'unsafe-inline'",

    // Nonced scripts only
    `script-src 'self' 'nonce-${nonce}'`,

    // Images + blobs/data for previews/icons
    "img-src 'self' data: blob:",

    // Fonts (self + data)
    "font-src 'self' data:",

    // API calls: same-origin + https (allows https third parties if added later)
    "connect-src 'self' https:",

    // Uploads / media
    "media-src 'self' blob:",

    // Workers (safe to allow blob for pdf/render libs if you add them later)
    "worker-src 'self' blob:",

    // PWA manifests if you add later
    "manifest-src 'self'",

    // Only meaningful on HTTPS; harmless locally
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // --- Security headers ---
  res.headers.set("Content-Security-Policy", csp);

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Redundant with CSP frame-ancestors, but fine (belt + braces)
  res.headers.set("X-Frame-Options", "DENY");

  res.headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", ")
  );

  // Nice-to-haves
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // ✅ HSTS (production-only + only when HTTPS at the edge)
  // - Will NOT show on localhost (expected)
  // - On Vercel, x-forwarded-proto is usually "https"
  const proto = req.headers.get("x-forwarded-proto") || "";
  if (process.env.NODE_ENV === "production" && proto === "https") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Optional: expose nonce for future use (only helpful if you later wire it into script tags)
  res.headers.set("x-nonce", nonce);

  return res;
}

// Apply to everything (pages + api) except Next internals/static assets.
// Keeping /api included is important for your endpoints.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
