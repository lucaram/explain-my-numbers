"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";

type VerifyResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason?: string };

function likelyInAppBrowser(ua: string) {
  const s = ua.toLowerCase();

  return (
    s.includes("wv") ||
    s.includes("webview") ||
    s.includes("gsa") ||
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

function openInChromeAndroid(url: string) {
  try {
    const cleaned = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${cleaned}#Intent;scheme=https;package=com.android.chrome;end`;
  } catch {}
}

async function probeCookiesAndSession(): Promise<boolean> {
  try {
    const r = await fetch("/api/billing/status", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });

    if (!r.ok) return false;
    const j = await r.json().catch(() => null);
    if (!j) return false;

    if (j.cookie_present === true) return true;
    if (j.hasSession === true) return true;
    if (typeof j.customerId === "string" && j.customerId.startsWith("cus_")) return true;

    if (j.ok === true) return true;

    return false;
  } catch {
    return false;
  }
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConfirmContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"verifying" | "need_browser" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token") || "";
  const currentUrl = useMemo(() => {
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

      const ok = await probeCookiesAndSession();

      if (!ok) {
        setMode("need_browser");
        setLoading(false);
        return;
      }

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

      <div className="w-full max-w-xs space-y-3">
        {mode === "verifying" ? (
          <button
            disabled
            className="w-full rounded-full bg-blue-600 py-4 font-semibold text-white shadow-lg opacity-70"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner className="h-5 w-5 text-white" />
              <span>{loading ? "Verifying…" : "Verifying…"}</span>
            </span>
          </button>
        ) : (
          <>
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

        {(mode === "need_browser" || isLikelyInApp) && (
          <button
            onClick={copyLink}
            className="w-full rounded-full bg-white py-3.5 font-semibold text-zinc-900 ring-1 ring-zinc-200 transition-all active:scale-95"
          >
            Copy link
          </button>
        )}
      </div>

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
