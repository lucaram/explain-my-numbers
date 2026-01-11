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
  Twitter,
  FileText,
  Loader2,
  X,
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
  error_code?: string; // added by backend
};

type ExplainResult = ExplainOk | ExplainErr;

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

/** ✅ Frontend hard limit aligned with backend (no truncation) */
const MAX_INPUT_CHARS = 50_000;

/**
 * Evidence strength parser (bulletproof):
 * supports:
 * - "Evidence strength: High – reason"
 * - "Evidence strength:\nHigh – reason"
 * - extra blank lines
 * - any dash style (-, –, —)
 * - case variations ("Evidence Strength", etc.)
 */
function parseEvidenceStrength(
  explanation: string
): { level: "Low" | "Medium" | "High" | null; note: string } {
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

/** Pull out the model's main narrative without the Evidence strength footer (so warnings can sit above it cleanly) */
function stripEvidenceSection(explanation: string) {
  const text = String(explanation ?? "").replace(/\r\n/g, "\n");
  // remove everything from "Evidence strength:" to end
  return text.replace(/\n\s*Evidence\s*strength\s*:[\s\S]*$/i, "").trim();
}

/**
 * PREMIUM FORMATTER
 * Splits by the exact headers defined in route.ts
 */
function ElegantAnalysis({ text }: { text: string }) {
  const sections = text.split(
    /(Summary:|What changed:|Underlying observations:|Why it likely changed:|What it means:|What NOT to conclude:|Evidence strength:)/g
  );

  let currentHeader = "";

  const rendered = sections.map((part, i) => {
    const trimmed = part.trim();
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
          <h4 className="text-[10px] font-black uppercase tracking-[0.34em] text-blue-600 dark:text-blue-400 mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
            {currentHeader.replace(":", "")}
          </h4>

          <div
            className={cn(
              "text-[15px] md:text-[17px] leading-[1.75] font-medium tracking-[-0.01em]",
              currentHeader === "What NOT to conclude:"
                ? "text-rose-600/90 dark:text-rose-400/90 italic"
                : "text-zinc-800 dark:text-zinc-200"
            )}
          >
            {trimmed.split("\n").map((line, li) => {
              const l = line ?? "";
              const isBullet = l.trim().startsWith("-") || l.trim().startsWith("•");
              const cleaned = isBullet ? l.trim().replace(/^[-•]\s*/, "") : l;

              return (
                <p
                  key={li}
                  className={cn(
                    isBullet
                      ? "pl-7 relative mb-3 before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40"
                      : "mb-4 last:mb-0"
                  )}
                >
                  {cleaned}
                </p>
              );
            })}
          </div>
        </div>
      );
    }

    // fallback if anything appears outside the known sections
    return (
      <p key={i} className="text-zinc-500 dark:text-zinc-400 mb-4">
        {trimmed}
      </p>
    );
  });

  return (
    <div id="analysis-content" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {rendered}
    </div>
  );
}

/** Loader inside results card */
function VisualAnalysisLoader() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
        <span className="text-[11px] font-bold tracking-[0.26em] text-blue-600/80 dark:text-blue-400/80 uppercase">
          Processing numerical vectors…
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 h-32 items-end px-2">
        {[60, 100, 45, 80, 30, 90].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="bg-gradient-to-t from-blue-500/25 to-transparent rounded-t-xl animate-pulse"
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold">Synthesising patterns</span>
        <span className="font-medium opacity-70">This stays on-device until you hit submit</span>
      </div>
    </div>
  );
}

function ElegantPill({ level }: { level: "Low" | "Medium" | "High" | null }) {
  const config: Record<string, string> = {
    High: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20",
    Low: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    null: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em]",
        "shadow-[0_1px_0_rgba(255,255,255,0.35)] dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]",
        config[level ?? "null"]
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          level === "High"
            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            : level === "Medium"
            ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]"
            : level === "Low"
            ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.35)]"
            : "bg-zinc-400"
        )}
      />
      {level ?? "Unknown"} Evidence strength
    </span>
  );
}

