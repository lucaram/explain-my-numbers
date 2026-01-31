"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";

type VerifyResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason?: string };

function likelyInAppBrowser(ua: string) {
  const s = ua.toLowerCase();

  // Common in-app / webview signals across Android + iOS mail clients
  // (Gmail, Outlook, Yahoo Mail, LinkedIn, Twitter/X, Facebook, Instagram, etc.)
  return (
    s.includes("wv") || // Android WebView
    s.includes("webview") ||
    s.includes("gsa") || // Google Search App
    s.includes("gmail") ||
    s.includes("outlook") ||
    s.includes("microsoft office") ||
    s.includes("fbav") ||
    s.includes("instagram") ||
    s.includes("line/") ||
    s.includes("twitter") ||
    s.includes("linkedin") ||
    s.includes("snapchat") ||
    s.includes("pinterest")
  );
}

// Best-effort: open current URL in Chrome on Android via intent.
// Will fail silently on some devices; we always show Copy Link fallback too.
function openInChromeAndroid(url: string) {
  try {
    const cleaned = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${cleaned}#Intent;scheme=https;package=com.android.chrome;end`;
  } catch {}
}

async function probeCookiesAndSession(): Promise<boolean> {
  // Use an endpoint that requires session cookie and returns something stable.
  // If you don't want to depend on billing/status here, create /api/auth/session-probe
  // that checks the sid cookie -> redis session and returns { ok: true }.
  try {
    const r = await fetch("/api/billing/status", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });

    if (!r.ok) return false;
    const j = await r.json().catch(() => null);

    // Adjust this check to your real billing/status shape.
    // We just need a strong signal that the session cookie is present/usable.
    if (!j) return false;

    // Examples of acceptable signals (pick what your endpoint actually returns):
    // - cookie_present: true
    // - hasSession: true
    // - customerId exists
    // - any authenticated marker
    if (j.cookie_present === true) return true;
    if (j.hasSession === true) return true;
    if (typeof j.customerId === "string" && j.customerId.startsWith("cus_")) return true;

    // Fallback: if endpoint returns a known billing object when logged in
    if (j.ok === true) return true;

    return false;
  } catch {
    return false;
  }
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // If verification fails or cookies don't persist, we switch to "open in browser" mode.
  const [mode, setMode] = useState<"verifying" | "need_browser" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token") || "";
  const currentUrl = useMemo(() => {
    // Keep the token in the URL so the user can open/copy it
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const ua = useMemo(() => (typeof navigator !== "undefined" ? navigator.userAgent || "" : ""), []);
  const isAndroid = useMemo(() => /android/i.test(ua), [ua]);
  const isIOS = useMemo(() => /iphone|ipad|ipod/i.test(ua), [ua]);
  const isLikelyInApp = useMemo(() => likelyInAppBrowser(ua), [ua]);

  async function verifyNow() {
    if (!token) {
      setError("missing_token");
      setMode("error");
      return;
    }

    setLoading(true);
    setError(null);
    setMode("verifying");

    try {
      const r = await fetch("/api/auth/verify-magic-link", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const j = (await r.json().catch(() => null)) as VerifyResult | null;

      if (!r.ok || !j || (j as any).ok !== true || !(j as any).redirectTo) {
        setError((j as any)?.reason || "verification_failed");
        setMode("error");
        setLoading(false);
        return;
      }

      // ✅ Critical: confirm cookies actually "stuck" in this browser context.
      // If not, we are in an isolated in-app browser and must ask user to open in real browser.
      const ok = await probeCookiesAndSession();

      if (!ok) {
        // If we're in an in-app browser, this is expected. Guide user to open externally.
        setMode("need_browser");
        setLoading(false);
        return;
      }

      // ✅ Cookies are usable here → safe to leave this page.
      window.location.assign((j as any).redirectTo);
    } catch {
      setError("network_error");
      setMode("error");
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
    } catch {
      // fallback: best-effort
      const text = currentUrl || window.location.href;
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  useEffect(() => {
    // Auto-start verification on load
    verifyNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] p-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        {mode === "verifying" ? "Verifying…" : mode === "need_browser" ? "Open in your browser" : "Action needed"}
      </h1>

      {mode === "verifying" && (
        <p className="mb-8 max-w-xs text-zinc-600">Please wait while we sign you in.</p>
      )}

      {mode === "need_browser" && (
        <p className="mb-6 max-w-xs text-zinc-600">
          Your email app opened an in-app browser that can’t reliably share sign-in cookies with Safari/Chrome.
          <br />
          <span className="font-semibold text-zinc-800">Open this link in your main browser</span> to finish signing in.
        </p>
      )}

      {mode === "error" && (
        <p className="mb-6 max-w-xs text-zinc-600">
          We couldn’t complete sign-in automatically.
          <br />
          <span className="text-zinc-500">({error ?? "unknown_error"})</span>
        </p>
      )}

      {/* Primary actions */}
      <div className="w-full max-w-xs space-y-3">
        {mode === "verifying" ? (
          <button
            disabled
            className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg opacity-70"
          >
            {loading ? "Verifying…" : "Verifying…"}
          </button>
        ) : (
          <>
            {/* Best effort “Open in browser” */}
            {isAndroid ? (
              <button
                onClick={() => openInChromeAndroid(currentUrl || window.location.href)}
                className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg transition-all active:scale-95"
              >
                Open in Chrome
              </button>
            ) : isIOS ? (
              <button
                onClick={copyLink}
                className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg transition-all active:scale-95"
              >
                Copy link (open in Safari)
              </button>
            ) : (
              <button
                onClick={copyLink}
                className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg transition-all active:scale-95"
              >
                Copy link
              </button>
            )}

            <button
              onClick={verifyNow}
              disabled={!token}
              className="w-full rounded-full bg-white py-4 font-semibold text-zinc-900 shadow-[0_10px_25px_rgba(0,0,0,0.08)] ring-1 ring-zinc-200 transition-all active:scale-95 disabled:opacity-50"
            >
              Try verification again
            </button>
          </>
        )}

        {/* Always show copy fallback when likely in-app */}
        {(mode === "need_browser" || isLikelyInApp) && (
          <button
            onClick={copyLink}
            className="w-full rounded-full bg-white py-3.5 font-semibold text-zinc-900 ring-1 ring-zinc-200 transition-all active:scale-95"
          >
            Copy link
          </button>
        )}
      </div>

      {/* Guidance */}
      {mode !== "verifying" && (
        <p className="mt-6 max-w-xs text-xs text-zinc-500">
          Tip: In your email app, tap the <strong>⋮</strong> menu (or share icon) and choose{" "}
          <strong>Open in browser</strong> / <strong>Open in Chrome</strong> / <strong>Open in Safari</strong>.
          <br />
          After opening in the browser, the sign-in will complete reliably.
        </p>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ConfirmContent />
    </Suspense>
  );
}
