//baseline 

// src/app/page.tsx
"use client";
import { I18N_LOADER_TEXTS } from "@/lib/i18n/loaderTexts";

import { tUi18 } from "@/lib/i18n/uiCopy";
import { I18N_UI_TEXTS } from "@/lib/i18n/inputBoxAndChips";
import { I18N_MESSAGES } from "@/lib/i18n/errorsAndMessages";
import { getBillingStatusLabels } from "@/lib/i18n/billingStatusLabels";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import PrivacyModalContent from "@/components/PrivacyModalContent";

import { getPaywallCopy } from "@/lib/i18n/paywallLabels";
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
  Send,
} from "lucide-react";
// ✅ Deterministic number formatting (prevents SSR/CSR locale mismatch)
const NF = new Intl.NumberFormat("en-GB");
const fmtN = (n: number) => NF.format(n);


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

type BillingStatus = {
  canExplain: boolean;
  reason:
    | "missing_session"
    | "invalid_session"
    | "no_customer"
    | "trial_active"
    | "subscription_active"
    | "subscription_cancelled" // ✅ cancelled but still in period (still has access)
    | "no_entitlement"         // ✅ trial ended OR cancelled & expired OR never subscribed
    
    | "stripe_error";

  trialEndsAt: number | null;

  // ✅ add these (your /api/billing/status already returns them)
  cancelAtPeriodEnd?: boolean | null;
  currentPeriodEnd?: number | null;
  activeSubscriptionId?: string | null;
};


function normalizeBillingReason(raw: any): BillingStatus["reason"] {
  const r = String(raw ?? "").trim().toLowerCase();

  // ✅ Common variants -> your canonical union
  if (r === "subscription_cancelled") return "subscription_cancelled";
  if (r === "subscription_canceled") return "subscription_cancelled"; // US spelling (1 "l")
  if (r === "subscription_canceling") return "subscription_cancelled";
  if (r === "cancelled") return "subscription_cancelled";
  if (r === "canceled") return "subscription_cancelled";

  if (r === "subscription_active") return "subscription_active";
  if (r === "trial_active") return "trial_active";

  if (r === "no_entitlement") return "no_entitlement";
  if (r === "missing_session") return "missing_session";
  if (r === "invalid_session") return "invalid_session";
  if (r === "no_customer") return "no_customer";

  // Fallback (keep UI stable)
  return "stripe_error";
}




type ExplainOk = {
  ok: true;
  explanation: string;
  lang: string; // ✅ authoritative language from backend
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

function daysLeftFromTrialEnd(trialEndsAtSec: number) {
  // Use end-of-day style rounding so “1 day left” doesn’t flicker during the day.
  const msLeft = trialEndsAtSec * 1000 - Date.now();
  const days = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function buildTrialChip(b: BillingStatus | null, uiLang: string, pricePerMonth: string) {
  if (!b) return null;

  const B = getBillingStatusLabels(uiLang);

  // ✅ Subscribed
  if (b.reason === "subscription_active") {
    return {
      tone: "good" as const,
      title: B.subscribed,
      sub: `${pricePerMonth} ${B.active}`,
      cta: "manage" as const,
    };
  }

  // ✅ Cancelling (still has access)
  if (b.reason === "subscription_cancelled") {
    const until =
      typeof b.currentPeriodEnd === "number"
        ? new Date(b.currentPeriodEnd * 1000).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : null;

    return {
      tone: "good" as const,
      title: B.cancelling,
      sub: until ? B.accessUntil(until) : B.cancelling,
      cta: "manage" as const,
    };
  }

  // ✅ Trial active (no Manage)
if (b.reason === "trial_active" && typeof b.trialEndsAt === "number") {
  const d = daysLeftFromTrialEnd(b.trialEndsAt);
  return {
    tone: "trial" as const,
    title: B.trialTitle,
    sub: B.trialDaysLeft(d),
  };
}


  // ✅ Access ended -> Subscribe
  if (b.reason === "no_entitlement") {
    return {
      tone: "ended" as const,
      title: B.accessEnded,
      sub: B.subscribeCta(pricePerMonth),
      cta: "subscribe" as const,
    };
  }

  return null;
}




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
 * ✅ Lightweight i18n for section headers (no library)
 * - Backend is authoritative: we use result.lang (NOT navigator.language)
 * - Fallback to English if language not supported
 */

type SectionKey = "summary" | "changed" | "observations" | "why" | "meaning" | "not" | "evidence";

const HEADER_TO_KEY: Record<string, SectionKey> = {
  "Summary:": "summary",
  "What changed:": "changed",
  "Underlying observations:": "observations",
  "Why it likely changed:": "why",
  "What it means:": "meaning",
  "What NOT to conclude:": "not",
  "Evidence strength:": "evidence",
};

function normalizeLang(lang?: string): string {
  const raw = String(lang || "en").trim().toLowerCase();
  if (!raw) return "en";
  const base = raw.split(/[-_]/)[0]; // "pt-BR" -> "pt", "zh_CN" -> "zh"
  // optional aliases (if your backend ever returns these)
  if (base === "cn") return "zh";
  if (base === "jp") return "ja";
  if (base === "kr") return "ko";
  if (base === "nb" || base === "nn") return "no";   // Norwegian variants -> "no"
if (base === "in") return "id";                    // legacy -> Indonesian
if (base === "zh") {
  // if backend ever returns zh-hans/zh-hant, you can keep them both as zh
  return "zh";
}

  return base;
}

function detectBrowserLang(): string {
  if (typeof window === "undefined") return "en";
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]).filter(
    Boolean
  ) as string[];

  // pick first preferred language
  return normalizeLang(langs[0] || "en");
}

/**
 * Add more languages here if your backend supports them.
 * If a lang is missing, it falls back to English automatically.
 */
