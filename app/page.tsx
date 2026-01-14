// src/app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  RotateCcw,
  Upload,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  BarChart3,
  Shield,
  Loader2,
  X,
  Pencil,
  AlertTriangle,
  FileText,
  CreditCard,
  Mail,
  ArrowRight,
} from "lucide-react";

/** TYPES & UTILS */
type Theme = "light" | "dark";

type WarningCategory = {
  key: string;
  label: string;
  count: number;
  examples: string[];
};

type ExplainMeta = {
  upload?: {
    filename?: string;
    mime?: string;
    size_bytes?: number;
    kind?: string; // "excel" | "csv" | ...
    chosen_sheet?: string;
    chosen_score?: number;
    sheets?: string[];
    diagnostics?: any;
  };
};

type ExplainOk = {
  ok: true;
  explanation: string;
  warnings?: {
    total: number;
    categories: WarningCategory[];
  };
  meta?: ExplainMeta;
};

type ExplainErr = {
  ok: false;
  error: string;
  error_code?: string;
  reason?: string;
};

type ExplainResult = ExplainOk | ExplainErr;

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

/** ✅ Frontend hard limit aligned with backend (no truncation) */
const MAX_INPUT_CHARS = 50_000;

/**
 * ✅ Gate token cache (short-lived)
 * - We fetch /api/gate, store token + expiry in memory (and sessionStorage as a fallback)
 * - Always send X-EMN-Gate when calling /api/explain (file + text)
 * - If /api/explain returns 401 / GATE_REQUIRED, refresh token once and retry
 */
type GateResponseOk = { ok: true; gate_token: string; expires_in_s?: number };
type GateResponseErr = { ok: false; error: string; error_code?: string };
type GateResponse = GateResponseOk | GateResponseErr;

const GATE_HEADER = "X-EMN-Gate";
const GATE_CACHE_KEY = "emn_gate_cache_v1";
const DEFAULT_GATE_TTL_MS = 5 * 60 * 1000;

function nowMs() {
  return Date.now();
}

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function readGateFromSession(): { token: string; expMs: number } | null {
  if (typeof window === "undefined") return null;
  const parsed = safeJsonParse<{ token: string; expMs: number }>(sessionStorage.getItem(GATE_CACHE_KEY));
  if (!parsed?.token || !parsed?.expMs) return null;
  if (parsed.expMs <= nowMs() + 5_000) return null;
  return parsed;
}

function writeGateToSession(token: string, expMs: number) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GATE_CACHE_KEY, JSON.stringify({ token, expMs }));
  } catch {
    // ignore
  }
}

/**
 * Evidence strength parser (bulletproof)
 */
function parseEvidenceStrength(explanation: string): { level: "Low" | "Medium" | "High" | null; note: string } {
  const text = String(explanation ?? "").replace(/\r\n/g, "\n");
  const m = text.match(
    /(?:^|\n)\s*Evidence\s*strength\s*:\s*(?:\n\s*)*(Low|Medium|High)\b\s*(?:[:\-–—]\s*)?(.*)$/i
  );
  if (!m) return { level: null, note: "" };

  const levelRaw = (m[1] || "").trim().toLowerCase();
  const note = (m[2] || "").trim();

  if (levelRaw === "high") return { level: "High", note };
  if (levelRaw === "medium") return { level: "Medium", note };
  if (levelRaw === "low") return { level: "Low", note };

  return { level: null, note };
}

function parseEvidencePercent(note: string): number | null {
  const m = String(note ?? "").match(/score\s*=\s*([0-9]*\.?[0-9]+)\s*%?/i);
  if (!m) return null;
  const raw = Number(m[1]);
  if (!Number.isFinite(raw)) return null;
  const pct = raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  return Math.max(0, Math.min(100, pct));
}

function stripScoreFromNote(note: string): string {
  return String(note ?? "")
    .replace(/\(\s*score\s*=\s*[0-9]*\.?[0-9]+\s*%?\s*\)\s*/gi, "")
    .replace(/score\s*=\s*[0-9]*\.?[0-9]+\s*%?\s*;?\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripEvidenceSection(explanation: string) {
  const text = String(explanation ?? "").replace(/\r\n/g, "\n");
  return text.replace(/\n\s*Evidence\s*strength\s*:[\s\S]*$/i, "").trim();
}

function formatScoreToPercent(note: string) {
  return String(note ?? "").replace(/score\s*=\s*(0?\.\d+|1(?:\.0+)?)\b/gi, (_m, raw) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return _m;
    const pct = Math.round(n * 100);
    return `score = ${pct}%`;
  });
}

/**
 * PREMIUM FORMATTER
 */
function ElegantAnalysis({ text, theme }: { text: string; theme: Theme }) {
  const sections = text.split(
    /(Summary:|What changed:|Underlying observations:|Why it likely changed:|What it means:|What NOT to conclude:|Evidence strength:)/g
  );

  let currentHeader = "";

  const rendered = sections.map((part, i) => {
    let trimmed = part.trim();

    if (currentHeader === "Evidence strength:") {
      trimmed = formatScoreToPercent(trimmed);
    }

    if (!trimmed) return null;

    if (trimmed.endsWith(":")) {
      currentHeader = trimmed;
      return null;
    }

    const isHeader = [
      "Summary:",
      "What changed:",
      "Underlying observations:",
      "Why it likely changed:",
      "What it means:",
      "What NOT to conclude:",
      "Evidence strength:",
    ].includes(currentHeader);

    if (isHeader) {
      return (
        <div key={i} className="mb-10 last:mb-0 group">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", theme === "dark" ? "bg-blue-400/60" : "bg-blue-600/50")}
              aria-hidden="true"
            />
            <h4
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.34em]",
                "text-blue-600/80 dark:text-blue-400/80",
                "transition-opacity duration-200 opacity-85 group-hover:opacity-100"
              )}
            >
              {currentHeader.replace("Evidence", "Confidence").replace(":", "")}
            </h4>
          </div>

          <div
            className={cn(
              "text-[15px] md:text-[17px] leading-[1.8] font-medium tracking-[-0.012em]",
              currentHeader === "What NOT to conclude:"
                ? theme === "dark"
                  ? "text-rose-300 italic"
                  : "text-rose-600/90 italic"
                : theme === "dark"
                ? "text-white/92"
                : "text-zinc-800"
            )}
          >
            {currentHeader === "Evidence strength:" ? (
              (() => {
                const parsed = parseEvidenceStrength(`Evidence strength: ${trimmed}`);
                const pct = parseEvidencePercent(parsed.note);
                const cleanNote = stripScoreFromNote(parsed.note);

                const pill = (lvl: "Low" | "Medium" | "High" | null) => {
                  const map: Record<string, string> = {
                    High: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/25",
                    Medium: "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25",
                    Low: "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/25",
                    null: "bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 border-zinc-500/25",
                  };

                  return (
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border",
                        "text-[11px] font-black uppercase tracking-[0.18em]",
                        "shadow-[0_1px_0_rgba(255,255,255,0.32)] dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]",
                        "transition-transform duration-200 will-change-transform",
                        "hover:translate-y-[-1px]",
                        map[lvl ?? "null"]
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          lvl === "High"
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.40)]"
                            : lvl === "Medium"
                            ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.30)]"
                            : lvl === "Low"
                            ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.30)]"
                            : "bg-zinc-400"
                        )}
                      />
                      <span>{lvl ?? "Unknown"}</span>
                      {typeof pct === "number" && (
                        <span
                          className={cn(
                            "ml-1 px-2 py-0.5 rounded-full border text-[10px] font-black tracking-[0.14em]",
                            theme === "dark" ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-black/[0.03]"
                          )}
                        >
                          {pct}%
                        </span>
                      )}
                    </span>
                  );
                };

                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">{pill(parsed.level)}</div>

                    <p
                      className={cn(
                        "text-[15px] md:text-[16px] leading-[1.75] font-medium",
                        theme === "dark" ? "text-white/90" : "text-zinc-800"
                      )}
                    >
                      <span className="font-semibold mr-1">Reason:</span>
                      {cleanNote || trimmed}
                    </p>
                  </div>
                );
              })()
            ) : (
              trimmed.split("\n").map((line, li) => {
                const l = line ?? "";
                const autoBulletHeaders = new Set([
                  "What changed:",
                  "Underlying observations:",
                  "Why it likely changed:",
                  "What it means:",
                  "What NOT to conclude:",
                  "Evidence strength:",
                ]);

                const forceBullet = autoBulletHeaders.has(currentHeader);
                const isBullet = forceBullet || l.trim().startsWith("-") || l.trim().startsWith("•");
                const cleaned = l.trim().replace(/^[-•]\s*/, "");

                return (
                  <p
                    key={li}
                    className={cn(
                      "transition-colors",
                      isBullet
                        ? "pl-7 relative mb-3 before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40"
                        : "mb-4 last:mb-0"
                    )}
                  >
                    {cleaned}
                  </p>
                );
              })
            )}
          </div>
        </div>
      );
    }

    return (
      <p key={i} className={cn("mb-4", theme === "dark" ? "text-white/78" : "text-zinc-600")}>
        {trimmed}
      </p>
    );
  });

  return (
    <div
      id="analysis-content"
      className={cn("animate-in fade-in slide-in-from-bottom-3 duration-700", "motion-reduce:animate-none")}
    >
      {rendered}
    </div>
  );
}