/** Polished UI primitives */
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        tone === "danger"
          ? "text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/10"
          : cn(
              "text-zinc-500 dark:text-zinc-400",
              "hover:bg-black hover:text-white",
              "dark:hover:bg-white/5 dark:hover:text-white"
            ),
        className
      )}
    >
      {children}
    </button>
  );
}

/** ✅ Error presentation aligned to backend error_code + HTTP status behavior */
function friendlyErrorMessage(error: ExplainErr["error"], code?: string) {
  if (!code) return error;

  if (code === "INPUT_TOO_LARGE") return error; // already descriptive
  if (code === "UPLOAD_TOO_LARGE") return error;
  if (code === "RATE_LIMITED") return "Too many requests. Give it a minute, then try again.";
  if (code === "INVALID_JSON") return "Request format error. Refresh the page and try again.";
  if (code === "EMPTY_INPUT") return "Please paste or upload some numbers.";
  if (code === "UPSTREAM_FAILURE") return "Analysis provider is temporarily unavailable. Try again in a moment.";
  if (code === "BAD_OUTPUT_FORMAT") return "Output formatting failed. Try again (or simplify the input).";
  if (code === "NO_MATCHING_SHEET") return error; // already helpful
  if (code === "EXCEL_PARSE_FAILED") return error; // already helpful
  return error;
}

