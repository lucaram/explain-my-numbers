// src/lib/i18n/authTrialErrors.ts

export type UiLang18 =
  | "en"
  | "it"
  | "fr"
  | "es"
  | "de"
  | "pt"
  | "nl"
  | "sv"
  | "no"
  | "da"
  | "fi"
  | "pl"
  | "tr"
  | "el"
  | "cs"
  | "hu"
  | "ro"
  | "uk"
  | "ru"
  | "ar"
  | "he"
  | "hi"
  | "bn"
  | "ur"
  | "id"
  | "ms"
  | "th"
  | "vi"
  | "ja"
  | "ko"
  | "zh";

export type AuthTrialErrorKey =
  | "INVALID_EMAIL"
  | "RATE_LIMITED_EMAIL"
  | "TRIAL_NOT_ELIGIBLE"
  | "TRIAL_ALREADY_USED";

export const AUTH_TRIAL_ERRORS: Record<UiLang18, Record<AuthTrialErrorKey, string>> = {
  en: {
    INVALID_EMAIL: "Please enter a valid email address.",
    RATE_LIMITED_EMAIL: "Too many requests for this email. Please try again later.",
    TRIAL_NOT_ELIGIBLE:
      "Free trial is available only for first-time users. Please subscribe to continue.",
    TRIAL_ALREADY_USED: "You’ve already used your free trial. Please subscribe to continue.",
  },

  it: {
    INVALID_EMAIL: "Inserisci un indirizzo email valido.",
    RATE_LIMITED_EMAIL: "Troppe richieste per questa email. Riprova più tardi.",
    TRIAL_NOT_ELIGIBLE:
      "La prova gratuita è disponibile solo per i nuovi utenti. Abbonati per continuare.",
    TRIAL_ALREADY_USED: "Hai già utilizzato la prova gratuita. Abbonati per continuare.",
  },

  fr: {
    INVALID_EMAIL: "Veuillez saisir une adresse e-mail valide.",
    RATE_LIMITED_EMAIL: "Trop de demandes pour cet e-mail. Veuillez réessayer plus tard.",
    TRIAL_NOT_ELIGIBLE:
      "L’essai gratuit est réservé aux nouveaux utilisateurs. Veuillez vous abonner pour continuer.",
    TRIAL_ALREADY_USED:
      "Vous avez déjà utilisé votre essai gratuit. Veuillez vous abonner pour continuer.",
  },

  es: {
    INVALID_EMAIL: "Introduce una dirección de correo válida.",
    RATE_LIMITED_EMAIL: "Demasiadas solicitudes para este correo. Inténtalo más tarde.",
    TRIAL_NOT_ELIGIBLE:
      "La prueba gratis está disponible solo para usuarios nuevos. Suscríbete para continuar.",
    TRIAL_ALREADY_USED: "Ya has usado tu prueba gratis. Suscríbete para continuar.",
  },

  de: {
    INVALID_EMAIL: "Bitte gib eine gültige E-Mail-Adresse ein.",
    RATE_LIMITED_EMAIL:
      "Zu viele Anfragen für diese E-Mail. Bitte versuche es später erneut.",
    TRIAL_NOT_ELIGIBLE:
      "Die kostenlose Testphase ist nur für Erstnutzer verfügbar. Bitte abonniere, um fortzufahren.",
    TRIAL_ALREADY_USED:
      "Du hast deine kostenlose Testphase bereits genutzt. Bitte abonniere, um fortzufahren.",
  },

  pt: {
    INVALID_EMAIL: "Por favor, insira um endereço de e-mail válido.",
    RATE_LIMITED_EMAIL: "Muitas solicitações para este e-mail. Tente novamente mais tarde.",
    TRIAL_NOT_ELIGIBLE:
      "O teste gratuito está disponível apenas para novos utilizadores. Subscreva para continuar.",
    TRIAL_ALREADY_USED: "Você já usou o teste gratuito. Subscreva para continuar.",
  },

  nl: {
    INVALID_EMAIL: "Voer een geldig e-mailadres in.",
    RATE_LIMITED_EMAIL:
      "Te veel aanvragen voor dit e-mailadres. Probeer het later opnieuw.",
    TRIAL_NOT_ELIGIBLE:
      "De gratis proefperiode is alleen beschikbaar voor nieuwe gebruikers. Abonneer om door te gaan.",
    TRIAL_ALREADY_USED:
      "Je hebt je gratis proefperiode al gebruikt. Abonneer om door te gaan.",
  },

  sv: {
    INVALID_EMAIL: "Ange en giltig e-postadress.",
    RATE_LIMITED_EMAIL:
      "För många förfrågningar för den här e-postadressen. Försök igen senare.",
    TRIAL_NOT_ELIGIBLE:
      "Den kostnadsfria provperioden är bara tillgänglig för nya användare. Prenumerera för att fortsätta.",
    TRIAL_ALREADY_USED:
      "Du har redan använt din kostnadsfria provperiod. Prenumerera för att fortsätta.",
  },

  no: {
    INVALID_EMAIL: "Vennligst skriv inn en gyldig e-postadresse.",
    RATE_LIMITED_EMAIL:
      "For mange forespørsler for denne e-posten. Prøv igjen senere.",
    TRIAL_NOT_ELIGIBLE:
      "Gratis prøveperiode er kun tilgjengelig for førstegangsbrukere. Abonner for å fortsette.",
    TRIAL_ALREADY_USED:
      "Du har allerede brukt din gratis prøveperiode. Abonner for å fortsette.",
  },

  da: {
    INVALID_EMAIL: "Indtast venligst en gyldig e-mailadresse.",
    RATE_LIMITED_EMAIL:
      "For mange forespørgsler for denne e-mail. Prøv igen senere.",
    TRIAL_NOT_ELIGIBLE:
      "Gratis prøveperiode er kun tilgængelig for førstegangsbrugere. Abonnér for at fortsætte.",
    TRIAL_ALREADY_USED:
      "Du har allerede brugt din gratis prøveperiode. Abonnér for at fortsætte.",
  },

  fi: {
    INVALID_EMAIL: "Syötä kelvollinen sähköpostiosoite.",
    RATE_LIMITED_EMAIL:
      "Liian monta pyyntöä tälle sähköpostille. Yritä myöhemmin uudelleen.",
    TRIAL_NOT_ELIGIBLE:
      "Ilmainen kokeilu on saatavilla vain ensikertalaisille. Tilaa jatkaaksesi.",
    TRIAL_ALREADY_USED:
      "Olet jo käyttänyt ilmaisen kokeilun. Tilaa jatkaaksesi.",
  },

  pl: {
    INVALID_EMAIL: "Wpisz poprawny adres e-mail.",
    RATE_LIMITED_EMAIL:
      "Zbyt wiele żądań dla tego adresu e-mail. Spróbuj ponownie później.",
    TRIAL_NOT_ELIGIBLE:
      "Bezpłatny okres próbny jest dostępny tylko dla nowych użytkowników. Zasubskrybuj, aby kontynuować.",
    TRIAL_ALREADY_USED:
      "Wykorzystałeś już bezpłatny okres próbny. Zasubskrybuj, aby kontynuować.",
  },

  tr: {
    INVALID_EMAIL: "Lütfen geçerli bir e-posta adresi girin.",
    RATE_LIMITED_EMAIL:
      "Bu e-posta için çok fazla istek var. Lütfen daha sonra tekrar deneyin.",
    TRIAL_NOT_ELIGIBLE:
      "Ücretsiz deneme yalnızca ilk kez kullananlar içindir. Devam etmek için abone olun.",
    TRIAL_ALREADY_USED:
      "Ücretsiz denemenizi zaten kullandınız. Devam etmek için abone olun.",
  },

  el: {
    INVALID_EMAIL: "Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email.",
    RATE_LIMITED_EMAIL:
      "Πάρα πολλά αιτήματα για αυτό το email. Δοκιμάστε ξανά αργότερα.",
    TRIAL_NOT_ELIGIBLE:
      "Η δωρεάν δοκιμή είναι διαθέσιμη μόνο για νέους χρήστες. Κάντε συνδρομή για να συνεχίσετε.",
    TRIAL_ALREADY_USED:
      "Έχετε ήδη χρησιμοποιήσει τη δωρεάν δοκιμή. Κάντε συνδρομή για να συνεχίσετε.",
  },

  cs: {
    INVALID_EMAIL: "Zadejte prosím platnou e-mailovou adresu.",
    RATE_LIMITED_EMAIL:
      "Příliš mnoho požadavků pro tento e-mail. Zkuste to prosím později.",
    TRIAL_NOT_ELIGIBLE:
      "Bezplatná zkušební verze je dostupná jen pro nové uživatele. Pro pokračování se předplaťte.",
    TRIAL_ALREADY_USED:
      "Bezplatnou zkušební verzi jste již využili. Pro pokračování se předplaťte.",
  },

  hu: {
    INVALID_EMAIL: "Kérjük, adjon meg érvényes e-mail címet.",
    RATE_LIMITED_EMAIL:
      "Túl sok kérés érkezett ehhez az e-mailhez. Próbáld meg később.",
    TRIAL_NOT_ELIGIBLE:
      "Az ingyenes próba csak első alkalommal elérhető. Fizess elő a folytatáshoz.",
    TRIAL_ALREADY_USED:
      "Már felhasználtad az ingyenes próbát. Fizess elő a folytatáshoz.",
  },

  ro: {
    INVALID_EMAIL: "Te rugăm să introduci o adresă de email validă.",
    RATE_LIMITED_EMAIL:
      "Prea multe solicitări pentru acest email. Te rugăm să încerci mai târziu.",
    TRIAL_NOT_ELIGIBLE:
      "Perioada de probă gratuită este disponibilă doar pentru utilizatorii noi. Abonează-te pentru a continua.",
    TRIAL_ALREADY_USED:
      "Ai folosit deja perioada de probă gratuită. Abonează-te pentru a continua.",
  },

  uk: {
    INVALID_EMAIL: "Будь ласка, введіть дійсну адресу електронної пошти.",
    RATE_LIMITED_EMAIL:
      "Занадто багато запитів для цієї електронної пошти. Спробуйте пізніше.",
    TRIAL_NOT_ELIGIBLE:
      "Безкоштовна проба доступна лише для нових користувачів. Оформіть підписку, щоб продовжити.",
    TRIAL_ALREADY_USED:
      "Ви вже використали безкоштовну пробу. Оформіть підписку, щоб продовжити.",
  },

  ru: {
    INVALID_EMAIL: "Пожалуйста, введите действительный адрес электронной почты.",
    RATE_LIMITED_EMAIL:
      "Слишком много запросов для этого адреса. Пожалуйста, попробуйте позже.",
    TRIAL_NOT_ELIGIBLE:
      "Бесплатная пробная версия доступна только новым пользователям. Пожалуйста, оформите подписку, чтобы продолжить.",
    TRIAL_ALREADY_USED:
      "Вы уже использовали бесплатную пробную версию. Пожалуйста, оформите подписку, чтобы продолжить.",
  },

  ar: {
    INVALID_EMAIL: "يرجى إدخال عنوان بريد إلكتروني صالح.",
    RATE_LIMITED_EMAIL:
      "طلبات كثيرة جدًا لهذا البريد الإلكتروني. يُرجى المحاولة لاحقًا.",
    TRIAL_NOT_ELIGIBLE:
      "التجربة المجانية متاحة للمستخدمين الجدد فقط. يُرجى الاشتراك للمتابعة.",
    TRIAL_ALREADY_USED:
      "لقد استخدمت التجربة المجانية بالفعل. يُرجى الاشتراك للمتابعة.",
  },

  he: {
    INVALID_EMAIL: "נא להזין כתובת אימייל תקינה.",
    RATE_LIMITED_EMAIL:
      "יותר מדי בקשות עבור כתובת האימייל הזו. נסו שוב מאוחר יותר.",
    TRIAL_NOT_ELIGIBLE:
      "גרסת הניסיון בחינם זמינה רק למשתמשים חדשים. אנא הירשמו למנוי כדי להמשיך.",
    TRIAL_ALREADY_USED:
      "כבר השתמשת בגרסת הניסיון בחינם. אנא הירשמו למנוי כדי להמשיך.",
  },

  hi: {
    INVALID_EMAIL: "कृपया एक मान्य ईमेल पता दर्ज करें।",
    RATE_LIMITED_EMAIL:
      "इस ईमेल के लिए बहुत अधिक अनुरोध हैं। कृपया बाद में फिर से कोशिश करें।",
    TRIAL_NOT_ELIGIBLE:
      "मुफ़्त ट्रायल केवल नए उपयोगकर्ताओं के लिए उपलब्ध है। जारी रखने के लिए सब्सक्राइब करें।",
    TRIAL_ALREADY_USED:
      "आपने अपना मुफ़्त ट्रायल पहले ही इस्तेमाल कर लिया है। जारी रखने के लिए सब्सक्राइब करें।",
  },

  bn: {
    INVALID_EMAIL: "অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা দিন।",
    RATE_LIMITED_EMAIL:
      "এই ইমেইলের জন্য অনুরোধ খুব বেশি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
    TRIAL_NOT_ELIGIBLE:
      "ফ্রি ট্রায়াল শুধুমাত্র নতুন ব্যবহারকারীদের জন্য উপলব্ধ। চালিয়ে যেতে সাবস্ক্রাইব করুন।",
    TRIAL_ALREADY_USED:
      "আপনি ইতিমধ্যেই আপনার ফ্রি ট্রায়াল ব্যবহার করেছেন। চালিয়ে যেতে সাবস্ক্রাইব করুন।",
  },

  ur: {
    INVALID_EMAIL: "براہِ کرم ایک درست ای میل پتہ درج کریں۔",
    RATE_LIMITED_EMAIL:
      "اس ای میل کے لیے بہت زیادہ درخواستیں ہیں۔ براہِ کرم بعد میں دوبارہ کوشش کریں۔",
    TRIAL_NOT_ELIGIBLE:
      "مفت ٹرائل صرف نئے صارفین کے لیے دستیاب ہے۔ جاری رکھنے کے لیے سبسکرائب کریں۔",
    TRIAL_ALREADY_USED:
      "آپ اپنا مفت ٹرائل پہلے ہی استعمال کر چکے ہیں۔ جاری رکھنے کے لیے سبسکرائب کریں۔",
  },

  id: {
    INVALID_EMAIL: "Silakan masukkan alamat email yang valid.",
    RATE_LIMITED_EMAIL:
      "Terlalu banyak permintaan untuk email ini. Silakan coba lagi nanti.",
    TRIAL_NOT_ELIGIBLE:
      "Uji coba gratis hanya tersedia untuk pengguna baru. Silakan berlangganan untuk melanjutkan.",
    TRIAL_ALREADY_USED:
      "Anda sudah menggunakan uji coba gratis. Silakan berlangganan untuk melanjutkan.",
  },

  ms: {
    INVALID_EMAIL: "Sila masukkan alamat e-mel yang sah.",
    RATE_LIMITED_EMAIL:
      "Terlalu banyak permintaan untuk e-mel ini. Sila cuba lagi kemudian.",
    TRIAL_NOT_ELIGIBLE:
      "Percubaan percuma hanya tersedia untuk pengguna baharu. Sila langgan untuk meneruskan.",
    TRIAL_ALREADY_USED:
      "Anda sudah menggunakan percubaan percuma. Sila langgan untuk meneruskan.",
  },

  th: {
    INVALID_EMAIL: "โปรดกรอกอีเมลที่ถูกต้อง",
    RATE_LIMITED_EMAIL:
      "มีคำขอมากเกินไปสำหรับอีเมลนี้ โปรดลองอีกครั้งภายหลัง",
    TRIAL_NOT_ELIGIBLE:
      "ทดลองใช้ฟรีมีให้เฉพาะผู้ใช้ใหม่เท่านั้น โปรดสมัครสมาชิกเพื่อดำเนินการต่อ",
    TRIAL_ALREADY_USED:
      "คุณได้ใช้ทดลองใช้ฟรีไปแล้ว โปรดสมัครสมาชิกเพื่อดำเนินการต่อ",
  },

  vi: {
    INVALID_EMAIL: "Vui lòng nhập địa chỉ email hợp lệ.",
    RATE_LIMITED_EMAIL:
      "Quá nhiều yêu cầu cho email này. Vui lòng thử lại sau.",
    TRIAL_NOT_ELIGIBLE:
      "Dùng thử miễn phí chỉ dành cho người dùng mới. Vui lòng đăng ký để tiếp tục.",
    TRIAL_ALREADY_USED:
      "Bạn đã dùng thử miễn phí rồi. Vui lòng đăng ký để tiếp tục.",
  },

  ja: {
    INVALID_EMAIL: "有効なメールアドレスを入力してください。",
    RATE_LIMITED_EMAIL:
      "このメールアドレスへのリクエストが多すぎます。しばらくしてから再試行してください。",
    TRIAL_NOT_ELIGIBLE:
      "無料トライアルは初回利用の方のみ対象です。続行するには購読してください。",
    TRIAL_ALREADY_USED:
      "無料トライアルはすでに利用済みです。続行するには購読してください。",
  },

  ko: {
    INVALID_EMAIL: "유효한 이메일 주소를 입력해 주세요.",
    RATE_LIMITED_EMAIL:
      "이 이메일에 대한 요청이 너무 많습니다. 나중에 다시 시도해 주세요.",
    TRIAL_NOT_ELIGIBLE:
      "무료 체험은 신규 사용자에게만 제공됩니다. 계속하려면 구독해 주세요.",
    TRIAL_ALREADY_USED:
      "이미 무료 체험을 사용하셨습니다. 계속하려면 구독해 주세요.",
  },

  zh: {
    INVALID_EMAIL: "请输入有效的电子邮箱地址。",
    RATE_LIMITED_EMAIL: "该邮箱请求过多。请稍后再试。",
    TRIAL_NOT_ELIGIBLE: "免费试用仅适用于首次使用的用户。请订阅以继续。",
    TRIAL_ALREADY_USED: "你已经使用过免费试用。请订阅以继续。",
  },
} as const;

export function normalizeUiLang18(lang: string | null | undefined): UiLang18 {
  const s = String(lang ?? "")
    .trim()
    .toLowerCase()
    .split(",")[0]
    ?.split(";")[0]
    ?.split(/[-_]/)[0]
    ?.trim();

  const supported: readonly UiLang18[] = [
    "en",
    "it",
    "fr",
    "es",
    "de",
    "pt",
    "nl",
    "sv",
    "no",
    "da",
    "fi",
    "pl",
    "tr",
    "el",
    "cs",
    "hu",
    "ro",
    "uk",
    "ru",
    "ar",
    "he",
    "hi",
    "bn",
    "ur",
    "id",
    "ms",
    "th",
    "vi",
    "ja",
    "ko",
    "zh",
  ];

  return supported.includes(s as UiLang18) ? (s as UiLang18) : "en";
}

export function tAuthTrial(lang: string | null | undefined, key: AuthTrialErrorKey): string {
  const L = normalizeUiLang18(lang);
  return AUTH_TRIAL_ERRORS[L]?.[key] ?? AUTH_TRIAL_ERRORS.en[key] ?? "";
}