function VisualAnalysisLoader() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping motion-reduce:animate-none" />
        <span className="text-[11px] font-bold tracking-[0.26em] text-blue-600/80 dark:text-blue-400/80">
          Processing numerical vectors…
        </span>
      </div>

      <div className="grid grid-cols-6 gap-3 h-28 items-end px-1">
        {[60, 100, 45, 80, 30, 90].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="bg-gradient-to-t from-blue-500/22 to-transparent rounded-t-xl animate-pulse motion-reduce:animate-none"
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold">Synthesising patterns</span>
        <span className="tracking-[0.22em] uppercase text-[10px] font-bold opacity-70">
          Please wait
        </span>
      </div>
    </div>
  );
}

function ElegantPill({ level }: { level: "Low" | "Medium" | "High" | null }) {
  const config: Record<string, string> = {
    High: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/25",
    Medium: "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25",
    Low: "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/25",
    null: "bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 border-zinc-500/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border",
        "text-[10px] font-black uppercase tracking-[0.2em]",
        "shadow-[0_1px_0_rgba(255,255,255,0.32)] dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]",
        "transition-transform duration-200 will-change-transform hover:translate-y-[-1px]",
        config[level ?? "null"]
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "High"
            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.40)]"
            : level === "Medium"
            ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.30)]"
            : level === "Low"
            ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.30)]"
            : "bg-zinc-400"
        )}
      />
      Confidence {level ?? "Unknown"}
    </span>
  );
}

function IconButton({
  title,
  onClick,
  children,
  tone = "neutral",
  className,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex items-center justify-center rounded-full cursor-pointer",
        "h-9 w-9 md:h-10 md:w-10",
        "transition-all duration-200 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "shadow-[0_1px_0_rgba(255,255,255,0.22)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]",
        tone === "danger"
          ? "text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10"
          : cn(
              "text-zinc-500 dark:text-zinc-400",
              "hover:bg-black/90 hover:text-white",
              "dark:hover:bg-white/8 dark:hover:text-white"
            ),
        className
      )}
    >
      {children}
    </button>
  );
}

function friendlyErrorMessage(error: ExplainErr["error"], code?: string) {
  if (!code) return error;

  if (code === "INPUT_TOO_LARGE") return error;
  if (code === "UPLOAD_TOO_LARGE") return error;
  if (code === "RATE_LIMITED") return "Too many requests. Give it a minute, then try again.";
  if (code === "INVALID_JSON") return "Request format error. Refresh the page and try again.";
  if (code === "EMPTY_INPUT") return "Please paste or upload some numbers.";
  if (code === "UPSTREAM_FAILURE") return "Analysis provider is temporarily unavailable. Try again in a moment.";
  if (code === "BAD_OUTPUT_FORMAT") return "Output formatting failed. Try again (or simplify the input).";
  if (code === "NO_MATCHING_SHEET") return error;
  if (code === "EXCEL_PARSE_FAILED") return error;
  if (code === "GATE_REQUIRED") return "Security check failed. Please retry.";
  return error;
}