const SECTION_TITLES: Record<string, Record<SectionKey, string>> = {
  en: {
    summary: "Summary",
    changed: "What changed",
    observations: "Underlying observations",
    why: "Why it likely changed",
    meaning: "What it means",
    not: "What NOT to conclude",
    evidence: "Confidence",
  },

  it: {
    summary: "Riepilogo",
    changed: "Cosa è cambiato",
    observations: "Osservazioni principali",
    why: "Perché probabilmente è cambiato",
    meaning: "Cosa significa",
    not: "Cosa NON concludere",
    evidence: "Affidabilità",
  },

  fr: {
    summary: "Résumé",
    changed: "Ce qui a changé",
    observations: "Observations principales",
    why: "Pourquoi cela a probablement changé",
    meaning: "Ce que cela signifie",
    not: "Ce qu’il ne faut PAS conclure",
    evidence: "Confiance",
  },

  es: {
    summary: "Resumen",
    changed: "Qué cambió",
    observations: "Observaciones principales",
    why: "Por qué probablemente cambió",
    meaning: "Qué significa",
    not: "Qué NO concluir",
    evidence: "Confianza",
  },

  de: {
    summary: "Zusammenfassung",
    changed: "Was sich geändert hat",
    observations: "Wesentliche Beobachtungen",
    why: "Warum es sich vermutlich geändert hat",
    meaning: "Was es bedeutet",
    not: "Was NICHT geschlossen werden sollte",
    evidence: "Zuverlässigkeit",
  },

  pt: {
    summary: "Resumo",
    changed: "O que mudou",
    observations: "Observações principais",
    why: "Por que provavelmente mudou",
    meaning: "O que isso significa",
    not: "O que NÃO concluir",
    evidence: "Confiabilidade",
  },

  nl: {
    summary: "Samenvatting",
    changed: "Wat is er veranderd",
    observations: "Belangrijkste observaties",
    why: "Waarom het waarschijnlijk veranderde",
    meaning: "Wat het betekent",
    not: "Wat je NIET moet concluderen",
    evidence: "Betrouwbaarheid",
  },

  sv: {
    summary: "Sammanfattning",
    changed: "Vad som ändrades",
    observations: "Viktiga observationer",
    why: "Varför det troligen ändrades",
    meaning: "Vad det betyder",
    not: "Vad du INTE ska dra för slutsats",
    evidence: "Tillförlitlighet",
  },

  no: {
    summary: "Sammendrag",
    changed: "Hva som endret seg",
    observations: "Viktige observasjoner",
    why: "Hvorfor det sannsynligvis endret seg",
    meaning: "Hva det betyr",
    not: "Hva du IKKE bør konkludere",
    evidence: "Pålitelighet",
  },

  da: {
    summary: "Resumé",
    changed: "Hvad der ændrede sig",
    observations: "Vigtige observationer",
    why: "Hvorfor det sandsynligvis ændrede sig",
    meaning: "Hvad det betyder",
    not: "Hvad du IKKE bør konkludere",
    evidence: "Pålidelighed",
  },

  fi: {
    summary: "Yhteenveto",
    changed: "Mikä muuttui",
    observations: "Keskeiset havainnot",
    why: "Miksi se todennäköisesti muuttui",
    meaning: "Mitä se tarkoittaa",
    not: "Mitä EI pidä päätellä",
    evidence: "Luotettavuus",
  },

  pl: {
    summary: "Podsumowanie",
    changed: "Co się zmieniło",
    observations: "Kluczowe obserwacje",
    why: "Dlaczego to prawdopodobnie się zmieniło",
    meaning: "Co to oznacza",
    not: "Czego NIE należy wnioskować",
    evidence: "Wiarygodność",
  },

  tr: {
    summary: "Özet",
    changed: "Ne değişti",
    observations: "Temel gözlemler",
    why: "Neden muhtemelen değişti",
    meaning: "Bu ne anlama geliyor",
    not: "NE sonuç çıkarılmamalı",
    evidence: "Güvenilirlik",
  },

  el: {
    summary: "Σύνοψη",
    changed: "Τι άλλαξε",
    observations: "Κύριες παρατηρήσεις",
    why: "Γιατί πιθανόν άλλαξε",
    meaning: "Τι σημαίνει",
    not: "Τι ΔΕΝ πρέπει να συμπεράνετε",
    evidence: "Αξιοπιστία",
  },

  cs: {
    summary: "Shrnutí",
    changed: "Co se změnilo",
    observations: "Klíčová pozorování",
    why: "Proč se to pravděpodobně změnilo",
    meaning: "Co to znamená",
    not: "Co NENÍ vhodné vyvozovat",
    evidence: "Spolehlivost",
  },

  hu: {
    summary: "Összegzés",
    changed: "Mi változott",
    observations: "Fő megfigyelések",
    why: "Miért valószínű, hogy változott",
    meaning: "Mit jelent",
    not: "Mit NEM szabad levonni",
    evidence: "Megbízhatóság",
  },

  ro: {
    summary: "Rezumat",
    changed: "Ce s-a schimbat",
    observations: "Observații principale",
    why: "De ce probabil s-a schimbat",
    meaning: "Ce înseamnă",
    not: "Ce NU trebuie concluzionat",
    evidence: "Fiabilitate",
  },

  uk: {
    summary: "Підсумок",
    changed: "Що змінилося",
    observations: "Ключові спостереження",
    why: "Чому це, ймовірно, змінилося",
    meaning: "Що це означає",
    not: "Чого НЕ слід висновувати",
    evidence: "Надійність",
  },

  ru: {
    summary: "Сводка",
    changed: "Что изменилось",
    observations: "Основные наблюдения",
    why: "Почему это, вероятно, изменилось",
    meaning: "Что это означает",
    not: "Чего НЕ следует заключать",
    evidence: "Надежность",
  },

  ar: {
    summary: "الملخص",
    changed: "ما الذي تغير",
    observations: "الملاحظات الرئيسية",
    why: "لماذا يُحتمل أنه تغير",
    meaning: "ماذا يعني ذلك",
    not: "ما الذي لا يجب استنتاجه",
    evidence: "الموثوقية",
  },

  he: {
    summary: "סיכום",
    changed: "מה השתנה",
    observations: "תצפיות מרכזיות",
    why: "למה זה כנראה השתנה",
    meaning: "מה זה אומר",
    not: "מה לא להסיק",
    evidence: "מהימנות",
  },

  hi: {
    summary: "सारांश",
    changed: "क्या बदला",
    observations: "मुख्य अवलोकन",
    why: "संभावित रूप से क्यों बदला",
    meaning: "इसका क्या अर्थ है",
    not: "क्या निष्कर्ष नहीं निकालना चाहिए",
    evidence: "विश्वसनीयता",
  },

  bn: {
    summary: "সারাংশ",
    changed: "কি পরিবর্তন হয়েছে",
    observations: "মূল পর্যবেক্ষণ",
    why: "সম্ভবত কেন পরিবর্তন হয়েছে",
    meaning: "এর মানে কী",
    not: "কি সিদ্ধান্ত টানা উচিত নয়",
    evidence: "বিশ্বস্ততা",
  },

  ur: {
    summary: "خلاصہ",
    changed: "کیا بدلا",
    observations: "اہم مشاہدات",
    why: "ممکنہ طور پر کیوں بدلا",
    meaning: "اس کا کیا مطلب ہے",
    not: "کیا نتیجہ نہ نکالیں",
    evidence: "اعتبار",
  },

  id: {
    summary: "Ringkasan",
    changed: "Apa yang berubah",
    observations: "Observasi utama",
    why: "Mengapa kemungkinan berubah",
    meaning: "Apa artinya",
    not: "Apa yang TIDAK boleh disimpulkan",
    evidence: "Keandalan",
  },

  ms: {
    summary: "Ringkasan",
    changed: "Apa yang berubah",
    observations: "Pemerhatian utama",
    why: "Mengapa kemungkinan berubah",
    meaning: "Apa maksudnya",
    not: "Apa yang TIDAK patut disimpulkan",
    evidence: "Kebolehpercayaan",
  },

  th: {
    summary: "สรุป",
    changed: "อะไรเปลี่ยนไป",
    observations: "ข้อสังเกตสำคัญ",
    why: "ทำไมจึงน่าจะเปลี่ยน",
    meaning: "หมายความว่าอย่างไร",
    not: "สิ่งที่ไม่ควรสรุป",
    evidence: "ความน่าเชื่อถือ",
  },

  vi: {
    summary: "Tóm tắt",
    changed: "Điều gì đã thay đổi",
    observations: "Quan sát chính",
    why: "Vì sao có khả năng đã thay đổi",
    meaning: "Nó có ý nghĩa gì",
    not: "KHÔNG nên kết luận gì",
    evidence: "Độ tin cậy",
  },

  ja: {
    summary: "概要",
    changed: "何が変わったか",
    observations: "主な観察結果",
    why: "なぜ変化した可能性があるか",
    meaning: "それが意味すること",
    not: "結論すべきでないこと",
    evidence: "信頼度",
  },

  ko: {
    summary: "요약",
    changed: "무엇이 바뀌었나",
    observations: "주요 관찰 내용",
    why: "왜 바뀌었을 가능성이 있나",
    meaning: "무엇을 의미하나",
    not: "결론지으면 안 되는 점",
    evidence: "신뢰도",
  },

  zh: {
    summary: "摘要",
    changed: "发生了什么变化",
    observations: "关键观察",
    why: "可能发生变化的原因",
    meaning: "这意味着什么",
    not: "不应得出的结论",
    evidence: "可信度",
  },
};



