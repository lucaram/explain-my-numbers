// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const isProd = process.env.NODE_ENV === "production";
  const proto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();

  // --------------------------
  // CSP (Option A: Next.js-safe)
  // --------------------------
  const scriptSrc = isProd
    ? // Production: compatible with Next.js runtime/hydration across deployments.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : // Dev: allow eval for tooling/HMR.
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

    // Scripts (Next.js-safe)
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

  // Redundant with CSP frame-ancestors, but fine
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
  if (isProd && proto === "https") {
    res.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000" //if you use your subdomain rather than vercel use  "max-age=31536000; includeSubDomains; preload" and consider nonce. 
    );
  }

  return res;
}

// Apply to everything (pages + api) except Next internals/static assets.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
