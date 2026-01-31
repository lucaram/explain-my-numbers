"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";

type VerifyResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason?: string };

function likelyInAppBrowser(ua: string) {
  const s = ua.toLowerCase();
  return (
    s.includes("wv") || // Android WebView
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

    // Loose fallback (keep as-is)
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
        opacity="0.18"
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

function BrandMark() {
  return (
    <div
      className={[
        "grid h-10 w-10 place-items-center rounded-2xl",
        "bg-white/80 ring-1 ring-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
        "backdrop-blur-xl",
      ].join(" ")}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 19V5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 19V11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 19V7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 19V14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M20 19V9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
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

  const title =
    mode === "verifying"
      ? "Verifying…"
      : mode === "need_browser"
      ? "Open in your browser"
      : "Action needed";

  const subtitle =
    mode === "verifying"
      ? "Please wait while we sign you in."
      : mode === "need_browser"
      ? "Your email app opened an in-app browser that can’t reliably share sign-in cookies with Safari/Chrome. Open this link in your main browser to finish signing in."
      : "We couldn’t complete sign-in automatically.";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background: soft app-like wash */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#f6fbff]" />
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute -bottom-48 left-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute -bottom-64 right-[-160px] h-[560px] w-[560px] rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.85),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.85),transparent_55%)]" />
      </div>

      {/* Top bar (light, minimal) */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 select-none">
            <BrandMark />
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
                Explain My Numbers
              </span>
              <span className="text-[13px] text-zinc-500">2.0</span>
            </div>
          </div>

          {/* Small chip */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/75 backdrop-blur-xl ring-1 ring-black/5 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <span className="h-2 w-2 rounded-full bg-sky-500/80" />
            <span className="text-[12px] font-semibold text-zinc-700">
              {mode === "verifying" ? "Secure sign-in" : mode === "need_browser" ? "Browser needed" : "Help"}
            </span>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div
            className={[
              "rounded-[2.25rem] border border-black/5",
              "bg-white/75 backdrop-blur-2xl",
              "shadow-[0_32px_80px_-24px_rgba(0,0,0,0.18)]",
              "overflow-hidden",
            ].join(" ")}
          >
            {/* subtle top beam */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-emerald-400/18 to-cyan-400/20" />
              <div className="relative px-6 py-5">
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "grid h-12 w-12 place-items-center rounded-2xl",
                      "bg-white/80 ring-1 ring-black/5",
                      "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
                    ].join(" ")}
                  >
                    {mode === "verifying" ? (
                      <Spinner className="h-6 w-6 text-sky-700" />
                    ) : mode === "need_browser" ? (
                      <svg className="h-6 w-6 text-sky-700" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 3a9 9 0 1 0 9 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 12l6-3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-sky-700" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 9v4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 17h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.3 3.4h3.4L22 18.5a2 2 0 0 1-1.7 3H3.7a2 2 0 0 1-1.7-3L10.3 3.4Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight text-zinc-900">
                        {title}
                      </h1>

                      {mode === "verifying" && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 ring-1 ring-black/5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[12px] font-semibold text-zinc-700">In progress</span>
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-600">
                      {mode === "error" ? (
                        <>
                          {subtitle}
                          <br />
                          <span className="text-zinc-500">({error ?? "unknown_error"})</span>
                        </>
                      ) : (
                        subtitle
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-4">
              <div className="w-full space-y-3">
                {mode === "verifying" ? (
                  <button
                    disabled
                    className={[
                      "w-full rounded-full py-4",
                      "bg-black text-white",
                      "shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
                      "opacity-90",
                    ].join(" ")}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <Spinner className="h-5 w-5 text-white" />
                      <span className="font-semibold">Verifying</span>
                    </span>
                  </button>
                ) : (
                  <>
                    {isAndroid ? (
                      <button
                        onClick={() => openInChromeAndroid(currentUrl || window.location.href)}
                        className={[
                          "w-full rounded-full py-4 font-semibold text-white",
                          "bg-black",
                          "shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
                          "transition-all active:scale-[0.98]",
                        ].join(" ")}
                      >
                        Open in Chrome
                      </button>
                    ) : isIOS ? (
                      <button
                        onClick={copyLink}
                        className={[
                          "w-full rounded-full py-4 font-semibold text-white",
                          "bg-black",
                          "shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
                          "transition-all active:scale-[0.98]",
                        ].join(" ")}
                      >
                        Copy link (open in Safari)
                      </button>
                    ) : (
                      <button
                        onClick={copyLink}
                        className={[
                          "w-full rounded-full py-4 font-semibold text-white",
                          "bg-black",
                          "shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
                          "transition-all active:scale-[0.98]",
                        ].join(" ")}
                      >
                        Copy link
                      </button>
                    )}

                    <button
                      onClick={verifyNow}
                      disabled={!token}
                      className={[
                        "w-full rounded-full py-4 font-semibold text-zinc-900",
                        "bg-white/90 ring-1 ring-black/10",
                        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
                        "transition-all active:scale-[0.98] disabled:opacity-50",
                      ].join(" ")}
                    >
                      Try verification again
                    </button>
                  </>
                )}

                {(mode === "need_browser" || isLikelyInApp) && mode !== "verifying" && (
                  <button
                    onClick={copyLink}
                    className={[
                      "w-full rounded-full py-3.5 font-semibold text-zinc-900",
                      "bg-white/80 ring-1 ring-black/10",
                      "transition-all active:scale-[0.98]",
                    ].join(" ")}
                  >
                    Copy link
                  </button>
                )}
              </div>

              {mode !== "verifying" && (
                <div className="mt-5 rounded-2xl bg-white/60 ring-1 ring-black/5 px-4 py-3">
                  <p className="text-[12px] leading-relaxed text-zinc-600">
                    Tip: In your email app, tap the <strong>⋮</strong> menu (or share icon) and choose{" "}
                    <strong>Open in browser</strong> / <strong>Open in Chrome</strong> /{" "}
                    <strong>Open in Safari</strong>. After opening in the browser, sign-in will complete reliably.
                  </p>
                </div>
              )}

              {/* Tiny footer */}
              <div className="mt-6 flex items-center justify-between text-[11px] text-zinc-500">
                <span>© 2026 EXPLAIN LTD</span>
                <span className="opacity-80">PRIVACY</span>
              </div>
            </div>
          </div>

          {/* Small helper line (subtle) */}
          {mode === "verifying" && (
            <p className="mt-4 text-center text-[12px] text-zinc-500">
              Secure sign-in in progress…
            </p>
          )}
        </div>
      </div>
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