// ✅ Small UI labels used in multiple components
const UI_LABELS = {
  confidence: {
    en: "Confidence",
    it: "Affidabilità",
    fr: "Confiance",
    es: "Confianza",
    de: "Zuverlässigkeit",
    pt: "Confiabilidade",
    nl: "Betrouwbaarheid",
    sv: "Tillförlitlighet",
    no: "Pålitelighet",
    da: "Pålidelighed",
    fi: "Luotettavuus",
    pl: "Wiarygodność",
    tr: "Güvenilirlik",
    el: "Αξιοπιστία",
    cs: "Spolehlivost",
    hu: "Megbízhatóság",
    ro: "Fiabilitate",
    uk: "Надійність",
    ru: "Надежность",
    ar: "الموثوقية",
    he: "מהימנות",
    hi: "विश्वसनीयता",
    bn: "বিশ্বস্ততা",
    ur: "اعتبار",
    id: "Keandalan",
    ms: "Kebolehpercayaan",
    th: "ความน่าเชื่อถือ",
    vi: "Độ tin cậy",
    ja: "信頼度",
    ko: "신뢰도",
    zh: "可信度",
  } as Record<string, string>,
  // ✅ Generic UI / button labels
  explain: {
    en: "Explain",
    it: "Spiega",
    fr: "Expliquer",
    es: "Explicar",
    de: "Erklären",
    pt: "Explicar",
    nl: "Uitleggen",
    sv: "Förklara",
    no: "Forklar",
    da: "Forklar",
    fi: "Selitä",
    pl: "Wyjaśnij",
    tr: "Açıkla",
    el: "Εξήγησε",
    cs: "Vysvětlit",
    hu: "Magyarázd el",
    ro: "Explică",
    uk: "Пояснити",
    ru: "Объяснить",
    ar: "اشرح",
    he: "הסבר",
    hi: "समझाएँ",
    bn: "ব্যাখ্যা",
    ur: "وضاحت کریں",
    id: "Jelaskan",
    ms: "Jelaskan",
    th: "อธิบาย",
    vi: "Giải thích",
    ja: "説明",
    ko: "설명",
    zh: "解释",
  } as Record<string, string>,

  analysing: {
    en: "Analysing…",
    it: "Analisi…",
    fr: "Analyse…",
    es: "Analizando…",
    de: "Analysiere…",
    pt: "Analisando…",
    nl: "Analyseren…",
    sv: "Analyserar…",
    no: "Analyserer…",
    da: "Analyserer…",
    fi: "Analysoidaan…",
    pl: "Analizuję…",
    tr: "Analiz ediliyor…",
    el: "Ανάλυση…",
    cs: "Analyzuji…",
    hu: "Elemzés…",
    ro: "Analizez…",
    uk: "Аналіз…",
    ru: "Анализ…",
    ar: "جارٍ التحليل…",
    he: "מנתח…",
    hi: "विश्लेषण…",
    bn: "বিশ্লেষণ…",
    ur: "تجزیہ…",
    id: "Menganalisis…",
    ms: "Menganalisis…",
    th: "กำลังวิเคราะห์…",
    vi: "Đang phân tích…",
    ja: "分析中…",
    ko: "분석 중…",
    zh: "分析中…",
  } as Record<string, string>,

  edit: {
    en: "Edit",
    it: "Modifica",
    fr: "Modifier",
    es: "Editar",
    de: "Bearbeiten",
    pt: "Editar",
    nl: "Bewerken",
    sv: "Redigera",
    no: "Rediger",
    da: "Rediger",
    fi: "Muokkaa",
    pl: "Edytuj",
    tr: "Düzenle",
    el: "Επεξεργασία",
    cs: "Upravit",
    hu: "Szerkesztés",
    ro: "Editează",
    uk: "Редагувати",
    ru: "Изменить",
    ar: "تعديل",
    he: "עריכה",
    hi: "संपादित करें",
    bn: "সম্পাদনা",
    ur: "ترمیم کریں",
    id: "Edit",
    ms: "Edit",
    th: "แก้ไข",
    vi: "Chỉnh sửa",
    ja: "編集",
    ko: "편집",
    zh: "编辑",
  } as Record<string, string>,

  pasteHere: {
  en: "Paste your data here…",
  it: "Incolla i tuoi dati qui…",
  fr: "Collez vos données ici…",
  es: "Pega tus datos aquí…",
  de: "Daten hier einfügen…",
  pt: "Cole seus dados aqui…",
  nl: "Plak hier je gegevens…",
  sv: "Klistra in dina data här…",
  no: "Lim inn dataene dine her…",
  da: "Indsæt dine data her…",
  fi: "Liitä tietosi tähän…",
  pl: "Wklej tutaj swoje dane…",
  tr: "Verilerinizi buraya yapıştırın…",
  el: "Επικολλήστε τα δεδομένα σας εδώ…",
  cs: "Vložte zde svá data…",
  hu: "Illessze be az adatait ide…",
  ro: "Lipiți datele aici…",
  uk: "Вставте свої дані тут…",
  ru: "Вставьте данные здесь…",
  ar: "الصق بياناتك هنا…",
  he: "הדבק את הנתונים כאן…",
  hi: "अपना डेटा यहाँ चिपकाएँ…",
  bn: "আপনার ডেটা এখানে পেস্ট করুন…",
  ur: "اپنا ڈیٹا یہاں پیسٹ کریں…",
  id: "Tempel data Anda di sini…",
  ms: "Tampal data anda di sini…",
  th: "วางข้อมูลของคุณที่นี่…",
  vi: "Dán dữ liệu của bạn vào đây…",
  ja: "ここにデータを貼り付けてください…",
  ko: "여기에 데이터를 붙여 넣으세요…",
  zh: "在此粘贴你的数据…",
} as Record<string, string>,

processingVectors: {
  en: "Processing numerical vectors…",
  it: "Elaborazione dei vettori numerici…",
  fr: "Traitement des vecteurs numériques…",
  es: "Procesando vectores numéricos…",
  de: "Verarbeitung numerischer Vektoren…",
  pt: "Processando vetores numéricos…",
  nl: "Numerieke vectoren verwerken…",
  sv: "Bearbetar numeriska vektorer…",
  no: "Behandler numeriske vektorer…",
  da: "Behandler numeriske vektorer…",
  fi: "Käsitellään numeerisia vektoreita…",
  pl: "Przetwarzanie wektorów numerycznych…",
  tr: "Sayısal vektörler işleniyor…",
  el: "Επεξεργασία αριθμητικών διανυσμάτων…",
  cs: "Zpracování numerických vektorů…",
  hu: "Numerikus vektorok feldolgozása…",
  ro: "Procesarea vectorilor numerici…",
  uk: "Обробка числових векторів…",
  ru: "Обработка числовых векторов…",
  ar: "جارٍ معالجة المتجهات الرقمية…",
  he: "מעבד וקטורים מספריים…",
  hi: "संख्यात्मक वेक्टर संसाधित किए जा रहे हैं…",
  bn: "সংখ্যাসূচক ভেক্টর প্রক্রিয়াকরণ…",
  ur: "عددی ویکٹرز پر کارروائی جاری ہے…",
  id: "Memproses vektor numerik…",
  ms: "Memproses vektor berangka…",
  th: "กำลังประมวลผลเวกเตอร์เชิงตัวเลข…",
  vi: "Đang xử lý các vectơ số…",
  ja: "数値ベクトルを処理中…",
  ko: "숫자 벡터 처리 중…",
  zh: "正在处理数值向量…",
} as Record<string, string>,

synthesis: {
  en: "Synthesis",
  it: "Sintesi",
  fr: "Synthèse",
  es: "Síntesis",
  de: "Synthese",
  pt: "Síntese",
  nl: "Synthese",
  sv: "Syntes",
  no: "Syntese",
  da: "Syntese",
  fi: "Synteesi",
  pl: "Synteza",
  tr: "Sentez",
  el: "Σύνθεση",
  cs: "Syntéza",
  hu: "Szintézis",
  ro: "Sinteză",
  uk: "Синтез",
  ru: "Синтез",
  ar: "التركيب",
  he: "סינתזה",
  hi: "संश्लेषण",
  bn: "সংশ্লেষ",
  ur: "ترکیب",
  id: "Sintesis",
  ms: "Sintesis",
  th: "การสังเคราะห์",
  vi: "Tổng hợp",
  ja: "統合",
  ko: "종합",
  zh: "综合",
} as Record<string, string>,

uploadFile: {
  en: "Upload file",
  it: "Carica file",
  fr: "Téléverser un fichier",
  es: "Subir archivo",
  de: "Datei hochladen",
  pt: "Enviar arquivo",
  nl: "Bestand uploaden",
  sv: "Ladda upp fil",
  no: "Last opp fil",
  da: "Upload fil",
  fi: "Lataa tiedosto",
  pl: "Prześlij plik",
  tr: "Dosya yükle",
  el: "Μεταφόρτωση αρχείου",
  cs: "Nahrát soubor",
  hu: "Fájl feltöltése",
  ro: "Încarcă fișier",
  uk: "Завантажити файл",
  ru: "Загрузить файл",
  ar: "تحميل ملف",
  he: "העלאת קובץ",
  hi: "फ़ाइल अपलोड करें",
  bn: "ফাইল আপলোড করুন",
  ur: "فائل اپ لوڈ کریں",
  id: "Unggah file",
  ms: "Muat naik fail",
  th: "อัปโหลดไฟล์",
  vi: "Tải tệp lên",
  ja: "ファイルをアップロード",
  ko: "파일 업로드",
  zh: "上传文件",
} as Record<string, string>,

change: {
  en: "Change",
  it: "Cambia",
  fr: "Changer",
  es: "Cambiar",
  de: "Ändern",
  pt: "Alterar",
  nl: "Wijzigen",
  sv: "Ändra",
  no: "Endre",
  da: "Skift",
  fi: "Vaihda",
  pl: "Zmień",
  tr: "Değiştir",
  el: "Αλλαγή",
  cs: "Změnit",
  hu: "Módosítás",
  ro: "Schimbă",
  uk: "Змінити",
  ru: "Изменить",
  ar: "تغيير",
  he: "שנה",
  hi: "बदलें",
  bn: "পরিবর্তন",
  ur: "تبدیل کریں",
  id: "Ubah",
  ms: "Tukar",
  th: "เปลี่ยน",
  vi: "Thay đổi",
  ja: "変更",
  ko: "변경",
  zh: "更改",
} as Record<string, string>,
};



function tSection(header: string, lang?: string): string {
  const key = HEADER_TO_KEY[header];
  if (!key) return header.replace(":", "");

  const l = normalizeLang(lang);
  const dict = SECTION_TITLES[l] ?? SECTION_TITLES.en;
  return dict[key] ?? SECTION_TITLES.en[key];
}




/**
 * PREMIUM FORMATTER
 */
