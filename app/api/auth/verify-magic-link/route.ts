// src/app/api/auth/verify-magic-link/route.ts
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual, createHash } from "crypto";

export const runtime = "nodejs";

const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET!;
const APP_ORIGIN = process.env.APP_ORIGIN!;

// Session cookie (httpOnly). Keep this simple for v1.
const SESSION_COOKIE_NAME = "emn_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (adjust later)

function base64urlToBuffer(s: string) {
  // pad base64url
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

function verifySignedToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, sig] = parts;

  const expectedSig = base64url(
    createHmac("sha256", MAGIC_LINK_SECRET).update(body).digest()
  );

  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  const json = base64urlToBuffer(body).toString("utf8");
  try {
    return JSON.parse(json) as any;
  } catch {
    return null;
  }
}

function safeRedirect(pathWithQuery: string) {
  // We rely on APP_ORIGIN to keep this redirect safe/predictable.
  // Example: https://your-app.vercel.app/?magic=ok
  return NextResponse.redirect(`${APP_ORIGIN}${pathWithQuery}`);
}

export async function GET(req: Request) {
  try {
    if (!MAGIC_LINK_SECRET) {
      return NextResponse.json({ ok: false, error: "Missing MAGIC_LINK_SECRET." }, { status: 500 });
    }
    if (!APP_ORIGIN) {
      return NextResponse.json({ ok: false, error: "Missing APP_ORIGIN." }, { status: 500 });
    }

    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";

    if (!token) {
      return safeRedirect("/?magic=error&reason=missing_token");
    }

    const payload = verifySignedToken(token);
    if (!payload) {
      return safeRedirect("/?magic=error&reason=bad_signature");
    }

    // Basic payload checks
    if (payload.typ !== "magic_link" || payload.v !== 1) {
      return safeRedirect("/?magic=error&reason=bad_payload");
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== "number" || nowSec > payload.exp) {
      return safeRedirect("/?magic=error&reason=expired");
    }

    if (typeof payload.email !== "string" || !payload.email.includes("@")) {
      return safeRedirect("/?magic=error&reason=bad_email");
    }

    if (typeof payload.stripeCustomerId !== "string" || !payload.stripeCustomerId.startsWith("cus_")) {
      return safeRedirect("/?magic=error&reason=bad_customer");
    }

    // Session object (what your backend will trust)
    const session = {
      v: 1,
      email: payload.email,
      stripeCustomerId: payload.stripeCustomerId,
      trialSubscriptionId: payload.trialSubscriptionId ?? null,
      trialEndsAt: payload.trialEndsAt ?? null,
      // issued-at for session (not the token)
      iat: nowSec,
      // a stable, privacy-friendly id you can log later if needed
      sid: base64url(createHash("sha256").update(`${payload.stripeCustomerId}:${payload.email}`).digest()).slice(0, 22),
    };

    const sessionJson = JSON.stringify(session);
    const sessionB64 = base64url(sessionJson);

    // Sign the session cookie value (so it can’t be tampered with client-side)
    const sessionSig = base64url(
      createHmac("sha256", MAGIC_LINK_SECRET).update(sessionB64).digest()
    );
    const cookieValue = `${sessionB64}.${sessionSig}`;

    const res = safeRedirect("/?magic=ok");

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      sameSite: "lax",
      secure: APP_ORIGIN.startsWith("https://"),
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return res;
  } catch {
    return safeRedirect("/?magic=error&reason=server");
  }
}
