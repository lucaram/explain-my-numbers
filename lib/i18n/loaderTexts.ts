export const I18N_LOADER_TEXTS = {
  en: {
    synthesising: "Synthesising patterns",
    pleaseWait: "Please wait",
  },
  it: {
    synthesising: "Analisi dei modelli",
    pleaseWait: "Attendere",
  },
  fr: {
    synthesising: "Analyse des modèles",
    pleaseWait: "Veuillez patienter",
  },
  es: {
    synthesising: "Analizando patrones",
    pleaseWait: "Espere por favor",
  },
  de: {
    synthesising: "Muster werden analysiert",
    pleaseWait: "Bitte warten",
  },
  pt: {
    synthesising: "Analisando padrões",
    pleaseWait: "Aguarde",
  },
  nl: {
    synthesising: "Patronen analyseren",
    pleaseWait: "Even geduld",
  },
  sv: {
    synthesising: "Analyserar mönster",
    pleaseWait: "Vänligen vänta",
  },
  no: {
    synthesising: "Analyserer mønstre",
    pleaseWait: "Vennligst vent",
  },
  da: {
    synthesising: "Analyserer mønstre",
    pleaseWait: "Vent venligst",
  },
  fi: {
    synthesising: "Analysoidaan malleja",
    pleaseWait: "Odota hetki",
  },
  pl: {
    synthesising: "Analiza wzorców",
    pleaseWait: "Proszę czekać",
  },
  tr: {
    synthesising: "Kalıplar analiz ediliyor",
    pleaseWait: "Lütfen bekleyin",
  },
  el: {
    synthesising: "Ανάλυση μοτίβων",
    pleaseWait: "Παρακαλώ περιμένετε",
  },
  cs: {
    synthesising: "Analýza vzorců",
    pleaseWait: "Čekejte prosím",
  },
  hu: {
    synthesising: "Minták elemzése",
    pleaseWait: "Kérjük, várjon",
  },
  ro: {
    synthesising: "Analiza tiparelor",
    pleaseWait: "Vă rugăm așteptați",
  },

  // 🌍 additional languages you already support elsewhere

  uk: {
    synthesising: "Аналіз шаблонів",
    pleaseWait: "Будь ласка, зачекайте",
  },
  ru: {
    synthesising: "Анализ шаблонов",
    pleaseWait: "Пожалуйста, подождите",
  },
  ar: {
    synthesising: "تحليل الأنماط",
    pleaseWait: "يرجى الانتظار",
  },
  he: {
    synthesising: "ניתוח דפוסים",
    pleaseWait: "אנא המתן",
  },
  hi: {
    synthesising: "पैटर्न का विश्लेषण",
    pleaseWait: "कृपया प्रतीक्षा करें",
  },
  bn: {
    synthesising: "ধাঁচ বিশ্লেষণ করা হচ্ছে",
    pleaseWait: "অনুগ্রহ করে অপেক্ষা করুন",
  },
  ur: {
    synthesising: "پیٹرنز کا تجزیہ",
    pleaseWait: "براہ کرم انتظار کریں",
  },
  id: {
    synthesising: "Menganalisis pola",
    pleaseWait: "Silakan tunggu",
  },
  ms: {
    synthesising: "Menganalisis corak",
    pleaseWait: "Sila tunggu",
  },
  th: {
    synthesising: "กำลังวิเคราะห์รูปแบบ",
    pleaseWait: "โปรดรอสักครู่",
  },
  vi: {
    synthesising: "Đang phân tích mô hình",
    pleaseWait: "Vui lòng chờ",
  },
  ja: {
    synthesising: "パターンを分析中",
    pleaseWait: "お待ちください",
  },
  ko: {
    synthesising: "패턴 분석 중",
    pleaseWait: "잠시만 기다려 주세요",
  },
  zh: {
    synthesising: "正在分析模式",
    pleaseWait: "请稍候",
  },
} as const;

export type LoaderLang = keyof typeof I18N_LOADER_TEXTS;