function WarningsPanel({ warnings, theme }: { warnings?: ExplainOk["warnings"]; theme: Theme }) {
  const cats = warnings?.categories ?? [];
  if (!warnings || !warnings.total || cats.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-10 rounded-[2rem] border p-5 md:p-6 print:hidden",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        theme === "dark" ? "bg-white/[0.02] border-white/10" : "bg-zinc-50/70 border-zinc-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              "ring-1 ring-inset",
              theme === "dark"
                ? "bg-amber-500/10 text-amber-200 ring-amber-500/20"
                : "bg-amber-500/10 text-amber-800 ring-amber-500/20"
            )}
          >
            <AlertCircle size={18} />
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600/80 dark:text-blue-400/80">
              Sanity checks
            </p>
            <p className="text-[12px] md:text-[13px] font-semibold tracking-[-0.01em] text-zinc-800 dark:text-zinc-200">
              {warnings.total} potential input issue{warnings.total === 1 ? "" : "s"} detected
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.24em] px-3 py-1.5 rounded-full border",
            theme === "dark" ? "border-white/10 text-white/70 bg-white/[0.02]" : "border-zinc-200 text-zinc-700 bg-white"
          )}
        >
          non-blocking
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {cats.slice(0, 10).map((c) => (
          <div
            key={c.key}
            className={cn(
              "rounded-2xl border p-4",
              "transition-colors",
              theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">{c.label}</p>
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.22em] px-2.5 py-1 rounded-full",
                  theme === "dark" ? "bg-white/5 text-white/80" : "bg-zinc-100 text-zinc-700"
                )}
              >
                {c.count}
              </span>
            </div>

            {c.examples?.length > 0 && (
              <div className="mt-3 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {c.examples.slice(0, 3).map((ex, i) => (
                  <p
                    key={i}
                    className="pl-6 relative mb-2 last:mb-0 before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40"
                  >
                    {ex}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
        These are automatic checks for possible data issues (format, scale, arithmetic). They can reduce confidence in
        trend conclusions.
      </p>
    </div>
  );
}

function DetectedSheet({ meta, theme }: { meta?: ExplainMeta; theme: Theme }) {
  const chosen = meta?.upload?.chosen_sheet;
  if (!chosen) return null;

  const score = meta?.upload?.chosen_score;
  const allSheets = meta?.upload?.sheets ?? [];
  const scoreText = typeof score === "number" ? ` • match ${score}/10` : "";

  return (
    <div
      className={cn(
        "mb-6 print:hidden",
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
        theme === "dark" ? "bg-white/[0.02] border-white/10 text-white/80" : "bg-white/70 border-zinc-200 text-zinc-800"
      )}
      title={allSheets.length ? `Sheets: ${allSheets.join(", ")}` : undefined}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600/80 dark:text-blue-400/80">
        Detected sheet
      </span>
      <span className="text-[11px] font-semibold tracking-[-0.01em]">
        {chosen}
        <span className="opacity-60">{scoreText}</span>
      </span>
    </div>
  );
}

function FileChip({ file, theme, onRemove }: { file: File; theme: Theme; onRemove: () => void }) {
  const name = (file?.name ?? "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() || "" : "";
  const label = (ext || "FILE").toUpperCase();

  const sizeBytes = Number.isFinite(file.size) ? file.size : 0;
  const sizeKb = sizeBytes ? Math.max(1, Math.round(sizeBytes / 1024)) : 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
        theme === "dark" ? "bg-white/[0.03] border-white/10 text-white/85" : "bg-white/75 border-zinc-200 text-zinc-800"
      )}
      title={file.name}
    >
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-[0.26em] px-2 py-0.5 rounded-full border",
          theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-white"
        )}
      >
        {label}
      </span>

      {sizeKb ? <span className="text-[11px] font-semibold tracking-[-0.01em] opacity-70">{sizeKb} KB</span> : null}

      <button
        type="button"
        onClick={onRemove}
        title="Remove file"
        aria-label="Remove file"
        className={cn(
          "ml-1 inline-flex items-center justify-center rounded-full h-6 w-6 transition-all active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          theme === "dark" ? "hover:bg-rose-500/10 text-rose-200/90" : "hover:bg-rose-500/10 text-rose-600/90"
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** ✅ Privacy modal content (minimal + premium, no external file) */
function PrivacyModalContent({ theme }: { theme: Theme }) {
  return (
    <div className="space-y-8">
      {/* Hero section with gradient emphasis */}
      <div className="space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))"
                : "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(16,185,129,0.06))",
            borderColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              theme === "dark"
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            )}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.32em] bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Zero Retention
          </span>
        </div>

        <h2
          className={cn(
            "text-[28px] md:text-[32px] font-[950] tracking-[-0.04em] leading-[1.1]",
            "animate-in fade-in slide-in-from-top-3 duration-700"
          )}
          style={{ animationDelay: "100ms" }}
        >
          <span className={cn("inline", theme === "dark" ? "text-white" : "text-black")}>Privacy.</span>{" "}
          <span className="inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-500 bg-[length:200%_auto]">
            Built in.
          </span>
        </h2>

        <p
          className={cn(
            "text-[15px] md:text-[16px] font-medium leading-[1.7] tracking-[-0.015em]",
            "animate-in fade-in slide-in-from-top-4 duration-700",
            theme === "dark" ? "text-white/70" : "text-zinc-600"
          )}
          style={{ animationDelay: "200ms" }}
        >
          Designed for trust — without compromise.
        </p>
      </div>

      {/* Key message with emphasis */}
      <div
        className={cn(
          "rounded-[1.75rem] border p-6 md:p-7 relative overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-700",
          "transition-all duration-300 hover:shadow-lg",
          theme === "dark"
            ? "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-br from-blue-50/40 to-emerald-50/30 border-blue-200/40 shadow-[0_20px_50px_rgba(59,130,246,0.08)]"
        )}
        style={{ animationDelay: "300ms" }}
      >
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              theme === "dark"
                ? "radial-gradient(600px circle at 30% 20%, rgba(59,130,246,0.08), transparent 60%)"
                : "radial-gradient(600px circle at 30% 20%, rgba(59,130,246,0.12), transparent 60%)",
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-12",
                theme === "dark" ? "bg-blue-500/10 text-blue-300" : "bg-blue-500/10 text-blue-700"
              )}
            >
              <Shield size={18} />
            </div>

            <div className="space-y-2">
              <p
                className={cn(
                  "text-[15px] md:text-[16px] leading-[1.75] font-medium tracking-[-0.015em]",
                  theme === "dark" ? "text-white/90" : "text-zinc-800"
                )}
              >
                Your data is processed securely, then <span className="font-bold">immediately discarded</span>.
              </p>

              <p
                className={cn(
                  "text-[14px] leading-[1.7] font-medium tracking-[-0.01em]",
                  theme === "dark" ? "text-white/75" : "text-zinc-700"
                )}
              >
                We don't store uploads, pasted text, results, or derived insights.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid with icons */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
        style={{ animationDelay: "400ms" }}
      >
        {[
          { icon: "🔒", label: "In-memory processing", desc: "Files are handled in session only" },
          { icon: "🚫", label: "No retention", desc: "No databases, no history" },
          { icon: "🤖", label: "No training", desc: "Data not used for training" },
          { icon: "💎", label: "No resale", desc: "Your data stays yours" },
        ].map((item, idx) => (
          <div
            key={item.label}
            className={cn(
              "group rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default",
              "animate-in fade-in slide-in-from-bottom-2",
              theme === "dark" ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]" : "bg-white/60 border-zinc-200 hover:bg-white"
            )}
            style={{ animationDelay: `${450 + idx * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className={cn("text-2xl flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", theme === "dark" ? "bg-white/5" : "bg-zinc-100/70")}>
                {item.icon}
              </div>

              <div className="space-y-1 min-w-0">
                <p className={cn("text-[14px] font-bold tracking-[-0.015em]", theme === "dark" ? "text-white/95" : "text-zinc-900")}>
                  {item.label}
                </p>
                <p className={cn("text-[13px] leading-[1.6] font-medium tracking-[-0.01em]", theme === "dark" ? "text-white/60" : "text-zinc-600")}>
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed guarantees */}
      <div
        className={cn(
          "rounded-2xl border p-5 md:p-6 space-y-4",
          "animate-in fade-in slide-in-from-bottom-3 duration-700",
          theme === "dark" ? "bg-white/[0.015] border-white/8" : "bg-zinc-50/50 border-zinc-200/70"
        )}
        style={{ animationDelay: "600ms" }}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-1 w-1 rounded-full", theme === "dark" ? "bg-blue-400/60" : "bg-blue-600/50")} />
          <h3 className={cn("text-[11px] font-black uppercase tracking-[0.28em]", "bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent")}>
            Our Commitments
          </h3>
        </div>

        <ul className={cn("space-y-3.5 text-[13px] md:text-[14px] leading-[1.7] font-medium tracking-[-0.01em]", theme === "dark" ? "text-white/75" : "text-zinc-700")}>
          {[
            "Session-only processing — your data never touches persistent storage",
            "Automatic cleanup — all traces removed when you close this page",
            "No model training — we never use your data to improve our models",
            "No third-party sharing — your information stays completely private",
            "No analytics tracking — we don’t track the contents of what you analyze ",
          ].map((text, i) => (
            <li key={i} className="flex gap-3 group">
              <span
                className={cn(
                  "mt-[7px] h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-125",
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-400 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    : "bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                )}
              />
              <span className="transition-colors duration-300 group-hover:text-current">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Final reassurance */}
      <div
        className={cn(
          "flex items-start gap-3 p-4 rounded-2xl border",
          "animate-in fade-in slide-in-from-bottom-2 duration-700",
          theme === "dark" ? "bg-emerald-500/[0.03] border-emerald-500/15" : "bg-emerald-50/50 border-emerald-200/50"
        )}
        style={{ animationDelay: "700ms" }}
      >
        <span className="text-xl mt-0.5">✓</span>
        <div>
          <p className={cn("text-[13px] md:text-[14px] leading-[1.7] font-semibold tracking-[-0.01em]", theme === "dark" ? "text-emerald-200" : "text-emerald-900")}>
            When you leave, the session is cleared.
          </p>
          <p className={cn("text-[12px] md:text-[13px] leading-[1.7] font-medium mt-1", theme === "dark" ? "text-emerald-300/70" : "text-emerald-800/70")}>
            Your data stays yours. Always.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [lastRunInput, setLastRunInput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);

  const [savedPaste, setSavedPaste] = useState<string>("");
  const [fileStatusLine, setFileStatusLine] = useState<string>("");

  // ✅ NEW: show why "Explain" won't run (instead of disabling the button)
  const [explainBlockReason, setExplainBlockReason] = useState<string>("");

  // ✅ NEW: Paywall state + subscribe flow
  const [paywall, setPaywall] = useState<null | { message: string; reason?: string }>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // ✅ NEW: Magic link request (secondary CTA)
  const [magicOpen, setMagicOpen] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicBusy, setMagicBusy] = useState(false);
  const [magicNote, setMagicNote] = useState<string>(""); // success / error, shown inline

  const gateRef = useRef<{ token: string; expMs: number } | null>(null);
  const gateInFlight = useRef<Promise<string> | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  const charCount = text.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  const hasText = useMemo(() => text.trim().length > 0, [text]);
  const hasFile = !!selectedFile;
  const hasResult = !!result;
  const inputChangedSinceRun = text.trim() !== lastRunInput.trim();

  // ✅ IMPORTANT: we no longer use this to disable the button.
  // We only use it to decide if explain() should run or show a message.
  const canExplain = !loading && !overLimit && (hasFile || (hasText && (!hasResult || inputChangedSinceRun)));

  /** -------------------------------
   * ✅ Smooth modal open/close state machine (Privacy)
   * -------------------------------- */
  const [privacyOpen, setPrivacyOpen] = useState(false); // desired state
  const [privacyMounted, setPrivacyMounted] = useState(false); // actually in DOM
  const [privacyPhase, setPrivacyPhase] = useState<"enter" | "open" | "exit">("enter");

  const privacyPanelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const openPrivacy = () => setPrivacyOpen(true);
  const closePrivacy = () => setPrivacyOpen(false);

  // mount/unmount with exit duration
  useEffect(() => {
    const EXIT_MS = 260; // keep in sync with CSS duration below

    if (privacyOpen) {
      lastActiveElementRef.current = (document.activeElement as HTMLElement) ?? null;
      setPrivacyMounted(true);
      requestAnimationFrame(() => {
        setPrivacyPhase("enter");
        requestAnimationFrame(() => setPrivacyPhase("open"));
      });
      return;
    }

    if (privacyMounted) {
      setPrivacyPhase("exit");
      const t = window.setTimeout(() => {
        setPrivacyMounted(false);
        setPrivacyPhase("enter");
        lastActiveElementRef.current?.focus?.();
      }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [privacyOpen, privacyMounted]);

  // scroll lock while mounted
  useEffect(() => {
    if (!privacyMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [privacyMounted]);

  // close on Esc while mounted
  useEffect(() => {
    if (!privacyMounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePrivacy();
      if (e.key === "Tab") {
        const root = privacyPanelRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [privacyMounted]);

  // focus into modal after open
  useEffect(() => {
    if (!privacyMounted) return;
    window.setTimeout(() => privacyPanelRef.current?.focus?.(), 0);
  }, [privacyMounted]);

  useEffect(() => {
    const saved = localStorage.getItem("emn_theme") as Theme | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("emn_theme", theme);
  }, [theme]);

  useEffect(() => {
    const fromSess = readGateFromSession();
    if (fromSess) gateRef.current = fromSess;
  }, []);

  // ✅ Nice little inline banners from query params (minimal, no UI restructuring)
  useEffect(() => {
    const url = new URL(window.location.href);
    const magic = url.searchParams.get("magic"); // ok | error
    const billing = url.searchParams.get("billing"); // success | cancel

    if (billing === "success") {
      setPaywall(null);
      setMagicNote("");
      setMagicOpen(false);
      setExplainBlockReason("Subscription active. You can continue.");
      window.setTimeout(() => setExplainBlockReason(""), 2200);
    }

    if (billing === "cancel") {
      setExplainBlockReason("Checkout cancelled.");
      window.setTimeout(() => setExplainBlockReason(""), 1800);
    }

    if (magic === "ok") {
      setMagicNote("Signed in. You can continue.");
      setMagicOpen(false);
      window.setTimeout(() => setMagicNote(""), 2200);
    }

    if (magic === "error") {
      const reason = url.searchParams.get("reason") ?? "unknown";
      setMagicNote(`Magic link failed (${reason}). Try requesting a new one.`);
    }

    // Keep URL clean (no reload)
    if (magic || billing) {
      url.searchParams.delete("magic");
      url.searchParams.delete("reason");
      url.searchParams.delete("billing");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const getGateToken = async (forceRefresh = false): Promise<string> => {
    const cached = gateRef.current;
    if (!forceRefresh && cached && cached.expMs > nowMs() + 5_000) return cached.token;

    const fromSess = !forceRefresh ? readGateFromSession() : null;
    if (fromSess) {
      gateRef.current = fromSess;
      return fromSess.token;
    }

    if (!forceRefresh && gateInFlight.current) return gateInFlight.current;

    gateInFlight.current = (async () => {
      const res = await fetch("/api/gate", { method: "POST" });
      let data: GateResponse;
      try {
        data = (await res.json()) as GateResponse;
      } catch {
        data = { ok: false, error: "Unexpected gate response.", error_code: "SERVER_ERROR" };
      }

      if (!res.ok || !data.ok || !(data as any).gate_token) {
        const msg = (data as any)?.error || "Failed to obtain gate token.";
        throw new Error(msg);
      }

      const ttlMs =
        typeof (data as GateResponseOk).expires_in_s === "number"
          ? Math.max(5, (data as GateResponseOk).expires_in_s!) * 1000
          : DEFAULT_GATE_TTL_MS;

      const expMs = nowMs() + ttlMs;
      const token = (data as GateResponseOk).gate_token;

      gateRef.current = { token, expMs };
      writeGateToSession(token, expMs);

      return token;
    })();

    try {
      return await gateInFlight.current;
    } finally {
      gateInFlight.current = null;
    }
  };

  const callExplainWithGate = async (init: { method: "POST"; headers?: HeadersInit; body?: BodyInit | null }) => {
    const token = await getGateToken(false);

    const makeHeaders = (base?: HeadersInit, t?: string) => {
      const h = new Headers(base || {});
      if (t) h.set(GATE_HEADER, t);
      return h;
    };

    let res = await fetch("/api/explain", {
      method: init.method,
      body: init.body ?? null,
      headers: makeHeaders(init.headers, token),
    });

    if (res.status === 401) {
      let isGate = true;
      try {
        const peek = (await res.clone().json()) as ExplainResult;
        isGate = (peek as any)?.error_code === "GATE_REQUIRED";
      } catch {
        isGate = true;
      }

      if (isGate) {
        const fresh = await getGateToken(true);
        res = await fetch("/api/explain", {
          method: init.method,
          body: init.body ?? null,
          headers: makeHeaders(init.headers, fresh),
        });
      }
    }

    return res;
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const hadPaste = text.trim().length > 0;
    if (hadPaste) setSavedPaste(text);
    setText("");

    setSelectedFile(f);
    setFileName(f.name);
    setResult(null);
    setLastRunInput("");
    setLastHttpStatus(null);
    setExplainBlockReason("");

    // ✅ paywall should clear when user changes inputs
    setPaywall(null);
    setMagicOpen(false);
    setMagicNote("");

    setFileStatusLine("File selected — paste is cleared to avoid mixing inputs.");

    e.target.value = "";

    // pre-warm token (non-blocking)
    getGateToken(false).catch(() => {});
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName(null);
    setResult(null);
    setLastHttpStatus(null);
    setExplainBlockReason("");

    // ✅ keep paywall UI, but allow the user to paste/edit easily
    // (if they’re paywalled, they’ll still see it once they click Explain)
    setText(savedPaste || "");
    setSavedPaste("");
    setFileStatusLine("");
  };

  /** ✅ Subscribe (Stripe Checkout) */
  async function handleSubscribe() {
    try {
      setIsSubscribing(true);
      setExplainBlockReason("");
      setMagicNote("");

      const r = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      const body = await r.json().catch(() => null);

      if (!r.ok || !body?.url) {
        throw new Error(body?.error || "Could not start checkout.");
      }

      window.location.href = body.url;
    } catch (e) {
      console.error(e);
      setExplainBlockReason("Could not open checkout. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  }

  /** ✅ Secondary CTA: request a new magic link (start trial / re-auth) */
  async function handleSendMagicLink() {
    try {
      setMagicBusy(true);
      setMagicNote("");

      const email = magicEmail.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        setMagicNote("Enter a valid email address.");
        return;
      }

      const r = await fetch("/api/auth/start-trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const body = await r.json().catch(() => null);

      if (!r.ok || !body?.ok) {
        throw new Error(body?.error || "Could not send magic link.");
      }

      setMagicNote("Magic link sent. Check your inbox.");
    } catch (e) {
      console.error(e);
      setMagicNote("Could not send magic link. Please try again.");
    } finally {
      setMagicBusy(false);
    }
  }

  /** ✅ Explain is ALWAYS clickable; we enforce validation inside. */
  const explain = async () => {
    // clear any previous reason
    setExplainBlockReason("");
    setMagicNote("");

    // Provide a friendly reason instead of disabling the button (no forbidden cursor)
    if (loading) {
      setExplainBlockReason("Already analysing…");
      return;
    }

    if (overLimit) {
      setExplainBlockReason(`Over limit: ${charCount.toLocaleString()} / ${MAX_INPUT_CHARS.toLocaleString()}`);
      return;
    }

    if (!hasFile && !hasText) {
      setExplainBlockReason("Paste some data or upload a file.");
      return;
    }

    if (!hasFile && hasResult && !inputChangedSinceRun) {
      setExplainBlockReason("Edit your input to re-run.");
      return;
    }

    setLoading(true);
    setResult(null);
    setLastHttpStatus(null);

    try {
      let res: Response;

      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        if (text.trim().length) fd.append("input", text);
        res = await callExplainWithGate({ method: "POST", body: fd });
      } else {
        res = await callExplainWithGate({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text }),
        });
      }

      setLastHttpStatus(res.status);

      // ✅ PAYWALL: detect 402 + NO_ENTITLEMENT
      if (res.status === 402) {
        const body = (await res.json().catch(() => null)) as any;
        if (body?.error_code === "NO_ENTITLEMENT") {
          setPaywall({
            message: body?.error ?? "Your free trial has ended. Subscribe to continue.",
            reason: body?.reason,
          });
          setResult(null);
          return;
        }
      }

      let data: ExplainResult;
      try {
        data = (await res.json()) as ExplainResult;
      } catch {
        data = { ok: false, error: "Unexpected server response.", error_code: "SERVER_ERROR" };
      }

      if (!res.ok && (data as any)?.ok === true) {
        data = { ok: false, error: "Request failed. Please try again.", error_code: "SERVER_ERROR" };
      }

      // ✅ Success clears paywall
      if (res.ok && (data as any)?.ok === true) {
        setPaywall(null);
      }

      setResult(data);
      setLastRunInput(text);

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (err: any) {
      setResult({
        ok: false,
        error: err?.message ?? "Analysis connection failed.",
        error_code: "SERVER_ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setText("");
    setSavedPaste("");
    setFileStatusLine("");
    setFileName(null);
    setSelectedFile(null);
    setResult(null);
    setLastRunInput("");
    setLastHttpStatus(null);
    setExplainBlockReason("");

    // ✅ reset also clears paywall UI
    setPaywall(null);
    setMagicOpen(false);
    setMagicEmail("");
    setMagicNote("");
  };

  const evidence = useMemo(() => {
    if (!result || !result.ok) return { level: null as any, note: "" };
    return parseEvidenceStrength(result.explanation);
  }, [result]);

  const analysisText = useMemo(() => {
    if (!result || !result.ok) return "";
    return result.explanation;
  }, [result]);

  const analysisSansEvidence = useMemo(() => {
    if (!result || !result.ok) return "";
    return stripEvidenceSection(result.explanation);
  }, [result]);

  const copyResults = async () => {
    if (!result || !result.ok) return;
    await navigator.clipboard.writeText(result.explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const exportPdf = () => {
    if (!result || !result.ok) return;
    window.print();
  };

  const errorUi = useMemo(() => {
    if (!result || result.ok) return null;

    const msg = friendlyErrorMessage(result.error, result.error_code);

    const hint =
      result.error_code === "RATE_LIMITED" || lastHttpStatus === 429
        ? "Tip: wait ~60 seconds, then retry."
        : result.error_code === "INPUT_TOO_LARGE" || lastHttpStatus === 413
        ? `Tip: keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`
        : result.error_code === "UPLOAD_TOO_LARGE"
        ? "Tip: upload a smaller file (or export fewer rows)."
        : result.error_code === "NO_MATCHING_SHEET"
        ? "Tip: ensure one sheet includes the required headers (or export that sheet to CSV)."
        : result.error_code === "UPSTREAM_FAILURE" || lastHttpStatus === 503
        ? "Tip: try again shortly."
        : result.error_code === "GATE_REQUIRED" || lastHttpStatus === 401
        ? "Tip: retry once. If it persists, hard refresh the page."
        : null;

    return { msg, hint };
  }, [result, lastHttpStatus, charCount]);

  const detectedSheetMeta = useMemo(() => {
    if (!result || !result.ok) return undefined;
    return result.meta;
  }, [result]);

  const showEditToRerun = !hasFile && hasResult && !inputChangedSinceRun;
  const textareaLocked = hasFile;

  return (
    <div
      className={cn(
        "relative transition-colors duration-700",
        theme === "dark" ? "bg-[#050505] text-white" : "bg-[#fafafa] text-zinc-900"
      )}
    >
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div
          className={cn(
            "absolute -top-[18%] left-[18%] w-[64%] h-[44%] rounded-full blur-[140px] opacity-25 transition-all duration-700",
            theme === "dark" ? "bg-blue-600" : "bg-blue-300"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-[18%] right-[12%] w-[58%] h-[42%] rounded-full blur-[160px] opacity-20 transition-all duration-700",
            theme === "dark" ? "bg-emerald-600" : "bg-emerald-300"
          )}
        />
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(120,120,120,0.5)_1px,transparent_0)] [background-size:24px_24px]" />
        </div>
        <div
          className={cn(
            "absolute inset-0",
            theme === "dark"
              ? "bg-[radial-gradient(1200px_circle_at_50%_-20%,rgba(59,130,246,0.14),transparent_60%),radial-gradient(1000px_circle_at_90%_120%,rgba(16,185,129,0.12),transparent_55%)]"
              : "bg-[radial-gradient(1200px_circle_at_50%_-20%,rgba(59,130,246,0.12),transparent_60%),radial-gradient(1000px_circle_at_90%_120%,rgba(16,185,129,0.10),transparent_55%)]"
          )}
        />
      </div>

      <nav className="sticky top-0 z-[60] backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div
              className={cn(
                "h-8 w-8 rounded-2xl grid place-items-center",
                theme === "dark"
                  ? "bg-white/[0.05] border border-white/10"
                  : "bg-white/80 border border-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              )}
              aria-hidden="true"
            >
              <BarChart3 size={16} className={cn(theme === "dark" ? "text-white/85" : "text-zinc-900")} />
            </div>

            <span className="font-black tracking-[-0.03em] text-[14px] md:text-[15px]">
              Explain My Numbers{" "}
              <span className="font-semibold opacity-55 tracking-[0.02em] text-[12px] md:text-[13px]">2.0</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className={cn(
              "p-2 rounded-full transition-all active:scale-[0.98]",
              "hover:bg-zinc-200/60 dark:hover:bg-white/6",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
              "shadow-[0_1px_0_rgba(255,255,255,0.18)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]"
            )}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6 print:p-0">
        <header className="mb-4 md:mb-6 space-y-2 md:space-y-4 print:hidden">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-[5rem] font-[950] tracking-[-0.065em] leading-[0.86] md:leading-[0.80]">
              <span className="inline text-zinc-300 dark:text-zinc-800 transition-colors duration-700">Data.</span>{" "}
              <span className="inline pb-[0.1em] md:pb-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-400 bg-[length:200%_auto] animate-shimmer-text">
                Narrated.
              </span>
            </h1>
          </div>
        </header>
        <br />

        {/* Input card */}
        <div
          className={cn(
            "group relative rounded-[2.5rem] border transition-all duration-500 print:hidden overflow-hidden",
            "shadow-[0_24px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_34px_110px_rgba(0,0,0,0.55)]",
            theme === "dark" ? "bg-white/[0.03] border-white/10" : "bg-white/85 border-zinc-200"
          )}
        >
          {/* subtle inner highlight */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700",
              theme === "dark"
                ? "bg-[radial-gradient(900px_circle_at_20%_0%,rgba(255,255,255,0.08),transparent_55%)]"
                : "bg-[radial-gradient(900px_circle_at_20%_0%,rgba(59,130,246,0.10),transparent_55%)]"
            )}
          />

          {/* DESKTOP HEADER ACTION BAR */}
          <div className="hidden md:flex items-center justify-between gap-4 p-6 border-b border-zinc-200/100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <label
                  className={cn(
                    "emn-upload",
                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer select-none",
                    "text-[13px] font-semibold tracking-[-0.01em]",
                    "transition-all duration-200 active:scale-[0.99]",
                    "focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:ring-offset-2 focus-within:ring-offset-transparent",
                    "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
                    theme === "dark"
                      ? "bg-white/10 text-zinc-200 border border-white/10"
                      : "bg-zinc-100/80 text-zinc-900 border border-zinc-200 hover:bg-black hover:text-white hover:border-transparent"
                  )}
                >
                  <Upload size={14} />
                  <span>{selectedFile ? "Change" : "Upload file"}</span>
                  <input type="file" className="hidden" onChange={onFile} accept=".csv,.txt,.tsv,.xls,.xlsx" />
                </label>

                <div className="absolute left-0 top-full mt-2 -translate-x-1 hidden md:flex items-center gap-3 select-none pointer-events-none">
                  {["Excel", "txt", "csv", "tsv"].map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "text-[9px] font-bold tracking-[0.26em] uppercase",
                        theme === "dark" ? "text-white/55" : "text-zinc-500"
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedFile && <FileChip file={selectedFile} theme={theme} onRemove={removeFile} />}
            </div>

            <div className="flex items-center gap-2">
              <IconButton title="Reset" onClick={reset} tone="neutral" className="emn-reset">
                <RotateCcw size={18} />
              </IconButton>

              {/* ✅ Explain button: NEVER disabled, NEVER cursor-not-allowed */}
              <button
                type="button"
                onClick={explain}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-2xl select-none",
                  "text-[13px] font-semibold tracking-[-0.01em]",
                  "transition-all duration-200 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  "cursor-pointer",
                  "shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
                  overLimit
                    ? "bg-rose-600 text-white border border-rose-500/30"
                    : theme === "dark"
                    ? "bg-white text-black border-transparent"
                    : "bg-black text-white border-transparent"
                )}
                title={overLimit ? `${charCount.toLocaleString()}/${MAX_INPUT_CHARS.toLocaleString()}` : undefined}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
                    <span className="tracking-[0.12em] text-[11px] font-black uppercase">Analysing…</span>
                  </>
                ) : overLimit ? (
                  <>
                    <AlertTriangle size={14} className="opacity-90" />
                    <span className="text-[13px] font-semibold tracking-[-0.01em]">
                      Over limit {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
                    </span>
                  </>
                ) : showEditToRerun ? (
                  <>
                    <Pencil size={14} className="opacity-80" />
                    <span className="text-[14px] font-semibold tracking-[-0.01em]">Edit</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="opacity-80" />
                    <span className="text-[13px] font-semibold tracking-[-0.01em]">Explain</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ✅ Paywall UI block (minimal + premium) */}
          {paywall && (
            <div className="px-6 md:px-10 pt-5 pb-2">
              <div
                className={cn(
                  "rounded-[2rem] border p-5 md:p-6 overflow-hidden relative",
                  "shadow-[0_18px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)]",
                  theme === "dark" ? "bg-white/[0.02] border-amber-500/20" : "bg-amber-50/60 border-amber-200"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-60",
                    theme === "dark"
                      ? "bg-[radial-gradient(800px_circle_at_10%_0%,rgba(245,158,11,0.12),transparent_60%)]"
                      : "bg-[radial-gradient(800px_circle_at_10%_0%,rgba(245,158,11,0.18),transparent_60%)]"
                  )}
                />

                <div className="relative">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center ring-1 ring-inset",
                        theme === "dark"
                          ? "bg-amber-500/10 text-amber-200 ring-amber-500/20"
                          : "bg-amber-500/10 text-amber-900 ring-amber-500/20"
                      )}
                      aria-hidden="true"
                    >
                      <CreditCard size={18} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-[11px] font-black uppercase tracking-[0.28em]",
                          theme === "dark" ? "text-amber-200/80" : "text-amber-900/70"
                        )}
                      >
                        Subscription required
                      </p>
                      <p className={cn("mt-2 text-[13px] md:text-[14px] font-semibold tracking-[-0.01em]", theme === "dark" ? "text-white/90" : "text-zinc-900")}>
                        {paywall.message}
                      </p>

                      {paywall.reason && (
                        <p className={cn("mt-2 text-[12px] leading-relaxed font-medium", theme === "dark" ? "text-white/65" : "text-zinc-700")}>
                          {paywall.reason}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                        <button
                          type="button"
                          onClick={handleSubscribe}
                          disabled={isSubscribing}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl",
                            "text-[13px] font-semibold tracking-[-0.01em]",
                            "transition-all duration-200 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            "shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
                            theme === "dark" ? "bg-white text-black hover:opacity-90" : "bg-black text-white hover:opacity-90",
                            isSubscribing && "opacity-85"
                          )}
                        >
                          {isSubscribing ? (
                            <>
                              <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                              <span>Opening checkout…</span>
                            </>
                          ) : (
                            <>
                              <span>Subscribe £4.99/mo</span>
                              <ArrowRight size={16} className="opacity-80" />
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setMagicOpen((v) => !v)}
                          className={cn(
                            "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border",
                            "text-[13px] font-semibold tracking-[-0.01em]",
                            "transition-all duration-200 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            theme === "dark"
                              ? "border-white/10 bg-white/[0.02] hover:bg-white/6 text-white/85"
                              : "border-zinc-200 bg-white/70 hover:bg-white text-zinc-900"
                          )}
                          title="If you lost your session, request a new link"
                        >
                          <Mail size={16} className="opacity-80" />
                          <span>Email me a magic link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPaywall(null);
                            setMagicOpen(false);
                            setMagicNote("");
                          }}
                          className={cn(
                            "inline-flex items-center justify-center px-5 py-3 rounded-2xl",
                            "text-[13px] font-semibold tracking-[-0.01em]",
                            "transition-all duration-200 active:scale-[0.99]",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            theme === "dark" ? "text-white/70 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-100"
                          )}
                        >
                          Not now
                        </button>
                      </div>

                      {/* Expandable magic link mini-form */}
                      {magicOpen && (
                        <div
                          className={cn(
                            "mt-4 rounded-2xl border p-4 md:p-5 emn-fade",
                            theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-white/70"
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                            <div className="flex-1">
                              <label className={cn("text-[10px] font-black uppercase tracking-[0.24em]", theme === "dark" ? "text-white/60" : "text-zinc-600")}>
                                Email
                              </label>
                              <input
                                value={magicEmail}
                                onChange={(e) => setMagicEmail(e.target.value)}
                                placeholder="you@company.com"
                                className={cn(
                                  "mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none",
                                  "text-[13px] font-semibold tracking-[-0.01em]",
                                  "focus-visible:ring-2 focus-visible:ring-blue-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                                  theme === "dark"
                                    ? "border-white/10 text-white/90 placeholder:text-white/25"
                                    : "border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                                )}
                                inputMode="email"
                                autoComplete="email"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleSendMagicLink}
                              disabled={magicBusy}
                              className={cn(
                                "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl",
                                "text-[13px] font-semibold tracking-[-0.01em]",
                                "transition-all duration-200 active:scale-[0.99]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                                "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
                                theme === "dark"
                                  ? "bg-white text-black hover:opacity-90"
                                  : "bg-zinc-900 text-white hover:opacity-90",
                                "md:mt-7"
                              )}
                            >
                              {magicBusy ? (
                                <>
                                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                                  <span>Sending…</span>
                                </>
                              ) : (
                                <>
                                  <span>Send link</span>
                                  <ArrowRight size={16} className="opacity-80" />
                                </>
                              )}
                            </button>
                          </div>

                          {!!magicNote && (
                            <div className="mt-3">
                              <div
                                className={cn(
                                  "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2",
                                  "text-[12px] font-semibold tracking-[-0.01em]",
                                  theme === "dark"
                                    ? "bg-white/[0.02] border-white/10 text-white/70"
                                    : "bg-white border-zinc-200 text-zinc-700"
                                )}
                              >
                                <span className={cn("h-1.5 w-1.5 rounded-full", theme === "dark" ? "bg-white/35" : "bg-zinc-400")} />
                                <span>{magicNote}</span>
                              </div>
                            </div>
                          )}

                          <p className={cn("mt-3 text-[11px] leading-relaxed", theme === "dark" ? "text-white/45" : "text-zinc-500")}>
                            Use this if your session expired or you opened the app on a new device.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Inline “why it didn’t run” line — fades/animates elegantly */}
          {!!explainBlockReason && (
            <div className="px-6 md:px-10 pt-4 pb-1">
              <div
                className={cn(
                  "emn-fade",
                  "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2",
                  "text-[12px] font-semibold tracking-[-0.01em]",
                  theme === "dark" ? "bg-rose-500/8 border-rose-500/20 text-rose-200" : "bg-rose-500/6 border-rose-500/15 text-rose-700"
                )}
              >
                <AlertCircle size={14} className="opacity-80" />
                <span>{explainBlockReason}</span>
              </div>
            </div>
          )}

          {hasFile && fileStatusLine && (
            <div className="px-6 md:px-10 pt-1 pb-1">
              <div
                className={cn(
                  "emn-fade",
                  "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2",
                  "text-[12px] font-semibold tracking-[-0.01em]",
                  theme === "dark" ? "bg-white/[0.02] border-white/10 text-white/70" : "bg-white/70 border-zinc-200 text-zinc-700"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", theme === "dark" ? "bg-white/35" : "bg-zinc-400")} />
                <span>{fileStatusLine}</span>
              </div>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => {
              if (textareaLocked) return;
              setText(e.target.value);
              setExplainBlockReason("");
              // keep paywall visible, but avoid stale magic note
              setMagicNote("");
            }}
            disabled={textareaLocked}
            placeholder={textareaLocked ? "" : "Paste your data here…"}
            className={cn(
              "w-full bg-transparent outline-none resize-none",
              "text-[14px] md:text-[15px] leading-relaxed font-medium tracking-[-0.012em]",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-700",
              "h-[175px] md:h-[150px]",
              "p-6 pb-24 md:pt-10 md:pb-10 md:pl-10 md:pr-6",
              "overflow-y-auto emn-scroll",
              "focus-visible:outline-none",
              "transition-[color,opacity] duration-200",
              textareaLocked && "cursor-not-allowed select-none opacity-70"
            )}
          />

          {/* MOBILE CONTROLS */}
          <div className="md:hidden sticky bottom-0 z-[5]">
            <div
              className={cn(
                "flex items-center gap-2 p-2.5 border-t",
                "rounded-none rounded-b-[2.5rem] backdrop-blur-2xl transition-all",
                theme === "dark" ? "bg-white/[0.03] border-white/10" : "bg-white/70 border-zinc-200/60"
              )}
            >
              <label
                className={cn(
                  "p-3 rounded-full border active:scale-[0.98] transition-all cursor-pointer",
                  "focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:ring-offset-2 focus-within:ring-offset-transparent",
                  "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
                  theme === "dark" ? "bg-white/10 text-zinc-200 border border-white/10" : "bg-zinc-100/80 text-zinc-800"
                )}
                title="Upload"
                aria-label="Upload"
              >
                <Upload size={20} />
                <input type="file" className="hidden" onChange={onFile} accept=".csv,.txt,.tsv,.xls,.xlsx" />
              </label>

              {/* ✅ mobile Explain: never disabled */}
              <button
                type="button"
                onClick={explain}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full transition-all active:scale-[0.99]",
                  "text-[16px] font-semibold tracking-[-0.01em]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  "cursor-pointer",
                  "shadow-[0_18px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
                  overLimit
                    ? "bg-rose-600 text-white border border-rose-500/30"
                    : theme === "dark"
                    ? "bg-white text-black border-transparent"
                    : "bg-black text-white border-transparent"
                )}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center w-full">
                    <Loader2 className="animate-spin motion-reduce:animate-none" size={18} />
                  </span>
                ) : overLimit ? (
                  <>
                    <AlertTriangle size={16} className="opacity-90 shrink-0" />
                    <span className="text-[12px] font-semibold tracking-[-0.01em]">
                      Over limit {charCount.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
                    </span>
                  </>
                ) : showEditToRerun ? (
                  "Edit input to re-run"
                ) : (
                  "Explain"
                )}
              </button>

              <button
                type="button"
                onClick={reset}
                className={cn(
                  "p-3 rounded-full border active:scale-[0.98] transition-all cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
                  theme === "dark" ? "bg-white/10 text-zinc-200 border-white/10" : "bg-zinc-100/80 text-zinc-800 border-zinc-200"
                )}
                title="Reset"
                aria-label="Reset"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {selectedFile && (
              <div className="mt-2 px-2">
                <FileChip file={selectedFile} theme={theme} onRemove={removeFile} />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {(loading || result) && (
          <div ref={resultRef} className="mt-3 md:mt-6 pb-6 md:pb-0 print:mt-0">
            <div
              className={cn(
                "rounded-[2.5rem] p-6 md:p-12 border transition-all duration-500 print:border-none print:p-0 print:shadow-none",
                "shadow-[0_24px_80px_rgba(0,0,0,0.10)] dark:shadow-[0_34px_110px_rgba(0,0,0,0.55)]",
                theme === "dark" ? "bg-white/[0.02] border-white/8" : "bg-white/85 border-zinc-200"
              )}
            >
              {loading ? (
                <VisualAnalysisLoader />
              ) : result?.ok ? (
                <div>
                  <div className="flex justify-between items-center mb-10 print:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500 flex items-center justify-center print:hidden shadow-[0_18px_60px_rgba(59,130,246,0.35)]">
                        <BarChart3 size={16} className="text-white" />
                      </div>
                      <h3 className="text-[22px] md:text-2xl font-black tracking-[-0.02em]">Synthesis</h3>
                    </div>

                    <ElegantPill level={evidence.level} />
                  </div>

                  <DetectedSheet meta={detectedSheetMeta} theme={theme} />
                  <WarningsPanel warnings={result.warnings} theme={theme} />
                  <ElegantAnalysis text={analysisText} theme={theme} />

                  <div className="mt-12 flex flex-wrap items-center gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={copyResults}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl border",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
                        theme === "dark"
                          ? "border-white/10 hover:bg-white/6 text-white/90"
                          : "border-zinc-200 hover:bg-zinc-100 text-zinc-900"
                      )}
                    >
                                            {copied ? (
                        <span className="opacity-70">Copied</span>
                      ) : (
                        <>
                          <Copy size={16} className="opacity-80" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={exportPdf}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl border",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.20)]",
                        theme === "dark"
                          ? "border-white/10 hover:bg-white/6 text-white/90"
                          : "border-zinc-200 hover:bg-zinc-100 text-zinc-900"
                      )}
                    >
                      <FileText size={16} className="opacity-80" />
                      <span>Export PDF</span>
                    </button>

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={openPrivacy}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        theme === "dark" ? "text-white/70 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-100"
                      )}
                    >
                      <Shield size={16} className="opacity-80" />
                      <span>Privacy</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center ring-1 ring-inset",
                          theme === "dark"
                            ? "bg-rose-500/10 text-rose-200 ring-rose-500/20"
                            : "bg-rose-500/10 text-rose-700 ring-rose-500/20"
                        )}
                        aria-hidden="true"
                      >
                        <AlertTriangle size={18} />
                      </div>

                      <div>
                        <p className={cn("text-[11px] font-black uppercase tracking-[0.28em]", theme === "dark" ? "text-rose-200/75" : "text-rose-700/70")}>
                          Couldn’t complete
                        </p>

                        <p className={cn("mt-2 text-[13px] md:text-[14px] font-semibold tracking-[-0.01em]", theme === "dark" ? "text-white/90" : "text-zinc-900")}>
                          {errorUi?.msg ?? "Something went wrong."}
                        </p>

                        {errorUi?.hint && (
                          <p className={cn("mt-2 text-[12px] leading-relaxed font-medium", theme === "dark" ? "text-white/60" : "text-zinc-700")}>
                            {errorUi.hint}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={reset}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-2xl border",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        theme === "dark"
                          ? "border-white/10 bg-white/[0.02] hover:bg-white/6 text-white/85"
                          : "border-zinc-200 bg-white/70 hover:bg-white text-zinc-900"
                      )}
                    >
                      <RotateCcw size={16} className="opacity-80" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* When paywall is active we already show the block above; keep error area clean */}
                  {!paywall && (
                    <div className={cn("rounded-2xl border p-5 md:p-6", theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-white/70")}>
                      <p className={cn("text-[11px] font-black uppercase tracking-[0.28em]", theme === "dark" ? "text-white/60" : "text-zinc-600")}>
                        Quick checks
                      </p>
                      <ul className={cn("mt-3 space-y-2 text-[13px] leading-relaxed font-medium", theme === "dark" ? "text-white/75" : "text-zinc-700")}>
                        <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
                          If you pasted data, ensure it’s tabular (CSV/TSV style) with a header row.
                        </li>
                        <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
                          If you uploaded Excel, try exporting the relevant sheet to CSV.
                        </li>
                        <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
                          If it’s rate-limited, wait a minute and retry.
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
</main>
        {/* Footer */}
       <footer className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-2 mt-1 print:hidden">
        <div className="pt-3 flex flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black tracking-[0.26em] uppercase opacity-55">© 2026 Explain Ltd</p>

            {/* ✅ Privacy link is now clickable + opens smooth modal */}
            <button
              type="button"
              onClick={openPrivacy}
              className={cn(
                "flex items-center gap-2 opacity-55 transition-opacity",
                "hover:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              )}
              aria-label="Open privacy notice"
              title="Privacy"
            >
              <Shield size={12} />
              <span className="text-[10px] font-black tracking-[0.26em] uppercase">Privacy</span>
            </button>
          </div>

          <a
            href="https://x.com/Luca1347803"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group p-2.5 rounded-xl transition-all",
              theme === "dark" ? "text-white/55 hover:text-blue-300" : "text-zinc-400 hover:text-blue-500",
              "hover:bg-black/5 dark:hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            )}
            title="X"
            aria-label="X"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px] fill-current transition-transform duration-500 group-hover:rotate-[360deg]"
              aria-hidden="true"
            >
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
            </svg>
          </a>
        </div>
      </footer>

      {/* ✅ Smooth Privacy Modal (mounted during exit) */}
      {privacyMounted && (
        <div className="fixed inset-0 z-[100] print:hidden">
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={closePrivacy}
            className={cn(
              "absolute inset-0",
              "transition-[opacity,backdrop-filter] duration-[260ms] ease-out will-change-[opacity,backdrop-filter]",
              privacyPhase === "open" ? "opacity-100 backdrop-blur-[10px]" : "opacity-0 backdrop-blur-0"
            )}
            style={{
              background:
                privacyPhase === "open"
                  ? "radial-gradient(1200px circle at 50% 30%, rgba(0,0,0,0.55), rgba(0,0,0,0.78))"
                  : "transparent",
            }}
          />

          {/* Centering wrapper */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            {/* Panel */}
            <div
              ref={privacyPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Privacy"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-2xl rounded-[2.5rem] border overflow-hidden",
                "shadow-[0_34px_120px_rgba(0,0,0,0.55)]",
                "transition-[transform,opacity] duration-[260ms] ease-out will-change-[transform,opacity]",
                privacyPhase === "open" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-[0.985]",
                theme === "dark" ? "bg-[#070707] border-white/10" : "bg-white border-zinc-200"
              )}
            >
              <div
                className={cn(
                  "px-6 md:px-8 py-5 flex items-center justify-between border-b",
                  theme === "dark" ? "border-white/10" : "border-zinc-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-2xl grid place-items-center border",
                      theme === "dark" ? "bg-white/[0.04] border-white/10" : "bg-zinc-50 border-zinc-200"
                    )}
                    aria-hidden="true"
                  >
                    <Shield size={16} className={cn(theme === "dark" ? "text-white/85" : "text-zinc-900")} />
                  </div>

                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600/80 dark:text-blue-400/80">
                      Privacy
                    </p>
                    <p className={cn("text-[14px] font-semibold tracking-[-0.01em]", theme === "dark" ? "text-white/90" : "text-zinc-900")}>
                      Notice
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closePrivacy}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full h-10 w-10",
                    "transition-all duration-200 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    theme === "dark" ? "hover:bg-white/5 text-white/70" : "hover:bg-zinc-100 text-zinc-700"
                  )}
                  aria-label="Close privacy modal"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 md:px-8 py-6 md:py-7 max-h-[70vh] overflow-y-auto emn-scroll">
                <PrivacyModalContent theme={theme} />
              </div>

              <div
                className={cn(
                  "px-6 md:px-8 py-4 flex items-center justify-end gap-2 border-t",
                  theme === "dark" ? "border-white/10" : "border-zinc-200"
                )}
              >
                <button
                  type="button"
                  onClick={closePrivacy}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl",
                    "text-[13px] font-semibold tracking-[-0.01em]",
                    "transition-all duration-200 active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    theme === "dark" ? "bg-white text-black hover:opacity-90" : "bg-black text-white hover:opacity-90"
                  )}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        :root {
          color-scheme: light;
        }
        html.dark {
          color-scheme: dark;
        }

        /* Micro-interaction: gentle fade/slide for inline status messages */
        .emn-fade {
          animation: emnFadeUp 260ms ease-out both;
        }
        @keyframes emnFadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
            filter: blur(0.6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @media (hover: hover) and (pointer: fine) {
          html.dark .emn-reset:hover {
            background: rgba(255, 255, 255, 0.92) !important;
            color: #000000 !important;
          }
          html.dark .emn-upload:hover {
            background: rgba(255, 255, 255, 0.92) !important;
            color: #000000 !important;
            border-color: transparent !important;
            box-shadow: 0 18px 60px rgba(255, 255, 255, 0.12) !important;
          }
        }

        html,
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
            "Apple Color Emoji", "Segoe UI Emoji";
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          letter-spacing: -0.01em;
        }

        ::selection {
          background: rgba(59, 130, 246, 0.22);
        }

        /* Premium shimmer */
        .animate-shimmer-text {
          animation: shimmer-text 6s linear infinite;
        }
        @keyframes shimmer-text {
          to {
            background-position: 200% center;
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer-text,
          .animate-shake,
          .animate-pulse,
          .animate-spin,
          .animate-ping,
          .emn-fade {
            animation: none !important;
          }
          html:focus-within {
            scroll-behavior: auto;
          }
        }

        .emn-scroll {
          scrollbar-gutter: stable;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: auto;
          scrollbar-color: rgba(90, 90, 90, 0.42) transparent;
        }

        .emn-scroll::-webkit-scrollbar {
          width: 14px;
        }
        .emn-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 10px;
        }
        .emn-scroll::-webkit-scrollbar-thumb {
          background: rgba(90, 90, 90, 0.42);
          border-radius: 999px;
          border: 4px solid transparent;
          background-clip: padding-box;
        }
        .emn-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(90, 90, 90, 0.6);
          border: 4px solid transparent;
          background-clip: padding-box;
        }

        @media print {
          @page {
            margin: 2cm;
          }
          body {
            background: white !important;
            color: black !important;
          }

          nav,
          footer {
            display: none !important;
          }
          textarea,
          label,
          button {
            display: none !important;
          }

          #analysis-content {
            display: block !important;
          }

          h4 {
            color: #2563eb !important;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
          }
        }
      `}</style>
    </div>
  );
}