/** ✅ Compact warnings block (uses backend warnings.categories) */
function WarningsPanel({
  warnings,
  theme,
}: {
  warnings?: ExplainOk["warnings"];
  theme: Theme;
}) {
  const cats = warnings?.categories ?? [];
  if (!warnings || !warnings.total || cats.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-10 rounded-[2rem] border p-5 md:p-6 print:hidden",
        theme === "dark" ? "bg-white/[0.02] border-white/10" : "bg-zinc-50 border-zinc-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              theme === "dark" ? "bg-amber-500/10 text-amber-300" : "bg-amber-500/10 text-amber-700"
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
            "text-[10px] font-bold uppercase tracking-[0.24em] px-3 py-1.5 rounded-full border",
            theme === "dark" ? "border-white/10 text-white/70" : "border-zinc-200 text-zinc-700"
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

/** ✅ Optional “Detected sheet” chip (reads backend meta.upload.chosen_sheet) */
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
        theme === "dark" ? "bg-white/[0.02] border-white/10 text-white/80" : "bg-zinc-50 border-zinc-200 text-zinc-800"
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

/** ✅ File “chip” (CSV/XLSX) with remove X (replaces filename text) */
function FileChip({
  file,
  theme,
  onRemove,
}: {
  file: File;
  theme: Theme;
  onRemove: () => void;
}) {
  const name = (file?.name ?? "").toLowerCase();
  const ext = name.includes(".") ? name.split(".").pop() || "" : "";
  const label = (ext || "FILE").toUpperCase();

  const sizeBytes = Number.isFinite(file.size) ? file.size : 0;
  const sizeKb = sizeBytes ? Math.max(1, Math.round(sizeBytes / 1024)) : 0;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        theme === "dark" ? "bg-white/[0.03] border-white/10 text-white/80" : "bg-zinc-50 border-zinc-200 text-zinc-800"
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

      {sizeKb ? (
        <span className="text-[11px] font-semibold tracking-[-0.01em] opacity-70">{sizeKb} KB</span>
      ) : null}

      <button
        type="button"
        onClick={onRemove}
        title="Remove file"
        aria-label="Remove file"
        className={cn(
          "ml-1 inline-flex items-center justify-center rounded-full h-6 w-6 transition-all active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          theme === "dark" ? "hover:bg-rose-500/10 text-rose-300/90" : "hover:bg-rose-500/10 text-rose-600/90"
        )}
      >
        <X size={14} />
      </button>
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

  // ✅ NEW: keep the file for multipart uploads (privacy-first: don't dump into textarea)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ NEW: keep HTTP status for better UI messaging (429/413/etc.)
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  /** ✅ hard limit state (no truncation) */
  const charCount = text.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  const hasText = useMemo(() => text.trim().length > 0, [text]);
  const hasFile = !!selectedFile;

  const hasResult = !!result;

  // ✅ If user is in paste mode (no file), track whether text changed since last run.
  const inputChangedSinceRun = text.trim() !== lastRunInput.trim();

  // ✅ FIX #1: Enable when either pasted text OR a file exists (Excel on empty textarea now works).
  // ✅ FIX #2: Privacy-first: file uploads don't require showing content in textarea.
  // ✅ Re-run gating:
  //    - If a file is selected, allow re-run (user might just want to run again).
  //    - If no file, keep your existing "edit input to rerun" behavior.
  const canExplain =
    !loading &&
    !overLimit &&
    ((hasFile && true) || (hasText && (!hasResult || inputChangedSinceRun)));

  useEffect(() => {
    const saved = localStorage.getItem("emn_theme") as Theme | null;
    if (saved) setTheme(saved);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("emn_theme", theme);
  }, [theme]);

  /** ✅ Upload handler:
   * - Accepts CSV/TSV/TXT + XLS/XLSX
   * - Keeps file for multipart upload
   * - DOES NOT load content into textarea (privacy-first)
   */
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setSelectedFile(f);
    setFileName(f.name); // keep existing state (not shown in UI anymore)
    setResult(null);
    setLastRunInput("");
    setLastHttpStatus(null);

    // IMPORTANT: do not populate textarea with file content (privacy-first)
    // keep whatever user already typed
    // setText((prev) => prev);

    // allow re-upload of same file
    e.target.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName(null);
    setResult(null);
    setLastHttpStatus(null);
    // don't touch textarea (user might have pasted text too)
  };

  /** ✅ Multipart-first explain:
   * - If a file was selected: send multipart/form-data with { file, input? }
   * - If no file: send JSON { input }
   */
  const explain = async () => {
    if (!canExplain) return;

    setLoading(true);
    setResult(null);
    setLastHttpStatus(null);

    try {
      let res: Response;

      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        if (text.trim().length) fd.append("input", text);

        res = await fetch("/api/explain", {
          method: "POST",
          body: fd,
        });
      } else {
        res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text }),
        });
      }

      setLastHttpStatus(res.status);

      let data: ExplainResult;
      try {
        data = (await res.json()) as ExplainResult;
      } catch {
        data = { ok: false, error: "Unexpected server response.", error_code: "SERVER_ERROR" };
      }

      if (!res.ok && (data as any)?.ok === true) {
        data = { ok: false, error: "Request failed. Please try again.", error_code: "SERVER_ERROR" };
      }

      setResult(data);

      // In paste-mode, this supports "Edit input to rerun"
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
    setFileName(null);
    setSelectedFile(null);
    setResult(null);
    setLastRunInput("");
    setLastHttpStatus(null);
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
  };

  const exportPdf = () => {
    if (!result || !result.ok) return;
    window.print();
  };

  const overLimitLabel = useMemo(() => {
    if (!overLimit) return "";
    return `Over limit ${charCount.toLocaleString()} / ${MAX_INPUT_CHARS.toLocaleString()}`;
  }, [overLimit, charCount]);

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
        : null;

    return { msg, hint };
  }, [result, lastHttpStatus]);

  const detectedSheetMeta = useMemo(() => {
    if (!result || !result.ok) return undefined;
    return result.meta;
  }, [result]);

  // For the button label: treat "file present" as a valid input even if textarea unchanged
  
  const showEditToRerun = !hasFile && hasResult && !inputChangedSinceRun;

  return (
    <div
      className={cn(
        "relative transition-colors duration-700",
        theme === "dark" ? "bg-[#050505] text-white" : "bg-[#fafafa] text-zinc-900"
      )}
    >
      {/* Background: premium glow + subtle grid */}
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
      </div>

      <nav className="sticky top-0 z-[60] backdrop-blur-2xl ">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5 select-none">
            <div className="w-7 h-7 rounded-xl bg-black dark:bg-white flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.06)]">
              <Sparkles size={14} className="text-white dark:text-black" />
            </div>

            <span className="font-bold tracking-[-0.03em] text-[15px] md:text-base">
              Explain My Numbers <span className="font-semibold opacity-55 tracking-normal">2.0</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className={cn(
              "p-2 rounded-full transition-all active:scale-[0.98]",
              "hover:bg-zinc-200/60 dark:hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
          <h1 className="text-5xl md:text-[5rem] font-[900] tracking-[-0.06em] leading-[0.85] md:leading-[0.8]">
            <span className="inline text-zinc-300 dark:text-zinc-800 transition-colors duration-700">Data.</span>{" "}
            <span className="inline pb-[0.1em] md:pb-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-400 bg-[length:200%_auto] animate-shimmer-text">
              Interpreted.
            </span>
          </h1>

          <br />
        </header>

        {/* Input card */}
        <div
          className={cn(
            "group relative rounded-[2.5rem] border transition-all duration-500 print:hidden overflow-hidden",
            theme === "dark"
              ? "bg-white/[0.03] border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
              : "bg-white border-zinc-200 shadow-[0_30px_90px_rgba(0,0,0,0.10)]"
          )}
        >
          {/* DESKTOP HEADER ACTION BAR */}
          <div className="hidden md:flex items-center justify-between gap-4 p-6 border-b border-zinc-200/100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <label
                className={cn(
                  "emn-upload",
                  "inline-flex items-center gap-2 px-4 py-2 rounded-2xl cursor-pointer select-none",
                  "text-[13px] font-semibold tracking-[-0.01em]",
                  "transition-colors duration-200",
                  "focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent",
                  theme === "dark"
                    ? "bg-white/10 text-zinc-200 border border-white/10"
                    : "bg-zinc-100 text-zinc-900 border border-zinc-200 hover:bg-black hover:text-white hover:border-transparent"
                )}
              >
                <Upload size={14} />
                <span>{selectedFile ? "Change" : "Upload file"}</span>
                <input type="file" className="hidden" onChange={onFile} accept=".csv,.txt,.tsv,.xls,.xlsx,.pdf" />
              </label>

              {/* ✅ FIX #3: show file-type chip + red remove button (no filename text) */}
              {selectedFile && <FileChip file={selectedFile} theme={theme} onRemove={removeFile} />}
            </div>

            <div className="flex items-center gap-2">
              <IconButton title="Reset" onClick={reset} tone="neutral" className="emn-reset">
                <RotateCcw size={18} />
              </IconButton>

              <button
                type="button"
                onClick={explain}
                disabled={!canExplain}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "h-10 px-6 rounded-2xl",
                  "text-[13px] font-semibold tracking-[-0.01em]",
                  "transition-all duration-200 active:scale-[0.99]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  canExplain ? "cursor-pointer" : "cursor-not-allowed",
                  overLimit
                    ? "bg-rose-600 text-white border border-rose-500/30"
                    : theme === "dark"
                    ? canExplain
                      ? "bg-white text-black border-transparent shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                      : "bg-white/10 text-zinc-200 border border-white/10"
                    : canExplain
                    ? "bg-black text-white border-transparent shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                    : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                )}
                title={overLimit ? `${charCount.toLocaleString()}/${MAX_INPUT_CHARS.toLocaleString()}` : undefined}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="uppercase tracking-[0.12em] text-[11px] font-bold">Analysing…</span>
                  </>
                ) : overLimit ? (
                  <span className="text-[12px] font-semibold tracking-[-0.01em]">{overLimitLabel}</span>
                ) : showEditToRerun ? (
                  <span className="text-[12px] font-semibold tracking-[-0.01em]">Edit input to rerun</span>
                ) : (
                  <>
                    <Sparkles size={14} className="opacity-80" />
                    <span className="text-[12px] font-semibold tracking-[-0.01em]">Generate summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ✅ Fixed-height textarea (ChatGPT-like) */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your data here…"
            className={cn(
              "w-full bg-transparent outline-none resize-none",
              "text-[14px] md:text-[15px] leading-relaxed font-medium tracking-[-0.01em]",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-700",
              "h-[175px] md:h-[150px]",
              "p-6 pb-24 md:pt-10 md:pb-10 md:pl-10 md:pr-6",
              "overflow-y-auto emn-scroll",
              "focus-visible:outline-none"
            )}
          />

          {/* ✅ MOBILE CONTROLS */}
          <div className="md:hidden sticky bottom-0 z-[5]">
            <div
              className={cn(
                "flex items-center gap-2 p-2.5 border-t",
                "rounded-none rounded-b-[2.5rem] backdrop-blur-2xl transition-all",
                theme === "dark" ? "bg-white/[0.03] border-white/10" : "bg-white/65 border-zinc-200/60"
              )}
            >
              <label
                className={cn(
                  "p-3 rounded-full border active:scale-[0.98] transition-all cursor-pointer",
                  "focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:ring-offset-2 focus-within:ring-offset-transparent",
                  theme === "dark"
                    ? "bg-white/10 text-zinc-200 border border-white/10"
                    : "bg-zinc-100 text-zinc-800"
                )}
                title="Upload file"
                aria-label="Upload file"
              >
                <Upload size={20} />
                <input type="file" className="hidden" onChange={onFile} accept=".csv,.txt,.tsv,.xls,.xlsx,.pdf" />
              </label>

              <button
                type="button"
                onClick={explain}
                disabled={!canExplain}
                className={cn(
                  "flex-1 py-3 rounded-full transition-all active:scale-[0.99]",
                  "text-[12px] font-semibold tracking-[-0.01em]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  canExplain ? "cursor-pointer" : "cursor-not-allowed",
                  overLimit
                    ? "bg-rose-600 text-white border border-rose-500/30"
                    : theme === "dark"
                    ? canExplain
                      ? "bg-white text-black border-transparent"
                      : "bg-white/10 text-zinc-200 border border-white/10 disabled:opacity-100"
                    : canExplain
                    ? "bg-black text-white border-transparent"
                    : "bg-zinc-200 text-zinc-600 border-transparent"
                )}
                title={overLimit ? `${charCount.toLocaleString()}/${MAX_INPUT_CHARS.toLocaleString()}` : undefined}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center w-full">
                    <Loader2 className="animate-spin" size={18} />
                  </span>
                ) : overLimit ? (
                  <span className="inline-flex items-center justify-center w-full whitespace-nowrap">{overLimitLabel}</span>
                ) : showEditToRerun ? (
                  "Edit input to re-run"
                ) : (
                  "Generate summary"
                )}
              </button>

              <button
                type="button"
                onClick={reset}
                className={cn(
                  "p-3 rounded-full border active:scale-[0.98] transition-all cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  theme === "dark" ? "bg-white/10 text-rose-300/90 border border-white/10" : "bg-zinc-100 text-rose-600/90"
                )}
                title="Reset"
                aria-label="Reset"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {/* ✅ FIX #3 (mobile): show chip instead of filename text */}
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
                theme === "dark"
                  ? "bg-white/[0.02] border-white/8 shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
                  : "bg-white border-zinc-200 shadow-[0_30px_90px_rgba(0,0,0,0.10)]"
              )}
            >
              {loading ? (
                <VisualAnalysisLoader />
              ) : result?.ok ? (
                <div>
                  <div className="flex justify-between items-center mb-10 print:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center print:hidden shadow-[0_18px_60px_rgba(59,130,246,0.35)]">
                        <BarChart3 size={16} className="text-white" />
                      </div>
                      <h3 className="text-[22px] md:text-2xl font-black italic tracking-[-0.02em]">Synthesis</h3>
                    </div>

                    <ElegantPill level={evidence.level} />
                  </div>

                  {/* ✅ NEW: show detected Excel sheet when meta is present */}
                  <DetectedSheet meta={detectedSheetMeta} theme={theme} />

                  {/* ✅ deterministic sanity warnings surfaced */}
                  <WarningsPanel warnings={result.warnings} theme={theme} />

                  {/* ✅ Keep your exact existing formatter for the final output */}
                  <ElegantAnalysis text={analysisText} />

                  <div className="mt-12 flex flex-wrap items-center gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={copyResults}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl border",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        theme === "dark"
                          ? "border-white/10 hover:bg-white/5 text-white/90"
                          : "border-zinc-200 hover:bg-zinc-100 text-zinc-900"
                      )}
                    >
                      <Copy size={16} /> Copy
                    </button>

                    <button
                      type="button"
                      onClick={exportPdf}
                      className={cn(
                        "inline-flex items-center gap-2 px-5 py-3 rounded-2xl",
                        "text-[13px] font-semibold tracking-[-0.01em]",
                        "transition-all duration-200 active:scale-[0.99]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                        theme === "dark"
                          ? "bg-white text-black hover:opacity-90 shadow-[0_18px_60px_rgba(255,255,255,0.10)]"
                          : "bg-zinc-900 text-white hover:opacity-90 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
                      )}
                      title="Print / Save as PDF"
                    >
                      <FileText size={16} /> Export PDF
                    </button>
                  </div>

                  {/* (Optional) If you want to copy ONLY the narrative without Evidence strength: */}
                  {/* <button onClick={() => navigator.clipboard.writeText(analysisSansEvidence)}>Copy (no confidence)</button> */}
                </div>
              ) : (
                <div className="flex items-start gap-4 p-8 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 text-rose-600 dark:text-rose-300 animate-shake">
                  <AlertCircle size={24} className="mt-0.5" />
                  <div>
                    <p className="font-semibold tracking-[-0.01em]">{errorUi?.msg ?? result?.error}</p>
                    {errorUi?.hint && (
                      <p className="mt-2 text-[12px] text-rose-600/80 dark:text-rose-300/80">{errorUi.hint}</p>
                    )}
                    {result?.error_code && (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">
                        {result.error_code}
                        {lastHttpStatus ? ` • HTTP ${lastHttpStatus}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-2 mt-1 print:hidden">
        <div className="pt-3 flex flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-bold tracking-[0.26em] uppercase opacity-35">© 2026 ExplainMyNumbers</p>
            <div className="flex items-center gap-2 opacity-35">
              <Shield size={12} />
              <span className="text-[10px] font-bold tracking-[0.26em] uppercase">Privacy secured</span>
            </div>
          </div>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-2.5 rounded-xl transition-all",
              "text-zinc-400 hover:text-blue-500",
              "hover:bg-zinc-100/70 dark:hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            )}
            title="X"
            aria-label="X"
          >
            <Twitter size={18} />
          </a>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          color-scheme: light;
        }
        .dark :root {
          color-scheme: dark;
        }

        /* ✅ Force Reset hover style in DARK mode (desktop only) */
        @media (hover: hover) and (pointer: fine) {
          html.dark .emn-reset:hover {
            background: #ffffff !important;
            color: #000000 !important;
          }
        }

        /* ✅ Force Upload hover style in DARK mode (desktop only) */
        @media (hover: hover) and (pointer: fine) {
          html.dark .emn-upload:hover {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: transparent !important;
            box-shadow: 0 18px 60px rgba(255, 255, 255, 0.12) !important;
          }
        }

        /* Global typography + rendering (Apple/Google crisp) */
        html,
        body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
            "Apple Color Emoji", "Segoe UI Emoji";
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::selection {
          background: rgba(59, 130, 246, 0.25);
        }

        /* Subtle shimmer for the hero gradient */
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

        /* Reduced motion support (polite, 2026-standard) */
        @media (prefers-reduced-motion: reduce) {
          .animate-shimmer-text,
          .animate-shake,
          .animate-pulse,
          .animate-spin,
          .animate-ping {
            animation: none !important;
          }
          html:focus-within {
            scroll-behavior: auto;
          }
        }

        /* ✅ Inner scroll */
        .emn-scroll {
          scrollbar-gutter: stable;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;

          /* Firefox */
          scrollbar-width: auto;
          scrollbar-color: rgba(90, 90, 90, 0.42) transparent;
        }

        /* WebKit */
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

        /* Print-to-PDF */
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
