export type BillingStatusCopy = {
  subscribed: string;
  active: string;
  cancelling: string;
  accessUntil: (date: string) => string;
  accessEnded: string;
  subscribeCta: (price: string) => string;

  // 🔹 Trial
  trialTitle: string;
  trialDaysLeft: (days: number) => string;
};


export const BILLING_STATUS_COPY: Record<string, BillingStatusCopy> = {
  en: {
    subscribed: "Subscribed",
    active: "active",
    cancelling: "Cancelling",
    accessUntil: (d) => `Access until ${d}`,
    accessEnded: "Access ended",
    subscribeCta: (p) => `Subscribe ${p}`,
    trialTitle: "Free trial",
trialDaysLeft: (d) => `${d} day${d === 1 ? "" : "s"} left`,
  },

  it: {
    subscribed: "Abbonato",
    active: "attivo",
    cancelling: "In disdetta",
    accessUntil: (d) => `Accesso fino al ${d}`,
    accessEnded: "Accesso terminato",
    subscribeCta: (p) => `Abbonati a ${p}`,
    trialTitle: "Prova gratuita",
trialDaysLeft: (d) => `${d} giorn${d === 1 ? "o" : "i"} rimasti`,
  },

  fr: {
    subscribed: "Abonné",
    active: "actif",
    cancelling: "Résiliation",
    accessUntil: (d) => `Accès jusqu’au ${d}`,
    accessEnded: "Accès terminé",
    subscribeCta: (p) => `S’abonner ${p}`,
    trialTitle: "Essai gratuit",
trialDaysLeft: (d) => `${d} jour${d === 1 ? "" : "s"} restant${d === 1 ? "" : "s"}`,
  },

  es: {
    subscribed: "Suscrito",
    active: "activo",
    cancelling: "Cancelando",
    accessUntil: (d) => `Acceso hasta ${d}`,
    accessEnded: "Acceso finalizado",
    subscribeCta: (p) => `Suscribirse ${p}`,
    trialTitle: "Prueba gratuita",
trialDaysLeft: (d) => `${d} día${d === 1 ? "" : "s"} restantes`,
  },

  de: {
    subscribed: "Abonniert",
    active: "aktiv",
    cancelling: "Kündigung läuft",
    accessUntil: (d) => `Zugriff bis ${d}`,
    accessEnded: "Zugriff beendet",
    subscribeCta: (p) => `Abonnieren ${p}`,
    trialTitle: "Kostenlose Testversion",
trialDaysLeft: (d) => `${d} Tag${d === 1 ? "" : "e"} verbleibend`,
  },

  pt: {
    subscribed: "Subscrito",
    active: "ativo",
    cancelling: "Cancelamento",
    accessUntil: (d) => `Acesso até ${d}`,
    accessEnded: "Acesso encerrado",
    subscribeCta: (p) => `Subscrever ${p}`,
    trialTitle: "Teste gratuito",
trialDaysLeft: (d) => `${d} dia${d === 1 ? "" : "s"} restantes`,
  },

  nl: {
    subscribed: "Geabonneerd",
    active: "actief",
    cancelling: "Opzeggend",
    accessUntil: (d) => `Toegang tot ${d}`,
    accessEnded: "Toegang beëindigd",
    subscribeCta: (p) => `Abonneren ${p}`,
    trialTitle: "Gratis proefperiode",
trialDaysLeft: (d) => `${d} dag${d === 1 ? "" : "en"} resterend`,
  },

  sv: {
    subscribed: "Prenumererar",
    active: "aktiv",
    cancelling: "Avslutas",
    accessUntil: (d) => `Åtkomst till ${d}`,
    accessEnded: "Åtkomst avslutad",
    subscribeCta: (p) => `Prenumerera ${p}`,
    trialTitle: "Gratis provperiod",
trialDaysLeft: (d) => `${d} dag${d === 1 ? "" : "ar"} kvar`,
  },

  no: {
    subscribed: "Abonnert",
    active: "aktiv",
    cancelling: "Sies opp",
    accessUntil: (d) => `Tilgang til ${d}`,
    accessEnded: "Tilgang avsluttet",
    subscribeCta: (p) => `Abonner ${p}`,
    trialTitle: "Gratis prøveperiode",
trialDaysLeft: (d) => `${d} dag${d === 1 ? "" : "er"} igjen`,
  },

  da: {
    subscribed: "Abonneret",
    active: "aktiv",
    cancelling: "Opsiges",
    accessUntil: (d) => `Adgang til ${d}`,
    accessEnded: "Adgang afsluttet",
    subscribeCta: (p) => `Abonnér ${p}`,
    trialTitle: "Gratis prøveperiode",
trialDaysLeft: (d) => `${d} dag${d === 1 ? "" : "e"} tilbage`,
  },

  fi: {
    subscribed: "Tilattu",
    active: "aktiivinen",
    cancelling: "Peruutetaan",
    accessUntil: (d) => `Käyttöoikeus ${d} asti`,
    accessEnded: "Käyttöoikeus päättynyt",
    subscribeCta: (p) => `Tilaa ${p}`,
    trialTitle: "Ilmainen kokeilu",
trialDaysLeft: (d) => `${d} päivää jäljellä`,
  },

  pl: {
    subscribed: "Subskrypcja",
    active: "aktywna",
    cancelling: "Anulowana",
    accessUntil: (d) => `Dostęp do ${d}`,
    accessEnded: "Dostęp zakończony",
    subscribeCta: (p) => `Subskrybuj ${p}`,
    trialTitle: "Darmowy okres próbny",
trialDaysLeft: (d) => `Pozostało ${d} dni`,

  },

  tr: {
    subscribed: "Abone",
    active: "aktif",
    cancelling: "İptal ediliyor",
    accessUntil: (d) => `${d} tarihine kadar erişim`,
    accessEnded: "Erişim sona erdi",
    subscribeCta: (p) => `Abone ol ${p}`,
    trialTitle: "Ücretsiz deneme",
trialDaysLeft: (d) => `${d} gün kaldı`,
  },

  el: {
    subscribed: "Εγγεγραμμένος",
    active: "ενεργό",
    cancelling: "Ακύρωση",
    accessUntil: (d) => `Πρόσβαση έως ${d}`,
    accessEnded: "Η πρόσβαση έληξε",
    subscribeCta: (p) => `Εγγραφή ${p}`,
    trialTitle: "Δωρεάν δοκιμή",
trialDaysLeft: (d) => `Απομένουν ${d} ημέρες`,

  },

  cs: {
    subscribed: "Předplaceno",
    active: "aktivní",
    cancelling: "Zrušení",
    accessUntil: (d) => `Přístup do ${d}`,
    accessEnded: "Přístup ukončen",
    subscribeCta: (p) => `Předplatit ${p}`,
    trialTitle: "Zkušební verze zdarma",
trialDaysLeft: (d) => `Zbývá ${d} dní`,
  },

  hu: {
    subscribed: "Előfizetve",
    active: "aktív",
    cancelling: "Lemondás",
    accessUntil: (d) => `Hozzáférés ${d}-ig`,
    accessEnded: "Hozzáférés megszűnt",
    subscribeCta: (p) => `Előfizetés ${p}`,
    trialTitle: "Ingyenes próba",
trialDaysLeft: (d) => `${d} nap van hátra`,
  },

  ro: {
    subscribed: "Abonat",
    active: "activ",
    cancelling: "Anulare",
    accessUntil: (d) => `Acces până la ${d}`,
    accessEnded: "Acces încheiat",
    subscribeCta: (p) => `Abonează-te ${p}`,
    trialTitle: "Probă gratuită",
trialDaysLeft: (d) => `${d} zile rămase`,
  },

  uk: {
    subscribed: "Підписка",
    active: "активна",
    cancelling: "Скасування",
    accessUntil: (d) => `Доступ до ${d}`,
    accessEnded: "Доступ завершено",
    subscribeCta: (p) => `Підписатися ${p}`,
    trialTitle: "Безкоштовна пробна версія",
trialDaysLeft: (d) => `Залишилось ${d} днів`,
  },

  ru: {
    subscribed: "Подписка",
    active: "активна",
    cancelling: "Отмена",
    accessUntil: (d) => `Доступ до ${d}`,
    accessEnded: "Доступ завершён",
    subscribeCta: (p) => `Подписаться ${p}`,
    trialTitle: "Бесплатный пробный период",
trialDaysLeft: (d) => `Осталось ${d} дн.`,
  },

  ar: {
    subscribed: "مشترك",
    active: "نشط",
    cancelling: "قيد الإلغاء",
    accessUntil: (d) => `الوصول حتى ${d}`,
    accessEnded: "انتهى الوصول",
    subscribeCta: (p) => `اشترك ${p}`,
    trialTitle: "تجربة مجانية",
trialDaysLeft: (d) => `متبقي ${d} يوم`,
  },

  he: {
    subscribed: "מנוי",
    active: "פעיל",
    cancelling: "בביטול",
    accessUntil: (d) => `גישה עד ${d}`,
    accessEnded: "הגישה הסתיימה",
    subscribeCta: (p) => `הירשם ${p}`,
    trialTitle: "ניסיון חינם",
trialDaysLeft: (d) => `נותרו ${d} ימים`,
  },

  hi: {
    subscribed: "सदस्यता",
    active: "सक्रिय",
    cancelling: "रद्द हो रहा है",
    accessUntil: (d) => `${d} तक एक्सेस`,
    accessEnded: "एक्सेस समाप्त",
    subscribeCta: (p) => `सब्सक्राइब ${p}`,
    trialTitle: "मुफ़्त परीक्षण",
trialDaysLeft: (d) => `${d} दिन शेष`,
  },

  bn: {
    subscribed: "সাবস্ক্রাইব করা",
    active: "সক্রিয়",
    cancelling: "বাতিল হচ্ছে",
    accessUntil: (d) => `${d} পর্যন্ত অ্যাক্সেস`,
    accessEnded: "অ্যাক্সেস শেষ",
    subscribeCta: (p) => `সাবস্ক্রাইব করুন ${p}`,
    trialTitle: "বিনামূল্যের ট্রায়াল",
trialDaysLeft: (d) => `${d} দিন বাকি`,

  },

  ur: {
    subscribed: "سبسکرائب",
    active: "فعال",
    cancelling: "منسوخ ہو رہا ہے",
    accessUntil: (d) => `${d} تک رسائی`,
    accessEnded: "رسائی ختم",
    subscribeCta: (p) => `سبسکرائب کریں ${p}`,
    trialTitle: "مفت آزمائش",
trialDaysLeft: (d) => `${d} دن باقی`,
  },

  id: {
    subscribed: "Berlangganan",
    active: "aktif",
    cancelling: "Dibatalkan",
    accessUntil: (d) => `Akses hingga ${d}`,
    accessEnded: "Akses berakhir",
    subscribeCta: (p) => `Berlangganan ${p}`,
    trialTitle: "Uji coba gratis",
trialDaysLeft: (d) => `${d} hari tersisa`,
  },

  ms: {
    subscribed: "Dilanggani",
    active: "aktif",
    cancelling: "Dibatalkan",
    accessUntil: (d) => `Akses hingga ${d}`,
    accessEnded: "Akses tamat",
    subscribeCta: (p) => `Langgan ${p}`,
    trialTitle: "Percubaan percuma",
trialDaysLeft: (d) => `${d} hari lagi`,
  },

  th: {
    subscribed: "สมัครแล้ว",
    active: "ใช้งานอยู่",
    cancelling: "กำลังยกเลิก",
    accessUntil: (d) => `เข้าถึงได้ถึง ${d}`,
    accessEnded: "การเข้าถึงสิ้นสุด",
    subscribeCta: (p) => `สมัคร ${p}`,
    trialTitle: "ทดลองใช้งานฟรี",
trialDaysLeft: (d) => `เหลือ ${d} วัน`,
  },

  vi: {
    subscribed: "Đã đăng ký",
    active: "đang hoạt động",
    cancelling: "Đang hủy",
    accessUntil: (d) => `Truy cập đến ${d}`,
    accessEnded: "Truy cập đã kết thúc",
    subscribeCta: (p) => `Đăng ký ${p}`,
    trialTitle: "Dùng thử miễn phí",
trialDaysLeft: (d) => `Còn ${d} ngày`,
  },

  ja: {
    subscribed: "購読中",
    active: "有効",
    cancelling: "解約予定",
    accessUntil: (d) => `${d} まで利用可能`,
    accessEnded: "アクセス終了",
    subscribeCta: (p) => `購読する ${p}`,
    trialTitle: "無料トライアル",
trialDaysLeft: (d) => `残り${d}日`,
  },

  ko: {
    subscribed: "구독 중",
    active: "활성",
    cancelling: "해지 중",
    accessUntil: (d) => `${d}까지 이용 가능`,
    accessEnded: "접근 종료",
    subscribeCta: (p) => `구독 ${p}`,
    trialTitle: "무료 체험",
trialDaysLeft: (d) => `${d}일 남음`,
  },

  zh: {
    subscribed: "已订阅",
    active: "有效",
    cancelling: "正在取消",
    accessUntil: (d) => `可访问至 ${d}`,
    accessEnded: "访问已结束",
    subscribeCta: (p) => `订阅 ${p}`,
    trialTitle: "免费试用",
trialDaysLeft: (d) => `剩余 ${d} 天`,
  },
};

export function getBillingStatusLabels(lang?: string): BillingStatusCopy {
  const raw = String(lang || "en").trim().toLowerCase();
  const base = raw.split(/[-_]/)[0]; // "it-IT" -> "it"
  return BILLING_STATUS_COPY[base] ?? BILLING_STATUS_COPY.en;
}