function ElegantAnalysis({
  text,
  theme,
  lang,
}: {
  text: string;
  theme: Theme;
  lang?: string;
}) {
  // ✅ Normalize backend language once per render (handles pt-BR, en-GB, zh-CN, etc.)
  const langNorm = normalizeLang(lang);

  // ✅ Define translation maps once per render (better: move to module scope if you want)
  const REASON_LABEL: Record<string, string> = {
    en: "Reason:",

    it: "Motivo:",
    fr: "Raison :",
    es: "Motivo:",
    de: "Begründung:",

    pt: "Motivo:",
    nl: "Reden:",
    sv: "Orsak:",
    no: "Årsak:",
    da: "Årsag:",
    fi: "Syy:",

    pl: "Powód:",
    tr: "Gerekçe:",
    el: "Λόγος:",
    cs: "Důvod:",
    hu: "Indok:",
    ro: "Motiv:",
    uk: "Причина:",
    ru: "Причина:",

    ar: "السبب:",
    he: "סיבה:",

    hi: "कारण:",
    bn: "কারণ:",
    ur: "وجہ:",

    id: "Alasan:",
    ms: "Sebab:",
    th: "เหตุผล:",
    vi: "Lý do:",

    ja: "理由:",
    ko: "이유:",
    zh: "原因：",
  };

  const LEVEL_LABELS: Record<string, Record<"High" | "Medium" | "Low" | "Unknown", string>> = {
    en: { High: "High", Medium: "Medium", Low: "Low", Unknown: "Unknown" },

    it: { High: "Alta", Medium: "Media", Low: "Bassa", Unknown: "Sconosciuta" },
    fr: { High: "Élevée", Medium: "Moyenne", Low: "Faible", Unknown: "Inconnue" },
    es: { High: "Alta", Medium: "Media", Low: "Baja", Unknown: "Desconocida" },
    de: { High: "Hoch", Medium: "Mittel", Low: "Niedrig", Unknown: "Unbekannt" },

    pt: { High: "Alta", Medium: "Média", Low: "Baixa", Unknown: "Desconhecida" },
    nl: { High: "Hoog", Medium: "Gemiddeld", Low: "Laag", Unknown: "Onbekend" },
    sv: { High: "Hög", Medium: "Medel", Low: "Låg", Unknown: "Okänd" },
    no: { High: "Høy", Medium: "Middels", Low: "Lav", Unknown: "Ukjent" },
    da: { High: "Høj", Medium: "Middel", Low: "Lav", Unknown: "Ukendt" },
    fi: { High: "Korkea", Medium: "Keskitaso", Low: "Matala", Unknown: "Tuntematon" },

    pl: { High: "Wysoka", Medium: "Średnia", Low: "Niska", Unknown: "Nieznana" },
    tr: { High: "Yüksek", Medium: "Orta", Low: "Düşük", Unknown: "Bilinmeyen" },
    el: { High: "Υψηλή", Medium: "Μέτρια", Low: "Χαμηλή", Unknown: "Άγνωστη" },
    cs: { High: "Vysoká", Medium: "Střední", Low: "Nízká", Unknown: "Neznámá" },
    hu: { High: "Magas", Medium: "Közepes", Low: "Alacsony", Unknown: "Ismeretlen" },
    ro: { High: "Ridicată", Medium: "Mediu", Low: "Scăzută", Unknown: "Necunoscută" },
    uk: { High: "Висока", Medium: "Середня", Low: "Низька", Unknown: "Невідома" },
    ru: { High: "Высокая", Medium: "Средняя", Low: "Низкая", Unknown: "Неизвестная" },

    ar: { High: "مرتفعة", Medium: "متوسطة", Low: "منخفضة", Unknown: "غير معروفة" },
    he: { High: "גבוהה", Medium: "בינונית", Low: "נמוכה", Unknown: "לא ידועה" },

    hi: { High: "उच्च", Medium: "मध्यम", Low: "निम्न", Unknown: "अज्ञात" },
    bn: { High: "উচ্চ", Medium: "মাঝারি", Low: "নিম্ন", Unknown: "অজানা" },
    ur: { High: "زیادہ", Medium: "درمیانی", Low: "کم", Unknown: "نامعلوم" },

    id: { High: "Tinggi", Medium: "Sedang", Low: "Rendah", Unknown: "Tidak diketahui" },
    ms: { High: "Tinggi", Medium: "Sederhana", Low: "Rendah", Unknown: "Tidak diketahui" },
    th: { High: "สูง", Medium: "ปานกลาง", Low: "ต่ำ", Unknown: "ไม่ทราบ" },
    vi: { High: "Cao", Medium: "Trung bình", Low: "Thấp", Unknown: "Không rõ" },

    ja: { High: "高い", Medium: "中程度", Low: "低い", Unknown: "不明" },
    ko: { High: "높음", Medium: "중간", Low: "낮음", Unknown: "알 수 없음" },
    zh: { High: "高", Medium: "中等", Low: "低", Unknown: "未知" },
  };

  const reasonLabel = REASON_LABEL[langNorm] ?? REASON_LABEL.en;
  const levelLabels = LEVEL_LABELS[langNorm] ?? LEVEL_LABELS.en;

  const HEADER_KEYS = [
    "Summary:",
    "What changed:",
    "Underlying observations:",
    "Why it likely changed:",
    "What it means:",
    "What NOT to conclude:",
    "Evidence strength:",
  ] as const;

  const AUTO_BULLET_HEADERS = new Set<string>([
    "What changed:",
    "Underlying observations:",
    "Why it likely changed:",
    "What it means:",
    "What NOT to conclude:",
    "Evidence strength:",
  ]);

  // ✅ Pure render helper (no parsing inside)
 const pill = (lvl: "Low" | "Medium" | "High" | null, pct?: number) => {
  const map: Record<string, string> = {
    High: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-500/25",
    Medium: "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/25",
    Low: "bg-rose-500/10 text-rose-800 dark:text-rose-200 border-rose-500/25",
    null: "bg-zinc-500/10 text-zinc-800 dark:text-zinc-200 border-zinc-500/25",
  };

  const lvlKey = (lvl ?? "Unknown") as "High" | "Medium" | "Low" | "Unknown";
  const pillText = levelLabels[lvlKey] ?? levelLabels.Unknown;

  return (
    <div className="flex items-center gap-2">
<div className="pl-6">
  <ElegantPill
    level={lvl}
    lang={lang}
    prefix={false}
    pct={pct}
    pctSeparator=" - "
  />
</div>
    </div>
  );
};


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

    const isHeader = HEADER_KEYS.includes(currentHeader as any);

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
                "text-[11px] md:text-[12px] font-black uppercase tracking-[0.28em]",
                theme === "dark" ? "text-white/70" : "text-zinc-600"
              )}
            >
              {tSection(currentHeader, lang)}
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

                return (
                  <div className="space-y-3">
<div className="flex flex-wrap items-center gap-3">
  {pill(parsed.level, pct ?? undefined)}
</div>

                    <p
                      className={cn(
                        "text-[15px] md:text-[16px] leading-[1.75] font-medium",
                        theme === "dark" ? "text-white/90" : "text-zinc-800"
                      )}
                    >
<span
  className="block pl-7 relative before:content-['•'] before:absolute before:left-0
             before:text-blue-600/40 dark:before:text-blue-400/40"
>
  <span className="font-semibold mr-1">{reasonLabel}</span>
  {cleanNote || trimmed}
</span>


                    </p>
                  </div>
                );
              })()
            ) : (
              trimmed.split("\n").map((line, li) => {
                const l = line ?? "";
                const forceBullet = AUTO_BULLET_HEADERS.has(currentHeader);
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

    // Fallback: render any text that isn't inside a recognized section
    return (
      <p
        key={i}
        className={cn(
          "text-[15px] md:text-[17px] leading-[1.8] font-medium tracking-[-0.012em]",
          theme === "dark" ? "text-white/92" : "text-zinc-800"
        )}
      >
        {trimmed}
      </p>
    );
  });

  return <div>{rendered}</div>;
}


function VisualAnalysisLoader({ uiLang }: { uiLang: string }) {
  const loaderLang = (uiLang in I18N_LOADER_TEXTS ? uiLang : "en") as keyof typeof I18N_LOADER_TEXTS;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 motion-reduce:animate-none">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping motion-reduce:animate-none" />
        <span className="text-[11px] font-bold tracking-[0.26em] text-blue-600/80 dark:text-blue-400/80">
          {UI_LABELS.processingVectors[uiLang] ?? UI_LABELS.processingVectors.en}
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
        <span className="font-semibold">{I18N_LOADER_TEXTS[loaderLang].synthesising}</span>
        <span className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          {I18N_LOADER_TEXTS[loaderLang].pleaseWait}
        </span>
      </div>
    </div>
  );
}


