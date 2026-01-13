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

  const isProd = process.env.NODE_ENV === "production";
  const proto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();

  // --------------------------
  // CSP (production-ready for Next.js)
  // --------------------------
  //
  // Key decisions:
  // - We DO NOT enforce a nonce-only policy yet, because Next won't automatically
  //   apply this nonce to all script tags unless you explicitly wire it in.
  // - Production stays strict without breaking Next runtime.
  // - Dev gets the minimal relaxations to avoid HMR/Fast Refresh CSP breakage.
  //
  // If you later wire the nonce into your scripts, you can tighten script-src
  // (remove unsafe-inline / unsafe-eval) and rely on nonce.
  //
  const scriptSrc = isProd
    ? // Production: avoid breaking Next runtime; keep strict-ish baseline.
      // If you later wire nonce into scripts, you can remove 'unsafe-inline'.
      "script-src 'self' 'unsafe-inline'"
    : // Dev: allow eval + ws for HMR/Fast Refresh and dev tooling.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const connectSrc = isProd
    ? // Production: same-origin + https for API calls / third-party APIs over TLS.
      "connect-src 'self' https:"
    : // Dev: allow ws/wss for HMR.
      "connect-src 'self' https: ws: wss:";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",

    // Styles: Next can inject inline styles; keep for compatibility.
    "style-src 'self' 'unsafe-inline'",

    // Scripts (see above)
    scriptSrc,

    // Images + blobs/data for previews/icons
    "img-src 'self' data: blob:",

    // Fonts (self + data)
    "font-src 'self' data:",

    // Network / API calls
    connectSrc,

    // Uploads / media
    "media-src 'self' blob:",

    // Workers (safe to allow blob for libs)
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
  if (isProd && proto === "https") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Optional: expose nonce for future wiring (not enforced by CSP above yet)
  res.headers.set("x-nonce", nonce);

  return res;
}

// Apply to everything (pages + api) except Next internals/static assets.
// Keeping /api included is fine (mostly irrelevant for CSP, but harmless).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
