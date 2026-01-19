"use client";

import { Shield } from "lucide-react";
import { getPrivacyCopy } from "@/lib/i18n/privacyModalContent";

type Theme = "light" | "dark";

export default function PrivacyModalContent({
  theme,
  lang,
}: {
  theme: Theme;
  lang?: string | null;
}) {
  const copy = getPrivacyCopy(lang);

  const isDark = theme === "dark";

  return (
    <div className="space-y-8" dir={copy.dir ?? "ltr"}>
      {/* Hero section with gradient emphasis */}
      <div className="space-y-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.08))"
              : "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(16,185,129,0.06))",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full animate-pulse ${
              isDark
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            }`}
          />
          <span className="text-[9px] font-black uppercase tracking-[0.32em] bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {copy.pill}
          </span>
        </div>

        <h2
          className="text-[28px] md:text-[32px] font-[950] tracking-[-0.04em] leading-[1.1] animate-in fade-in slide-in-from-top-3 duration-700"
          style={{ animationDelay: "100ms" }}
        >
          <span className={`inline ${isDark ? "text-white" : "text-black"}`}>
            {copy.titlePrivacy}
          </span>{" "}
          <span className="inline text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-500 bg-[length:200%_auto]">
            {copy.titleBuiltIn}
          </span>
        </h2>

        <p
          className={`text-[15px] md:text-[16px] font-medium leading-[1.7] tracking-[-0.015em] animate-in fade-in slide-in-from-top-4 duration-700 ${
            isDark ? "text-white/70" : "text-zinc-600"
          }`}
          style={{ animationDelay: "200ms" }}
        >
          {copy.subtitle}
        </p>
      </div>

      {/* Key message with emphasis */}
      <div
        className={`rounded-[1.75rem] border p-6 md:p-7 relative overflow-hidden animate-in fade-in zoom-in-95 duration-700 transition-all duration-300 hover:shadow-lg ${
          isDark
            ? "bg-gradient-to-br from-white/[0.03] to-white/[0.01] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-br from-blue-50/40 to-emerald-50/30 border-blue-200/40 shadow-[0_20px_50px_rgba(59,130,246,0.08)]"
        }`}
        style={{ animationDelay: "300ms" }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(600px circle at 30% 20%, rgba(59,130,246,0.08), transparent 60%)"
              : "radial-gradient(600px circle at 30% 20%, rgba(59,130,246,0.12), transparent 60%)",
          }}
        />

        <div className="relative space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-1 flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:rotate-12 ${
                isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-500/10 text-blue-700"
              }`}
            >
              <Shield size={18} />
            </div>

            <div className="space-y-2">
              <p
                className={`text-[15px] md:text-[16px] leading-[1.75] font-medium tracking-[-0.015em] ${
                  isDark ? "text-white/90" : "text-zinc-800"
                }`}
              >
                {copy.keyLine1.split("immediately discarded").length === 2 ? (
                  <>
                    {copy.keyLine1.split("immediately discarded")[0]}
                    <span className="font-bold">immediately discarded</span>
                    {copy.keyLine1.split("immediately discarded")[1]}
                  </>
                ) : (
                  copy.keyLine1
                )}
              </p>

              <p
                className={`text-[14px] leading-[1.7] font-medium tracking-[-0.01em] ${
                  isDark ? "text-white/75" : "text-zinc-700"
                }`}
              >
                {copy.keyLine2}
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
        {copy.features.map((item, idx) => (
          <div
            key={item.label}
            className={`group rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default animate-in fade-in slide-in-from-bottom-2 ${
              isDark
                ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
                : "bg-white/60 border-zinc-200 hover:bg-white"
            }`}
            style={{ animationDelay: `${450 + idx * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`text-2xl flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                  isDark ? "bg-white/5" : "bg-zinc-100/70"
                }`}
              >
                {item.icon}
              </div>

              <div className="space-y-1 min-w-0">
                <p className={`text-[14px] font-bold tracking-[-0.015em] ${isDark ? "text-white/95" : "text-zinc-900"}`}>
                  {item.label}
                </p>
                <p className={`text-[13px] leading-[1.6] font-medium tracking-[-0.01em] ${isDark ? "text-white/60" : "text-zinc-600"}`}>
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed guarantees */}
      <div
        className={`rounded-2xl border p-5 md:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700 ${
          isDark ? "bg-white/[0.015] border-white/8" : "bg-zinc-50/50 border-zinc-200/70"
        }`}
        style={{ animationDelay: "600ms" }}
      >
        <div className="flex items-center gap-2">
          <span className={`h-1 w-1 rounded-full ${isDark ? "bg-blue-400/60" : "bg-blue-600/50"}`} />
          <h3 className="text-[11px] font-black uppercase tracking-[0.28em] bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            {copy.commitmentsTitle}
          </h3>
        </div>

        <ul className={`space-y-3.5 text-[13px] md:text-[14px] leading-[1.7] font-medium tracking-[-0.01em] ${isDark ? "text-white/75" : "text-zinc-700"}`}>
          {copy.commitments.map((text, i) => (
            <li key={i} className="flex gap-3 group">
              <span
                className={`mt-[7px] h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-300 group-hover:scale-125 ${
                  isDark
                    ? "bg-gradient-to-r from-blue-400 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    : "bg-gradient-to-r from-blue-500 to-emerald-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                }`}
              />
              <span className="transition-colors duration-300 group-hover:text-current">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Final reassurance */}
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border animate-in fade-in slide-in-from-bottom-2 duration-700 ${
          isDark ? "bg-emerald-500/[0.03] border-emerald-500/15" : "bg-emerald-50/50 border-emerald-200/50"
        }`}
        style={{ animationDelay: "700ms" }}
      >
        <span className="text-xl mt-0.5">✓</span>
        <div>
          <p
            className={`text-[13px] md:text-[14px] leading-[1.7] font-semibold tracking-[-0.01em] ${
              isDark ? "text-emerald-200" : "text-emerald-900"
            }`}
          >
            {copy.finalLine1}
          </p>
          <p
            className={`text-[12px] md:text-[13px] leading-[1.7] font-medium mt-1 ${
              isDark ? "text-emerald-300/70" : "text-emerald-800/70"
            }`}
          >
            {copy.finalLine2}
          </p>
        </div>
      </div>
    </div>
  );
}