function ElegantPill({
  level,
  lang,
  prefix = true, // ✅ default keeps current behaviour: "Confidence · X"
  pct, // ✅ optional percent (e.g. 58)
  pctSeparator = " - ", // ✅ "Low - 58%"
}: {
  level: "Low" | "Medium" | "High" | null;
  lang?: string;
  prefix?: boolean;
  pct?: number;
  pctSeparator?: string;
}) {
  const config: Record<string, string> = {
    High:
      // ✅ mobile: solid, stable colors (no /10 wash)
      "bg-emerald-50 text-emerald-800 border-emerald-200 " +
      "dark:bg-emerald-950/55 dark:text-emerald-200 dark:border-emerald-500/30 " +
      // ✅ desktop+: keep EXACT current look
      "md:bg-emerald-500/10 md:text-emerald-800 md:dark:text-emerald-200 md:border-emerald-500/25",

    Medium:
      "bg-amber-50 text-amber-900 border-amber-200 " +
      "dark:bg-amber-950/55 dark:text-amber-200 dark:border-amber-500/30 " +
      "md:bg-amber-500/10 md:text-amber-900 md:dark:text-amber-200 md:border-amber-500/25",

    Low:
      "bg-rose-50 text-rose-800 border-rose-200 " +
      "dark:bg-rose-950/55 dark:text-rose-200 dark:border-rose-500/30 " +
      "md:bg-rose-500/10 md:text-rose-800 md:dark:text-rose-200 md:border-rose-500/25",

    null:
      "bg-zinc-50 text-zinc-800 border-zinc-200 " +
      "dark:bg-zinc-900/55 dark:text-zinc-200 dark:border-white/15 " +
      "md:bg-zinc-500/10 md:text-zinc-800 md:dark:text-zinc-200 md:border-zinc-500/25",
  };

  const langNorm = normalizeLang(lang);

  const LEVEL_LABELS: Record<
    string,
    Record<"High" | "Medium" | "Low" | "Unknown", string>
  > = {
    en: { High: "High", Medium: "Medium", Low: "Low", Unknown: "Unknown" },
    it: { High: "Alta", Medium: "Media", Low: "Bassa", Unknown: "Sconosciuta" },
    fr: { High: "Élevée", Medium: "Moyenne", Low: "Faible", Unknown: "Inconnue" },
    es: { High: "Alta", Medium: "Media", Low: "Baja", Unknown: "Desconocida" },
    de: { High: "Hoch", Medium: "Mittel", Low: "Niedrig", Unknown: "Unbekannt" },
    pt: { High: "Alta", Medium: "Média", Low: "Baixa", Unknown: "Desconhecida" },
    nl: { High: "Hoog", Medium: "Gemiddeld", Low: "Laag", Unknown: "Onbekend" },
    sv: { High: "Hög", Medium: "Medel", Low: "Låg", Unknown: "Okänd" },
    no: { High: "Høy", Medium: "Middels", Low: "Lav", Unknown: "Ukjent" },
    da: { High: "Høj", Medium: "Middel", Low: "Lav", Unknown: "Ukendt" },
    fi: { High: "Korkea", Medium: "Keskitaso", Low: "Matala", Unknown: "Tuntematon" },
    pl: { High: "Wysoka", Medium: "Średnia", Low: "Niska", Unknown: "Nieznana" },
    tr: { High: "Yüksek", Medium: "Orta", Low: "Düşük", Unknown: "Bilinmeyen" },
    el: { High: "Υψηλή", Medium: "Μέτρια", Low: "Χαμηλή", Unknown: "Άγνωστη" },
    cs: { High: "Vysoká", Medium: "Střední", Low: "Nízká", Unknown: "Neznámá" },
    hu: { High: "Magas", Medium: "Közepes", Low: "Alacsony", Unknown: "Ismeretlen" },
    ro: { High: "Ridicată", Medium: "Mediu", Low: "Scăzută", Unknown: "Necunoscută" },
    uk: { High: "Висока", Medium: "Середня", Low: "Низька", Unknown: "Невідома" },
    ru: { High: "Высокая", Medium: "Средняя", Low: "Низкая", Unknown: "Неизвестная" },
    ar: { High: "مرتفعة", Medium: "متوسطة", Low: "منخفضة", Unknown: "غير معروفة" },
    he: { High: "גבוהה", Medium: "בינונית", Low: "נמוכה", Unknown: "לא ידועה" },
    hi: { High: "उच्च", Medium: "मध्यम", Low: "निम्न", Unknown: "अज्ञात" },
    bn: { High: "উচ্চ", Medium: "মাঝারি", Low: "নিম্ন", Unknown: "অজানা" },
    ur: { High: "زیادہ", Medium: "درمیانی", Low: "کم", Unknown: "نامعلوم" },
    id: { High: "Tinggi", Medium: "Sedang", Low: "Rendah", Unknown: "Tidak diketahui" },
    ms: { High: "Tinggi", Medium: "Sederhana", Low: "Rendah", Unknown: "Tidak diketahui" },
    th: { High: "สูง", Medium: "ปานกลาง", Low: "ต่ำ", Unknown: "ไม่ทราบ" },
    vi: { High: "Cao", Medium: "Trung bình", Low: "Thấp", Unknown: "Không rõ" },
    ja: { High: "高い", Medium: "中程度", Low: "低い", Unknown: "不明" },
    ko: { High: "높음", Medium: "중간", Low: "낮음", Unknown: "알 수 없음" },
    zh: { High: "高", Medium: "中等", Low: "低", Unknown: "未知" },
  };

  const labels = LEVEL_LABELS[langNorm] ?? LEVEL_LABELS.en;
  const lvlKey = (level ?? "Unknown") as "High" | "Medium" | "Low" | "Unknown";
  const pillText = labels[lvlKey] ?? labels.Unknown;

  const left = prefix
    ? `${UI_LABELS.confidence[langNorm] ?? UI_LABELS.confidence.en} · `
    : "";

  const right = typeof pct === "number" ? `${pctSeparator}${pct}%` : "";

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
{prefix && (
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
)}

      <span>
        {left}
        {pillText}
        {right}
      </span>
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
  children: ReactNode;
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

function friendlyErrorMessage(
  error: ExplainErr["error"],
  code: string | undefined,
  uiLang: string
) {
  if (!code) return error;

  if (code === "INPUT_TOO_LARGE") return error;
  if (code === "UPLOAD_TOO_LARGE") return error;
  if (code === "RATE_LIMITED") return t(uiLang, "RATE_LIMITED");
  if (code === "INVALID_JSON") return t(uiLang, "INVALID_JSON");
  if (code === "EMPTY_INPUT") return t(uiLang, "EMPTY_INPUT");
  if (code === "UPSTREAM_FAILURE") return t(uiLang, "UPSTREAM_FAILURE");
   if (code === "BAD_OUTPUT_FORMAT") return t(uiLang, "BAD_OUTPUT_FORMAT");
  if (code === "NO_MATCHING_SHEET") return error;
  if (code === "EXCEL_PARSE_FAILED") return error;
  if (code === "GATE_REQUIRED") return t(uiLang, "GATE_REQUIRED");
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


function t(lang: string, key: keyof typeof I18N_MESSAGES.en) {
  return (
    I18N_MESSAGES[lang as keyof typeof I18N_MESSAGES]?.[key] ??
    I18N_MESSAGES.en[key]
  );
}

function tUI(lang: string, key: keyof typeof I18N_UI_TEXTS.en) {
  return I18N_UI_TEXTS[lang as keyof typeof I18N_UI_TEXTS]?.[key]
    ?? I18N_UI_TEXTS.en[key];
}

export default function HomePage() {
  const [monthlyPrice, setMonthlyPrice] = useState<string>("£4.99");
 
 useEffect(() => {
  let cancelled = false;

  (async () => {
    const pageUrl = new URL(window.location.href);
    const forcedCountry = pageUrl.searchParams.get("country");

    const endpoint = forcedCountry
      ? `/api/billing/price-preview?country=${encodeURIComponent(forcedCountry)}`
      : "/api/billing/price-preview";

    try {
      const r = await fetch(endpoint, { cache: "no-store" });
      const j = await r.json().catch(() => null);


      if (cancelled) return;

      if (r.ok && j?.ok && typeof j?.symbol === "string" && typeof j?.amount === "number") {
        const display = `${j.symbol}${j.amount.toFixed(2)}`;
        setMonthlyPrice(display);
      } else {
      }
    } catch (e) {
      // keep default "£4.99"
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);



  const [browserLang, setBrowserLang] = useState<string>("en");

useEffect(() => {
  setBrowserLang(detectBrowserLang());
}, []);
  const [theme, setTheme] = useState<Theme>("light");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [lastRunInput, setLastRunInput] = useState<string>("");
  const [copied, setCopied] = useState(false);
const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastHttpStatus, setLastHttpStatus] = useState<number | null>(null);

  const [savedPaste, setSavedPaste] = useState<string>("");
  const [fileStatusLine, setFileStatusLine] = useState<string>("");

  // ✅ NEW: show why "Explain" won't run (instead of disabling the button)
  const [explainBlockReason, setExplainBlockReason] = useState<string>("");

  // ✅ NEW: Paywall state + subscribe flow
  const [paywall, setPaywall] = useState<null | { message: string; reason?: string }>(null);
  
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  // ✅ NEW: Magic link request (secondary CTA)
  const [magicOpen, setMagicOpen] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [magicBusy, setMagicBusy] = useState(false);
  const [magicNote, setMagicNote] = useState<string>(""); // success / error, shown inline

  // ✅ NEW: tracks why we’re sending the magic link
  const [magicIntent, setMagicIntent] = useState<"trial" | "subscribe">("trial");

  const gateRef = useRef<{ token: string; expMs: number } | null>(null);
  const gateInFlight = useRef<Promise<string> | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

  const charCount = text.length;
  const overLimit = charCount > MAX_INPUT_CHARS;

  const hasText = useMemo(() => text.trim().length > 0, [text]);
  const hasFile = !!selectedFile;
  const hasResult = !!result;
  const inputChangedSinceRun = text.trim() !== lastRunInput.trim();
const uiLang = useMemo(() => {
  const fromResult = result?.ok ? result.lang : undefined;

  const fromUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("lang") ?? undefined
      : undefined;

  // Priority: backend → URL override → browser → English
  return normalizeLang(fromResult || fromUrl || browserLang || "en");
}, [result, browserLang]);
const loaderLang = (uiLang in I18N_LOADER_TEXTS
  ? uiLang
  : "en") as keyof typeof I18N_LOADER_TEXTS;

const P = getPaywallCopy(uiLang);
const B = getBillingStatusLabels(uiLang);
const PRICE_PER_MONTH = `${monthlyPrice}${P.perMonth}`;
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
  const reason = url.searchParams.get("reason") ?? "unknown";

  // Backends may use either of these (you now use subscribe=success|cancel)
  const billingParam = url.searchParams.get("billing"); // success | cancel
  const subscribeParam = url.searchParams.get("subscribe"); // success | cancel

  // Your verify-magic-link redirects to /?magic=ok&intent=trial or intent=subscribe_required
  const intent = url.searchParams.get("intent"); // trial | subscribe_required | (etc)

  const checkoutStatus = subscribeParam || billingParam; // normalize


  
  // ✅ Checkout result (subscription)
// ✅ Checkout result (subscription)
if (checkoutStatus === "success") {
  setPaywall(null);
  setMagicNote("");
  setMagicOpen(false);

  // ✅ NEW: refresh billing immediately so chip updates now
  refreshBillingStatus().catch(() => {});

  setExplainBlockReason(tUI(uiLang, "SUBSCRIPTION_ACTIVE_CONTINUE"));
  window.setTimeout(() => setExplainBlockReason(""), 2200);
}
 else if (checkoutStatus === "cancel") {
    setExplainBlockReason(tUI(uiLang, "CHECKOUT_CANCELLED"));
    window.setTimeout(() => setExplainBlockReason(""), 1800);
  }

  // ✅ Magic link results
  if (magic === "ok") {
    // If they tried to start another trial, tell them nicely what to do next
    if (intent === "subscribe_required") {
      setMagicNote(t(uiLang, "FREE_TRIAL_USED_NOTE"));
      setMagicOpen(false);
      setExplainBlockReason(t(uiLang, "FREE_TRIAL_USED_BLOCK"));
      window.setTimeout(() => setExplainBlockReason(""), 2600);
   } else if (intent === "trial") {
  setMagicNote(t(uiLang, "TRIAL_STARTED"));
  setMagicOpen(false);

  // ✅ NEW: refresh billing immediately so chip shows trial_active + days left
  refreshBillingStatus().catch(() => {});

  window.setTimeout(() => setMagicNote(""), 2200);
}
 else {
      setMagicNote("Signed in. You can continue.");
      setMagicOpen(false);
      window.setTimeout(() => setMagicNote(""), 2200);
    }
  } else if (magic === "error") {
    setMagicNote(`Magic link failed (${reason}). Try requesting a new one.`);
  }

  // ✅ Keep URL clean (no reload)
  const shouldClean =
    !!magic || !!reason || !!billingParam || !!subscribeParam || !!intent;

  if (shouldClean) {
    url.searchParams.delete("magic");
    url.searchParams.delete("reason");
    url.searchParams.delete("billing");
    url.searchParams.delete("subscribe");
    url.searchParams.delete("intent");
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
      const res = await fetch("/api/gate", { method: "POST",credentials: "include" });
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

const langParam =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("lang")
    : null;

// Prefer sending the computed UI language to the backend
const explainUrl =
  uiLang && uiLang !== "en"
    ? `/api/explain?lang=${encodeURIComponent(uiLang)}`
    : "/api/explain";


    
let res = await fetch(explainUrl, {
  method: init.method,
  body: init.body ?? null,
  headers: makeHeaders(init.headers, token),
   credentials: "include"
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
  res = await fetch(explainUrl, {
    method: init.method,
    body: init.body ?? null,
    headers: makeHeaders(init.headers, fresh),
    credentials: "include"
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

const [subLoading, setSubLoading] = useState(false);
const [portalLoading, setPortalLoading] = useState(false);

async function goManage() {
  try {
    setPortalLoading(true);
    setExplainBlockReason("");

    const r = await fetch("/api/billing/portal", { method: "POST",credentials: "include" });
    const body = await r.json().catch(() => null);

    if (!r.ok || !body?.ok || !body?.url) {
      throw new Error(body?.error || "Could not open billing portal.");
    }

    window.location.href = body.url;
  } catch (e) {
    console.error(e);
    setExplainBlockReason("Could not open billing settings. Please try again.");
    window.setTimeout(() => setExplainBlockReason(""), 2600);
  } finally {
    setPortalLoading(false);
  }
}

async function goSubscribe() {
  // ✅ Subscribe button → email → magic link → click → Stripe checkout
  setSubLoading(true);

  setMagicIntent("subscribe");
  setMagicOpen(true);
  setMagicNote("");
  setExplainBlockReason("");

  setMagicNote(t(uiLang, "MAGIC_EMAIL_HELP"));

  // if user opens subscribe flow, we consider "loading" done once modal is open
  // (actual redirect happens after they click the link in email)
  setTimeout(() => setSubLoading(false), 250);
}


async function goSubscribeDirect() {
  try {
    setSubLoading(true);
    setExplainBlockReason("");

    const r = await fetch("/api/billing/create-checkout-session", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const j = await r.json().catch(() => ({}));

    // ✅ If they have no session, fall back to email flow
    if (r.status === 401) {
      goSubscribe(); // opens your magic-link modal
      return;
    }

    const url = j?.url || j?.checkoutUrl;
    if (!r.ok || !url) {
      setExplainBlockReason(j?.error || "Could not start checkout. Please try again.");
      window.setTimeout(() => setExplainBlockReason(""), 2600);
      return;
    }

    window.location.href = url;
  } catch (e) {
    console.error(e);
    setExplainBlockReason("Could not start checkout. Please try again.");
    window.setTimeout(() => setExplainBlockReason(""), 2600);
  } finally {
    setSubLoading(false);
  }
}



async function refreshBillingStatus() {
  try {
    const r = await fetch("/api/billing/status", { method: "GET", cache: "no-store",credentials: "include" });
    const j = (await r.json().catch(() => null)) as any;

    if (!j?.ok) return;

    const baseReason = normalizeBillingReason(j.reason);

    // ✅ Frontend safeguard:
    // If Stripe/backend says "subscription_active" but cancelAtPeriodEnd is true,
    // show the "cancelling" UI state.
    const derivedReason: BillingStatus["reason"] =
      baseReason === "subscription_active" && j.cancelAtPeriodEnd === true
        ? "subscription_cancelled"
        : baseReason;

    setBilling({
      canExplain: !!j.canExplain,
      reason: derivedReason,

      trialEndsAt: typeof j.trialEndsAt === "number" ? j.trialEndsAt : null,

      // ✅ extra fields for UI (“Cancelling · access until …”)
      cancelAtPeriodEnd: typeof j.cancelAtPeriodEnd === "boolean" ? j.cancelAtPeriodEnd : null,
      currentPeriodEnd: typeof j.currentPeriodEnd === "number" ? j.currentPeriodEnd : null,
      activeSubscriptionId: typeof j.activeSubscriptionId === "string" ? j.activeSubscriptionId : null,
    });
  } catch {
    // silent
  }
}





useEffect(() => {
  refreshBillingStatus();
  const t = setTimeout(() => refreshBillingStatus(), 350);
  return () => clearTimeout(t);
}, []);




  

  /** ✅ Secondary CTA: request a new magic link (start trial / re-auth) */
  async function handleSendMagicLink() {
  setMagicBusy(true);
  setMagicNote("");

  try {
    const email = magicEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setMagicNote(t(uiLang, "INVALID_EMAIL"));
      return;
    }

    const endpoint =
      magicIntent === "trial"
        ? "/api/auth/start-trial"
        : "/api/auth/start-subscribe";

    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const body = await r.json().catch(() => null);

    // 🟡 Graceful handling of known backend responses
    if (!r.ok || !body?.ok) {
     setMagicNote(body?.error || t(uiLang, "MAGIC_LINK_FAILED"));
      return;
    }

    // ✅ Success UX
    setMagicNote(
      magicIntent === "trial"
        ? t(uiLang, "MAGIC_LINK_TRIAL_SENT")
    : t(uiLang, "MAGIC_LINK_SUBSCRIBE_SENT")
    );
  } catch (err) {
    // 🔴 Only truly unexpected errors land here
    console.error("Unexpected magic link error:", err);
    setMagicNote(t(uiLang, "MAGIC_LINK_UNEXPECTED"));
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
setExplainBlockReason(`Over limit: ${fmtN(charCount)} / ${fmtN(MAX_INPUT_CHARS)}`);
      return;
    }

    if (!hasFile && !hasText) {
      setExplainBlockReason(tUI(uiLang, "PASTE_OR_UPLOAD"));
      return;
    }

    if (!hasFile && hasResult && !inputChangedSinceRun) {
      setExplainBlockReason(tUI(uiLang, "EDIT_INPUT_TO_RERUN"));
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
        res = await callExplainWithGate({ method: "POST", body: fd, });
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

    // ✅ Force the NAV chip into “Access ended · Subscribe”
    setBilling((prev) => ({
      canExplain: false,
      reason: "no_entitlement",
      trialEndsAt: null,
      cancelAtPeriodEnd: null,
      currentPeriodEnd: null,
      activeSubscriptionId: null,
      // keep anything else if you later add fields
      ...(prev ?? {}),
    }));

    setResult(null);

    // ✅ Optional: also refresh from server in the background (keeps dates in sync if backend has them)
    refreshBillingStatus().catch(() => {});

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

    const msg = friendlyErrorMessage(result.error, result.error_code, uiLang);

    const hint =
      result.error_code === "RATE_LIMITED" || lastHttpStatus === 429
        ? "Tip: wait ~60 seconds, then retry."
        : result.error_code === "INPUT_TOO_LARGE" || lastHttpStatus === 413
        ? `Tip: keep it under ${fmtN(MAX_INPUT_CHARS)} characters.`

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
const chip = buildTrialChip(billing, uiLang, PRICE_PER_MONTH);
  
  if (!mounted) {
  // Return a stable placeholder so server + client match.
  // Keep it simple and deterministic (no Date/Math.random).
  return <div className="min-h-screen" />;
}

  return (
<div
  className={cn(
    "relative min-h-screen w-full overflow-x-hidden transition-colors duration-700",
    theme === "dark"
      ? "bg-[#050505] text-white"
      : "bg-[#fafafa] text-zinc-900"
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

 <div className="flex items-center gap-3">
  {chip && (
    <div className="flex items-center gap-2">
      {/* CHIP */}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 select-none",
          "text-[11px] font-semibold tracking-[-0.01em] backdrop-blur-xl",
          theme === "dark"
            ? chip.tone === "trial"
              ? "bg-white/[0.04] border-white/10 text-white/85"
              : chip.tone === "good"
                ? "bg-white/[0.06] border-white/12 text-white/90"
                : "bg-white/[0.03] border-white/10 text-white/70"
            : chip.tone === "trial"
              ? "bg-white border-zinc-200 text-zinc-800"
              : chip.tone === "good"
                ? "bg-white border-zinc-200 text-zinc-900"
                : "bg-white border-zinc-200 text-zinc-700"
        )}
        title={
          chip.tone === "trial"
            ? "Your trial is active"
            : chip.tone === "ended"
              ? "Your trial has ended"
              : "Subscription active"
        }
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            chip.tone === "trial"
              ? theme === "dark"
                ? "bg-indigo-300/80"
                : "bg-indigo-600/70"
              : chip.tone === "good"
                ? theme === "dark"
                  ? "bg-emerald-300/80"
                  : "bg-emerald-600/70"
                : theme === "dark"
                  ? "bg-white/35"
                  : "bg-zinc-400"
          )}
          aria-hidden="true"
        />
{/* Title always visible */}
<span className="font-bold">{chip.title}</span>

{/* Desktop-only: dot + subtitle */}
<span
  className={cn(
    theme === "dark" ? "text-white/55" : "text-zinc-500",
    "hidden sm:inline"
  )}
>
  ·
</span>

<span
  className={cn(
    theme === "dark" ? "text-white/70" : "text-zinc-600",
    "hidden sm:inline"
  )}
>
  {chip.sub}
</span>

      </div>

    {/* CTA: Subscribe OR Manage */}
{chip.cta === "subscribe" ? (
  <button
    type="button"
    onClick={chip.tone === "ended" ? goSubscribeDirect : goSubscribe}
    disabled={subLoading}
    className={cn(
      "relative z-[100] pointer-events-auto", // ensure clickable
      "inline-flex items-center justify-center rounded-full px-3 py-1.5",
      "text-[11px] font-semibold tracking-tight",
      theme === "dark"
        ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
        : "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900/10",
      "transition-transform hover:scale-[1.04] active:scale-[0.96]",
      "disabled:opacity-60 disabled:cursor-not-allowed"
    )}
  >
    {subLoading ? tUI(uiLang, "BTN_REDIRECTING") : tUI(uiLang, "BTN_SUBSCRIBE")}
  </button>
) : chip.cta === "manage" ? (
  <button
    type="button"
    onClick={goManage}
    disabled={portalLoading}
    className={cn(
      "relative z-[100] pointer-events-auto", // ensure clickable
      "inline-flex items-center justify-center rounded-full px-3 py-1.5",
      "text-[11px] font-semibold tracking-tight",
      theme === "dark"
        ? "bg-white/10 hover:bg-white/15 text-white border border-white/10"
        : "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200",
      "transition-transform hover:scale-[1.04] active:scale-[0.96]",
      "disabled:opacity-60 disabled:cursor-not-allowed"
    )}
    title="Manage subscription"
  >
    {portalLoading ? tUI(uiLang, "BTN_OPENING") : tUI(uiLang, "BTN_MANAGE")}
  </button>
) : null}


    </div>
  )}

  {/* EXISTING THEME TOGGLE */}
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


        </div>
      </nav>

      <main className="relative max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6 print:p-0">
        <header className="mb-4 md:mb-6 space-y-2 md:space-y-4 print:hidden">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-[5rem] font-[950] tracking-[-0.065em] leading-[0.86] md:leading-[0.80]">
              <span className="inline text-zinc-300 dark:text-zinc-800 transition-colors duration-700">Ephemiral Data. </span>{" "}
              <span className="inline pb-[0.1em] md:pb-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-400 bg-[length:200%_auto] animate-shimmer-text">
                Explained.
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
                  <span>
  {selectedFile
    ? (UI_LABELS.change[uiLang] ?? UI_LABELS.change.en)
    : (UI_LABELS.uploadFile[uiLang] ?? UI_LABELS.uploadFile.en)}
</span>

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
<IconButton title={tUi18(uiLang, "RESET")} onClick={reset} tone="neutral" className="emn-reset">
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
title={overLimit ? `${fmtN(charCount)}/${fmtN(MAX_INPUT_CHARS)}` : undefined}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin motion-reduce:animate-none" />
<span className="tracking-[0.12em] text-[11px] font-black ">
  {UI_LABELS.analysing[uiLang] ?? UI_LABELS.analysing.en}
</span>
                  </>
                ) : overLimit ? (
                  <>
                    <AlertTriangle size={14} className="opacity-90" />
                    <span className="text-[13px] font-semibold tracking-[-0.01em]">
Over limit {fmtN(charCount)} / {fmtN(MAX_INPUT_CHARS)}
                    </span>
                  </>
                ) : showEditToRerun ? (
                  <>
                    <Pencil size={14} className="opacity-80" />
<span className="text-[14px] font-semibold tracking-[-0.01em]">
  {UI_LABELS.edit[uiLang] ?? UI_LABELS.edit.en}
</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="opacity-80" />
<span className="text-[13px] font-semibold tracking-[-0.01em]">
  {UI_LABELS.explain[uiLang] ?? UI_LABELS.explain.en}
</span>                  </>
                )}
              </button>
            </div>
          </div>

 {/* 💎 2026 Ultra-Premium Paywall UI (calmer + more Apple-grade) */}
{paywall && (
  <div className="px-6 md:px-10 pt-10 pb-6 animate-in fade-in zoom-in-95 duration-700">
    <div
      className={cn(
        "rounded-[3rem] border overflow-hidden relative group isolate",
        "transition-all duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        theme === "dark"
          ? "bg-zinc-950 border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_32px_64px_-16px_rgba(0,0,0,0.6)]"
          : "bg-white border-zinc-200 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_32px_64px_-16px_rgba(0,0,0,0.12)]"
      )}
    >
      {/* ✅ Keep border-beam (subtle) */}
      <div className="pointer-events-none absolute inset-[-2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,rgba(99,102,241,0.28)_180deg,transparent_210deg)] animate-[spin_6s_linear_infinite]" />
      </div>

      {/* ✅ Calm mesh background (no extra shimmer overlays) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute -top-[40%] -left-[12%] w-[72%] h-[82%] rounded-full blur-[120px] opacity-60",
            "transition-transform duration-1000 group-hover:-translate-y-3",
            theme === "dark" ? "bg-indigo-500/12" : "bg-indigo-500/7"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-[22%] -right-[12%] w-[54%] h-[62%] rounded-full blur-[110px] opacity-45",
            theme === "dark" ? "bg-purple-500/10" : "bg-purple-500/6"
          )}
        />
      </div>

      {/* Inner ring for beam */}
      <div className="relative p-1 md:p-[2px]">
        <div
          className={cn(
            "rounded-[2.9rem] p-8 md:p-14 relative overflow-hidden backdrop-blur-3xl",
            theme === "dark" ? "bg-zinc-950/92" : "bg-white/92"
          )}
        >
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
    {/* Visual anchor — desktop only */}
    <div className="relative group/icon md:pt-1 hidden md:block">
    <div
    className={cn(
      "w-20 h-20 rounded-[2rem] flex items-center justify-center relative z-10",
      "transition-all duration-700 group-hover/icon:rotate-[6deg] group-hover/icon:scale-[1.03]",
      theme === "dark"
        ? "bg-gradient-to-b from-zinc-800/70 to-zinc-900/90 border border-white/10"
        : "bg-white border border-zinc-200 shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
    )}
  >
    <CreditCard
      size={32}
      strokeWidth={1.3}
      className={theme === "dark" ? "text-indigo-300" : "text-indigo-600"}
    />
  </div>

  <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-15 scale-75 group-hover/icon:opacity-25 transition-opacity" />
  </div>



            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-3">
                {/* ✅ Calmer badge (no ping) */}
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border",
                    theme === "dark"
                      ? "border-indigo-400/20 bg-indigo-400/5"
                      : "border-indigo-600/15 bg-indigo-600/5"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      theme === "dark"
                        ? "bg-indigo-300 shadow-[0_0_10px_rgba(129,140,248,0.35)]"
                        : "bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.20)]"
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.32em]",
                      theme === "dark" ? "text-indigo-200/90" : "text-indigo-700"
                    )}
                  >
                    {P.badge}
                  </span>
                </div>

                <h2
                  className={cn(
                    "text-3xl md:text-4xl font-semibold tracking-tight leading-[1.08]",
                    theme === "dark" ? "text-white" : "text-zinc-900"
                  )}
                >
                  {P.title}
                </h2>




              </div>

               {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* ✅ Trial button ONLY when eligible/active */}
  {(billing?.reason === "trial_active" ||
  billing?.reason === "missing_session" ||
  billing?.reason === "invalid_session" ||
  billing?.reason === "no_customer") && (           
       <button
                    type="button"
                    onClick={() => {
                      setMagicIntent("trial");
                      setMagicOpen((v) => !v);
                      setMagicNote("");
                    }}
                    className={cn(
                      "relative w-full sm:w-auto overflow-hidden group rounded-full",
                      "px-9 py-4", // ✅ match subscribe padding
                      "min-h-[56px]", // ✅ equal height
                      "sm:min-w-[260px]", // ✅ equal-ish desktop width
                      "cursor-pointer",
                      "transition-transform duration-300",
                      "hover:scale-[1.08]",
                      "active:scale-[0.93]",
                      "motion-reduce:transform-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      theme === "dark"
                        ? [
                            "bg-white/[0.04] text-white/92",
                            "border border-white/12",
                            "hover:bg-white/[0.06] hover:border-white/18",
                            "shadow-[0_18px_50px_-18px_rgba(0,0,0,0.55)]",
                          ].join(" ")
                        : [
                            "bg-white text-zinc-900",
                            "border border-zinc-200",
                            "hover:bg-zinc-50 hover:border-zinc-300",
                            "shadow-[0_18px_50px_-18px_rgba(0,0,0,0.16)]",
                          ].join(" ")
                    )}
                    title={P.trialTitleAttr}
                  >
                    {/* soft inner highlight */}
                    <span
                      className={cn(
                        "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        theme === "dark"
                          ? "bg-[radial-gradient(700px_circle_at_25%_0%,rgba(99,102,241,0.18),transparent_55%)]"
                          : "bg-[radial-gradient(700px_circle_at_25%_0%,rgba(99,102,241,0.10),transparent_55%)]"
                      )}
                    />

                    {/* very subtle sweep */}
                    <span
                      className={cn(
                        "pointer-events-none absolute -inset-y-6 -left-1/2 w-1/3 rotate-12",
                        theme === "dark"
                          ? "bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          : "bg-gradient-to-r from-transparent via-black/10 to-transparent",
                        "translate-x-[-120%] group-hover:translate-x-[420%]",
                        "transition-transform duration-[1200ms] ease-out"
                      )}
                    />

                    <span className="relative z-10 flex flex-col items-center leading-tight">
                      <span className="flex items-center justify-center gap-3">
                        <span className="text-[15px] font-semibold tracking-[-0.01em]">
                          {P.trialCta}
                        </span>
                        <ArrowRight
                          size={18}
                          className={cn(
                            "opacity-70 group-hover:opacity-90 transition-opacity",
                            theme === "dark" ? "text-white/70" : "text-zinc-600"
                          )}
                          aria-hidden="true"
                        />
                      </span>

                      <span
                        className={cn(
                          "mt-0.5 text-[13px] font-medium opacity-70 text-center",
                          theme === "dark" ? "text-white/70" : "text-zinc-600"
                        )}
                      >
                        {P.trialSub}
                      </span>
                    </span>
                  </button>
                )}

                {/* ✅ Subscribe (always shown on paywall) */}
                <button
                  type="button"
                  onClick={goSubscribe}
                  disabled={subLoading}
                  className={cn(
                    "relative w-full sm:w-auto overflow-hidden rounded-full",
                    "px-9 py-4",
                    "min-h-[56px]",
                    "sm:min-w-[260px]",
                    "cursor-pointer",
                    "transition-transform duration-300",
                    "hover:scale-[1.08]",
                    "active:scale-[0.93]",
                    "motion-reduce:transform-none",
                    "text-[15px] font-semibold tracking-[-0.01em]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    theme === "dark"
                      ? "bg-white text-black shadow-[0_18px_50px_-18px_rgba(255,255,255,0.22)] hover:opacity-95"
                      : "bg-zinc-900 text-white shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] hover:bg-black",
                    subLoading && "opacity-90 cursor-wait"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {subLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin motion-reduce:animate-none" />
                        <span>{P.redirecting}</span>
                      </>
                    ) : (
                      <span className="flex flex-col items-center leading-tight">
                        <span className="flex items-center gap-3">
<span>
  {P.subscribeCta} {monthlyPrice}
  {P.perMonth}
</span>                          <ArrowRight size={18} className="opacity-85" />
                        </span>
                        <span className="mt-0.5 text-[13px] font-medium opacity-70">
                          {P.subscribeSub}
                        </span>
                      </span>
                    )}
                  </span>
                </button>
              </div>


            </div>
          </div>

          {/* ✅ Collapsible Magic Panel (calmer + more standard email field) */}
          {magicOpen && (
            <div className="mt-10 animate-in fade-in slide-in-from-top-3 duration-500">
              <div
                className={cn(
                  "p-px rounded-[2.25rem] bg-gradient-to-b",
                  theme === "dark" ? "from-white/10 to-transparent" : "from-zinc-200 to-transparent"
                )}
              >
                <div
                  className={cn(
                    "rounded-[2.15rem] p-6 md:p-8",
                    "flex flex-col md:flex-row gap-4 md:items-end md:justify-between",
                    theme === "dark" ? "bg-zinc-900/45" : "bg-zinc-50/60"
                  )}
                >
                  <div className="w-full space-y-3">
  <div className="space-y-1 text-center md:text-left">
  <p
    className={cn(
      "text-[10px] font-black uppercase tracking-[0.28em]",
      theme === "dark" ? "text-white/55" : "text-zinc-600"
    )}
  >
   {P.secureEmailTitle}
  </p>

  <p
    className={cn(
      "text-[12px] font-medium",
      theme === "dark" ? "text-white/55" : "text-zinc-600"
    )}
  >
    {P.secureEmailDesc}
  </p>
 </div>


                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <label
                          className={cn(
                            "text-[10px] font-black uppercase tracking-[0.24em]",
                            theme === "dark" ? "text-white/55" : "text-zinc-600"
                          )}
                        >
                          {P.emailLabel}
                        </label>
                        <input
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          placeholder={P.emailPlaceholder}
                          className={cn(
                            "mt-2 w-full rounded-2xl border bg-transparent px-4 py-3 outline-none",
                            "text-[15px] md:text-[16px] font-medium tracking-[-0.01em]",
                            "focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
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
                          "transition-transform duration-300",
  "hover:scale-[1.13]",            // 👈 subtle zoom-in on hover
  "active:scale-[0.88]",           // 👈 gentle press-down
  "motion-reduce:transform-none",  // 👈 accessibility-safe

                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                          "cursor-pointer",
                          theme === "dark"
                            ? "bg-white text-black hover:opacity-95"
                            : "bg-zinc-900 text-white hover:bg-black",
                          magicBusy && "opacity-90 cursor-wait",
                          "md:mt-7"
                        )}
                      >
                        {magicBusy ? (
                          <>
                            <Loader2 size={16} className="animate-spin motion-reduce:animate-none" />
                            <span>{P.sending}</span>
                          </>
                        ) : (
                          <>
                            <Mail size={16} className="opacity-85" />
                            <span>{P.sendLink}</span>
                            <ArrowRight size={16} className="opacity-80" />
                          </>
                        )}
                      </button>
                    </div>

                    {!!magicNote && (
                      <div className="mt-2">
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2",
                            "text-[12px] font-semibold tracking-[-0.01em]",
                            theme === "dark"
                              ? "bg-white/[0.02] border-white/10 text-white/70"
                              : "bg-white border-zinc-200 text-zinc-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              theme === "dark" ? "bg-white/35" : "bg-zinc-400"
                            )}
                          />
                          <span>{magicNote}</span>
                        </div>
                      </div>
                    )}

                    <p className={cn("mt-2 text-[11px] leading-relaxed", theme === "dark" ? "text-white/45" : "text-zinc-500")}>
                      {P.sessionTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Calmer dismissal language */}
          <div className={cn("mt-10 flex justify-center pt-6", theme === "dark" ? "border-t border-white/5" : "border-t border-zinc-200/60")}>
            <button
              type="button"
              onClick={() => {
                setPaywall(null);
                setMagicOpen(false);
                setMagicNote("");
              }}
              className={cn(
                "text-[11px] font-black uppercase tracking-[0.36em] transition-opacity duration-300",
                "cursor-pointer",
                theme === "dark" ? "text-white/40 hover:text-white/75" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {P.dismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


          {/* ✅ Hide ALL input UI when paywall is active (prevents typed text showing under it) */}
          {!paywall && (
            <>
              {/* ✅ Inline “why it didn’t run” line — fades/animates elegantly */}
              {!!explainBlockReason && (
                <div className="px-6 md:px-10 pt-4 pb-1">
                  <div
                    className={cn(
                      "emn-fade",
                      "inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2",
                      "text-[12px] font-semibold tracking-[-0.01em]",
                      theme === "dark"
                        ? "bg-rose-500/8 border-rose-500/20 text-rose-200"
                        : "bg-rose-500/6 border-rose-500/15 text-rose-700"
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
                      theme === "dark"
                        ? "bg-white/[0.02] border-white/10 text-white/70"
                        : "bg-white/70 border-zinc-200 text-zinc-700"
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
                placeholder={
  textareaLocked ? "" : (UI_LABELS.pasteHere[uiLang] ?? UI_LABELS.pasteHere.en)
}

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
                      theme === "dark"
                        ? "bg-white/10 text-zinc-200 border border-white/10"
                        : "bg-zinc-100/80 text-zinc-800"
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
Over limit {fmtN(charCount)} / {fmtN(MAX_INPUT_CHARS)}
                        </span>
                      </>
) : showEditToRerun ? (
  UI_LABELS.edit[uiLang] ?? UI_LABELS.edit.en
) : (
  UI_LABELS.explain[uiLang] ?? UI_LABELS.explain.en
)

                    }
                  </button>

                  <button
                    type="button"
                    onClick={reset}
                    className={cn(
                      "p-3 rounded-full border active:scale-[0.98] transition-all cursor-pointer",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
                      theme === "dark"
                        ? "bg-white/10 text-zinc-200 border-white/10"
                        : "bg-zinc-100/80 text-zinc-800 border-zinc-200"
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
            </>
          )}

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
                <VisualAnalysisLoader uiLang={uiLang} />
              ) : result?.ok ? (
                <div>
                  <div className="mb-10 print:mb-6">
  <div className="flex items-center justify-between md:justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-2xl bg-blue-500 flex items-center justify-center print:hidden shadow-[0_18px_60px_rgba(59,130,246,0.35)]">
        <BarChart3 size={16} className="text-white" />
      </div>

      <h3 className="text-[22px] md:text-2xl font-black tracking-[-0.02em]">
        {UI_LABELS.synthesis[uiLang] ?? UI_LABELS.synthesis.en}
      </h3>
    </div>

    {/* Desktop pill (unchanged behaviour) */}
    <div className="hidden md:block">
      <ElegantPill level={evidence.level} lang={result.lang} />
    </div>
  </div>

  {/* Mobile pill: below Synthesis */}
  <div className="mt-3 md:hidden">
    <ElegantPill level={evidence.level} lang={result.lang} />
  </div>
</div>


                  <DetectedSheet meta={detectedSheetMeta} theme={theme} />
                  <WarningsPanel warnings={result.warnings} theme={theme} />
                  <ElegantAnalysis
  text={analysisText}
  theme={theme}
  lang={result.lang}
/>

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
                          {tUi18(uiLang, "COULDNT_COMPLETE")}
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


                  </div>

                  {/* When paywall is active we already show the block above; keep error area clean */}
                  {!paywall && (
                    <div className={cn("rounded-2xl border p-5 md:p-6", theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-zinc-200 bg-white/70")}>
                     <p className={cn("text-[11px] font-black uppercase tracking-[0.28em]", theme === "dark" ? "text-white/60" : "text-zinc-600")}>
  {tUi18(uiLang, "QUICK_CHECKS_TITLE")}
</p>

<ul className={cn("mt-3 space-y-2 text-[13px] leading-relaxed font-medium", theme === "dark" ? "text-white/75" : "text-zinc-700")}>
  <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
    {tUi18(uiLang, "QUICK_CHECK_1")}
  </li>
  <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
    {tUi18(uiLang, "QUICK_CHECK_2")}
  </li>
  <li className="pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-600/40 dark:before:text-blue-400/40">
    {tUi18(uiLang, "QUICK_CHECK_3")}
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
<div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            {/* Panel */}
            <div
              ref={privacyPanelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Privacy"
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                  "pointer-events-auto",
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
                <PrivacyModalContent theme={theme} lang={uiLang} />
              </div>

              <div
                className={cn(
                  "px-6 md:px-8 py-4 flex items-center justify-end gap-2 border-t",
                  theme === "dark" ? "border-white/10" : "border-zinc-200"
                )}
              >

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

        /* --- EMN: subtle fade/slide in for inline banners --- */
@keyframes emnFadeUp {
  from {
    opacity: 0;
    transform: translateY(6px);
    filter: blur(1px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.emn-fade {
  animation: emnFadeUp 260ms ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .emn-fade {
    animation: none !important;
  }
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


