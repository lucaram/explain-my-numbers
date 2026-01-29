// src/lib/email.ts
import { Resend } from "resend";

export type SendMagicLinkParams = {
  to: string;
  verifyUrl: string;

  // ✅ add "login" for cross-device sign-in / continue trial
  mode: "trial" | "subscribe" | "login";

  trialDays?: number;

  // ✅ optional language for translated email copy
  // (we’ll force English for now)
  lang?: string | null;
};

type EmailLang =
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

function normalizeEmailLang(lang: string | null | undefined): EmailLang {
  const s = String(lang ?? "")
    .trim()
    .toLowerCase()
    .split(",")[0]
    ?.split(";")[0]
    ?.split(/[-_]/)[0]
    ?.trim();

  const supported: readonly EmailLang[] = [
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

  return supported.includes(s as EmailLang) ? (s as EmailLang) : "en";
}

type EmailCopy = {
  // subject lines
  subjectTrial: (days: number) => string;
  subjectSubscribe: string;

  // headings
  titleTrial: string;
  titleSubscribe: string;

  // body lines
  subtitleTrial: (days: number) => string;
  subtitleSubscribe: string;

  // buttons
  buttonTrial: string;
  buttonSubscribe: string;

  // footer
  footer: string;

  // optional direction
  dir?: "ltr" | "rtl";
};

const EMAIL_COPY: Record<EmailLang, EmailCopy> = {
  en: {
    subjectTrial: (days) => `Your magic link to start your ${days}-day free trial`,
    subjectSubscribe: "Your magic link to subscribe",
    titleTrial: "Welcome to Explain My Numbers!",
    titleSubscribe: "Continue to subscription",
    subtitleTrial: (days) => `Click the button below to start your ${days}-day trial. No card required.`,
    subtitleSubscribe: "Click the button below and you’ll be redirected to secure Stripe Checkout.",
    buttonTrial: "Start free trial",
    buttonSubscribe: "Go to Checkout",
    footer: "This link expires in 15 minutes. If you didn’t request this, you can ignore this email.",
    dir: "ltr",
  },

  // ⬇️ kept as-is for later (we’ll update languages later)
  it: {
    subjectTrial: (days) => `Il tuo link per avviare la prova gratuita di ${days} giorni`,
    subjectSubscribe: "Il tuo link magico per abbonarti",
    titleTrial: "Benvenuto su Explain My Numbers!",
    titleSubscribe: "Procedi con l’abbonamento",
    subtitleTrial: (days) =>
      `Clicca il pulsante qui sotto per iniziare la prova di ${days} giorni. Nessuna carta richiesta.`,
    subtitleSubscribe: "Clicca il pulsante qui sotto e verrai reindirizzato al checkout sicuro di Stripe.",
    buttonTrial: "Inizia prova gratuita",
    buttonSubscribe: "Vai al Checkout",
    footer: "Questo link scade tra 15 minuti. Se non l’hai richiesto, puoi ignorare questa email.",
    dir: "ltr",
  },

  fr: {
    subjectTrial: (days) => `Votre lien magique pour démarrer votre essai gratuit de ${days} jours`,
    subjectSubscribe: "Votre lien magique pour vous abonner",
    titleTrial: "Bienvenue sur Explain My Numbers!",
    titleSubscribe: "Continuer vers l’abonnement",
    subtitleTrial: (days) =>
      `Cliquez sur le bouton ci-dessous pour démarrer votre essai de ${days} jours. Aucune carte requise.`,
    subtitleSubscribe:
      "Cliquez sur le bouton ci-dessous et vous serez redirigé vers le paiement sécurisé Stripe.",
    buttonTrial: "Démarrer l’essai",
    buttonSubscribe: "Aller au paiement",
    footer:
      "Ce lien expire dans 15 minutes. Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.",
    dir: "ltr",
  },

  es: {
    subjectTrial: (days) => `Tu enlace mágico para iniciar tu prueba gratis de ${days} días`,
    subjectSubscribe: "Tu enlace mágico para suscribirte",
    titleTrial: "¡Bienvenido a Explain My Numbers!",
    titleSubscribe: "Continuar a la suscripción",
    subtitleTrial: (days) =>
      `Haz clic en el botón de abajo para iniciar tu prueba de ${days} días. No se requiere tarjeta.`,
    subtitleSubscribe: "Haz clic en el botón de abajo y serás redirigido al Checkout seguro de Stripe.",
    buttonTrial: "Iniciar prueba",
    buttonSubscribe: "Ir a Checkout",
    footer: "Este enlace caduca en 15 minutos. Si no lo solicitaste, puedes ignorar este correo.",
    dir: "ltr",
  },

  de: {
    subjectTrial: (days) => `Dein Magic-Link zum Start deiner ${days}-tägigen Gratis-Testphase`,
    subjectSubscribe: "Dein Magic-Link zum Abonnieren",
    titleTrial: "Willkommen bei Explain My Numbers!",
    titleSubscribe: "Weiter zum Abo",
    subtitleTrial: (days) =>
      `Klicke auf den Button unten, um deine ${days}-tägige Testphase zu starten. Keine Karte erforderlich.`,
    subtitleSubscribe: "Klicke auf den Button unten und du wirst zum sicheren Stripe Checkout weitergeleitet.",
    buttonTrial: "Testphase starten",
    buttonSubscribe: "Zum Checkout",
    footer:
      "Dieser Link läuft in 15 Minuten ab. Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.",
    dir: "ltr",
  },

  pt: {
    subjectTrial: (days) => `Seu link mágico para iniciar seu teste grátis de ${days} dias`,
    subjectSubscribe: "Seu link mágico para assinar",
    titleTrial: "Bem-vindo ao Explain My Numbers!",
    titleSubscribe: "Continuar para a assinatura",
    subtitleTrial: (days) => `Clique no botão abaixo para iniciar seu teste de ${days} dias. Não é necessário cartão.`,
    subtitleSubscribe: "Clique no botão abaixo e você será redirecionado para o Checkout seguro da Stripe.",
    buttonTrial: "Iniciar teste",
    buttonSubscribe: "Ir para Checkout",
    footer: "Este link expira em 15 minutos. Se você não solicitou, pode ignorar este e-mail.",
    dir: "ltr",
  },

  nl: {
    subjectTrial: (days) => `Je magische link om je gratis proefperiode van ${days} dagen te starten`,
    subjectSubscribe: "Je magische link om je te abonneren",
    titleTrial: "Welkom bij Explain My Numbers!",
    titleSubscribe: "Doorgaan naar abonnement",
    subtitleTrial: (days) =>
      `Klik op de knop hieronder om je proefperiode van ${days} dagen te starten. Geen kaart nodig.`,
    subtitleSubscribe: "Klik op de knop hieronder en je wordt doorgestuurd naar de veilige Stripe Checkout.",
    buttonTrial: "Proef starten",
    buttonSubscribe: "Naar Checkout",
    footer:
      "Deze link verloopt over 15 minuten. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
    dir: "ltr",
  },

  sv: {
    subjectTrial: (days) => `Din magiska länk för att starta din ${days}-dagars gratis provperiod`,
    subjectSubscribe: "Din magiska länk för att prenumerera",
    titleTrial: "Välkommen till Explain My Numbers!",
    titleSubscribe: "Fortsätt till prenumeration",
    subtitleTrial: (days) =>
      `Klicka på knappen nedan för att starta din provperiod på ${days} dagar. Inget kort krävs.`,
    subtitleSubscribe: "Klicka på knappen nedan så skickas du vidare till säker Stripe Checkout.",
    buttonTrial: "Starta provperiod",
    buttonSubscribe: "Gå till Checkout",
    footer: "Den här länken går ut om 15 minuter. Om du inte begärde detta kan du ignorera mejlet.",
    dir: "ltr",
  },

  no: {
    subjectTrial: (days) => `Din magiske lenke for å starte din ${days}-dagers gratis prøveperiode`,
    subjectSubscribe: "Din magiske lenke for å abonnere",
    titleTrial: "Velkommen til Explain My Numbers!",
    titleSubscribe: "Fortsett til abonnement",
    subtitleTrial: (days) =>
      `Klikk på knappen nedenfor for å starte prøveperioden på ${days} dager. Ingen kort kreves.`,
    subtitleSubscribe: "Klikk på knappen nedenfor, så blir du sendt til sikker Stripe Checkout.",
    buttonTrial: "Start prøveperiode",
    buttonSubscribe: "Gå til Checkout",
    footer: "Denne lenken utløper om 15 minutter. Hvis du ikke ba om dette, kan du ignorere denne e-posten.",
    dir: "ltr",
  },

  da: {
    subjectTrial: (days) => `Dit magiske link til at starte din gratis prøveperiode på ${days} dage`,
    subjectSubscribe: "Dit magiske link til at abonnere",
    titleTrial: "Velkommen til Explain My Numbers!",
    titleSubscribe: "Fortsæt til abonnement",
    subtitleTrial: (days) =>
      `Klik på knappen nedenfor for at starte din prøveperiode på ${days} dage. Intet kort kræves.`,
    subtitleSubscribe: "Klik på knappen nedenfor, så bliver du sendt videre til sikker Stripe Checkout.",
    buttonTrial: "Start prøveperiode",
    buttonSubscribe: "Gå til Checkout",
    footer: "Dette link udløber om 15 minutter. Hvis du ikke anmodede om det, kan du ignorere denne e-mail.",
    dir: "ltr",
  },

  fi: {
    subjectTrial: (days) => `Taikalinkkisi ${days} päivän ilmaisen kokeilun aloittamiseen`,
    subjectSubscribe: "Taikalinkkisi tilaukseen",
    titleTrial: "Tervetuloa Explain My Numbersiin!",
    titleSubscribe: "Jatka tilaukseen",
    subtitleTrial: (days) =>
      `Napsauta alla olevaa painiketta aloittaaksesi ${days} päivän kokeilun. Korttia ei tarvita.`,
    subtitleSubscribe: "Napsauta alla olevaa painiketta ja sinut ohjataan turvalliseen Stripe Checkoutiin.",
    buttonTrial: "Aloita kokeilu",
    buttonSubscribe: "Siirry Checkoutiin",
    footer:
      "Linkki vanhenee 15 minuutissa. Jos et pyytänyt tätä, voit jättää tämän sähköpostin huomiotta.",
    dir: "ltr",
  },

  pl: {
    subjectTrial: (days) => `Twój magiczny link, aby rozpocząć ${days}-dniowy darmowy okres próbny`,
    subjectSubscribe: "Twój magiczny link do subskrypcji",
    titleTrial: "Witamy w Explain My Numbers!",
    titleSubscribe: "Przejdź do subskrypcji",
    subtitleTrial: (days) =>
      `Kliknij przycisk poniżej, aby rozpocząć ${days}-dniowy okres próbny. Karta nie jest wymagana.`,
    subtitleSubscribe: "Kliknij przycisk poniżej, a zostaniesz przekierowany do bezpiecznego Stripe Checkout.",
    buttonTrial: "Start okresu próbnego",
    buttonSubscribe: "Przejdź do Checkout",
    footer:
      "Ten link wygaśnie za 15 minut. Jeśli nie prosiłeś o to, możesz zignorować tę wiadomość.",
    dir: "ltr",
  },

  tr: {
    subjectTrial: (days) => `${days} günlük ücretsiz denemenizi başlatmak için sihirli bağlantınız`,
    subjectSubscribe: "Abonelik için sihirli bağlantınız",
    titleTrial: "Explain My Numbers’a hoş geldiniz!",
    titleSubscribe: "Aboneliğe devam et",
    subtitleTrial: (days) => `${days} günlük denemenizi başlatmak için aşağıdaki düğmeye tıklayın. Kart gerekmez.`,
    subtitleSubscribe: "Aşağıdaki düğmeye tıklayın ve güvenli Stripe Checkout’a yönlendirileceksiniz.",
    buttonTrial: "Ücretsiz denemeyi başlat",
    buttonSubscribe: "Checkout’a git",
    footer: "Bu bağlantı 15 dakika içinde sona erer. Siz talep etmediyseniz bu e-postayı yok sayabilirsiniz.",
    dir: "ltr",
  },

  el: {
    subjectTrial: (days) => `Ο μαγικός σύνδεσμός σας για να ξεκινήσετε τη δωρεάν δοκιμή ${days} ημερών`,
    subjectSubscribe: "Ο μαγικός σύνδεσμός σας για συνδρομή",
    titleTrial: "Καλώς ήρθατε στο Explain My Numbers!",
    titleSubscribe: "Συνέχεια στη συνδρομή",
    subtitleTrial: (days) =>
      `Πατήστε το κουμπί παρακάτω για να ξεκινήσετε τη δοκιμή ${days} ημερών. Δεν απαιτείται κάρτα.`,
    subtitleSubscribe: "Πατήστε το κουμπί παρακάτω και θα μεταφερθείτε στο ασφαλές Stripe Checkout.",
    buttonTrial: "Έναρξη δοκιμής",
    buttonSubscribe: "Μετάβαση στο Checkout",
    footer: "Ο σύνδεσμος λήγει σε 15 λεπτά. Αν δεν το ζητήσατε, μπορείτε να αγνοήσετε αυτό το email.",
    dir: "ltr",
  },

  cs: {
    subjectTrial: (days) => `Váš magický odkaz pro spuštění ${days}denní zkušební verze zdarma`,
    subjectSubscribe: "Váš magický odkaz k předplatnému",
    titleTrial: "Vítejte v Explain My Numbers!",
    titleSubscribe: "Pokračovat k předplatnému",
    subtitleTrial: (days) =>
      `Klikněte na tlačítko níže a spusťte ${days}denní zkušební verzi. Karta není potřeba.`,
    subtitleSubscribe: "Klikněte na tlačítko níže a budete přesměrováni na bezpečný Stripe Checkout.",
    buttonTrial: "Spustit zkoušku",
    buttonSubscribe: "Přejít na Checkout",
    footer: "Tento odkaz vyprší za 15 minut. Pokud jste o to nežádali, můžete tento e-mail ignorovat.",
    dir: "ltr",
  },

  hu: {
    subjectTrial: (days) => `Varázslinked a ${days} napos ingyenes próba elindításához`,
    subjectSubscribe: "Varázslinked az előfizetéshez",
    titleTrial: "Üdvözöljük az Explain My Numbersben!",
    titleSubscribe: "Tovább az előfizetéshez",
    subtitleTrial: (days) =>
      `Kattints az alábbi gombra a ${days} napos próba elindításához. Bankkártya nem szükséges.`,
    subtitleSubscribe: "Kattints az alábbi gombra, és átirányítunk a biztonságos Stripe Checkout oldalra.",
    buttonTrial: "Próba indítása",
    buttonSubscribe: "Checkout megnyitása",
    footer:
      "A link 15 percen belül lejár. Ha nem te kérted, nyugodtan hagyd figyelmen kívül ezt az e-mailt.",
    dir: "ltr",
  },

  ro: {
    subjectTrial: (days) => `Linkul tău magic pentru a începe perioada de probă gratuită de ${days} zile`,
    subjectSubscribe: "Linkul tău magic pentru abonare",
    titleTrial: "Bine ați venit la Explain My Numbers!",
    titleSubscribe: "Continuă către abonament",
    subtitleTrial: (days) =>
      `Apasă butonul de mai jos pentru a începe perioada de probă de ${days} zile. Nu este necesar card.`,
    subtitleSubscribe: "Apasă butonul de mai jos și vei fi redirecționat către Stripe Checkout securizat.",
    buttonTrial: "Pornește proba",
    buttonSubscribe: "Mergi la Checkout",
    footer: "Acest link expiră în 15 minute. Dacă nu ai solicitat acest lucru, poți ignora acest email.",
    dir: "ltr",
  },

  uk: {
    subjectTrial: (days) => `Ваш магічний лінк для старту ${days}-денної безкоштовної проби`,
    subjectSubscribe: "Ваш магічний лінк для оформлення підписки",
    titleTrial: "Ласкаво просимо до Explain My Numbers!",
    titleSubscribe: "Перейти до підписки",
    subtitleTrial: (days) => `Натисніть кнопку нижче, щоб розпочати ${days}-денну пробу. Картка не потрібна.`,
    subtitleSubscribe: "Натисніть кнопку нижче, і вас буде перенаправлено до безпечного Stripe Checkout.",
    buttonTrial: "Почати пробу",
    buttonSubscribe: "Перейти до Checkout",
    footer: "Цей лінк дійсний 15 хвилин. Якщо ви цього не запитували, можете проігнорувати цей лист.",
    dir: "ltr",
  },

  ru: {
    subjectTrial: (days) => `Ваша магическая ссылка для запуска бесплатного пробного периода на ${days} дней`,
    subjectSubscribe: "Ваша магическая ссылка для оформления подписки",
    titleTrial: "Добро пожаловать в Explain My Numbers!",
    titleSubscribe: "Перейти к подписке",
    subtitleTrial: (days) => `Нажмите кнопку ниже, чтобы начать пробный период на ${days} дней. Карта не требуется.`,
    subtitleSubscribe: "Нажмите кнопку ниже — вы будете перенаправлены в безопасный Stripe Checkout.",
    buttonTrial: "Начать пробный период",
    buttonSubscribe: "Перейти к Checkout",
    footer: "Ссылка действует 15 минут. Если вы не запрашивали это, просто проигнорируйте это письмо.",
    dir: "ltr",
  },

  ar: {
    subjectTrial: (days) => `رابطك السحري لبدء التجربة المجانية لمدة ${days} يومًا`,
    subjectSubscribe: "رابطك السحري للاشتراك",
    titleTrial: "مرحبًا بك في Explain My Numbers!",
    titleSubscribe: "المتابعة إلى الاشتراك",
    subtitleTrial: (days) => `انقر الزر أدناه لبدء تجربة لمدة ${days} يومًا. لا حاجة لبطاقة.`,
    subtitleSubscribe: "انقر الزر أدناه وسيتم توجيهك إلى صفحة الدفع الآمنة في Stripe.",
    buttonTrial: "ابدأ التجربة",
    buttonSubscribe: "الانتقال إلى الدفع",
    footer: "ستنتهي صلاحية هذا الرابط خلال 15 دقيقة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
    dir: "rtl",
  },

  he: {
    subjectTrial: (days) => `הקישור הקסום שלך להתחלת ניסיון חינמי של ${days} ימים`,
    subjectSubscribe: "הקישור הקסום שלך למנוי",
    titleTrial: "ברוכים הבאים ל-Explain My Numbers!",
    titleSubscribe: "המשך למנוי",
    subtitleTrial: (days) => `לחץ על הכפתור למטה כדי להתחיל ניסיון של ${days} ימים. אין צורך בכרטיס.`,
    subtitleSubscribe: "לחץ על הכפתור למטה ותועבר לתשלום מאובטח ב-Stripe Checkout.",
    buttonTrial: "התחל ניסיון",
    buttonSubscribe: "עבור ל-Checkout",
    footer: "הקישור יפוג בעוד 15 דקות. אם לא ביקשת זאת, אפשר להתעלם מהמייל.",
    dir: "rtl",
  },

  hi: {
    subjectTrial: (days) => `${days} दिन की मुफ्त ट्रायल शुरू करने के लिए आपका मैजिक लिंक`,
    subjectSubscribe: "सब्सक्राइब करने के लिए आपका मैजिक लिंक",
    titleTrial: "Explain My Numbers में आपका स्वागत है!",
    titleSubscribe: "सब्सक्रिप्शन जारी रखें",
    subtitleTrial: (days) => `नीचे दिए गए बटन पर क्लिक करके ${days} दिन की ट्रायल शुरू करें। कार्ड की जरूरत नहीं है।`,
    subtitleSubscribe: "नीचे दिए गए बटन पर क्लिक करें और आपको सुरक्षित Stripe Checkout पर भेज दिया जाएगा।",
    buttonTrial: "ट्रायल शुरू करें",
    buttonSubscribe: "Checkout पर जाएँ",
    footer:
      "यह लिंक 15 मिनट में समाप्त हो जाएगा। यदि आपने अनुरोध नहीं किया था, तो आप इस ईमेल को अनदेखा कर सकते हैं।",
    dir: "ltr",
  },

  bn: {
    subjectTrial: (days) => `${days} দিনের ফ্রি ট্রায়াল শুরু করতে আপনার ম্যাজিক লিংক`,
    subjectSubscribe: "সাবস্ক্রাইব করতে আপনার ম্যাজিক লিংক",
    titleTrial: "Explain My Numbers-এ স্বাগতম!",
    titleSubscribe: "সাবস্ক্রিপশনে এগিয়ে যান",
    subtitleTrial: (days) => `নিচের বাটনে ক্লিক করে ${days} দিনের ট্রায়াল শুরু করুন। কার্ড প্রয়োজন নেই।`,
    subtitleSubscribe: "নিচের বাটনে ক্লিক করলে আপনাকে নিরাপদ Stripe Checkout-এ পাঠানো হবে।",
    buttonTrial: "ট্রায়াল শুরু করুন",
    buttonSubscribe: "Checkout-এ যান",
    footer:
      "এই লিংকটি ১৫ মিনিটে মেয়াদোত্তীর্ণ হবে। আপনি যদি অনুরোধ না করে থাকেন, তাহলে ইমেলটি উপেক্ষা করতে পারেন।",
    dir: "ltr",
  },

  ur: {
    subjectTrial: (days) => `${days} دن کی مفت ٹرائل شروع کرنے کے لیے آپ کا میجک لنک`,
    subjectSubscribe: "سبسکرائب کرنے کے لیے آپ کا میجک لنک",
    titleTrial: "Explain My Numbers میں خوش آمدید!",
    titleSubscribe: "سبسکرپشن پر جائیں",
    subtitleTrial: (days) => `نیچے دیے گئے بٹن پر کلک کرکے ${days} دن کی ٹرائل شروع کریں۔ کارڈ درکار نہیں۔`,
    subtitleSubscribe: "نیچے دیے گئے بٹن پر کلک کریں اور آپ کو محفوظ Stripe Checkout پر بھیج دیا جائے گا۔",
    buttonTrial: "ٹرائل شروع کریں",
    buttonSubscribe: "Checkout پر جائیں",
    footer:
      "یہ لنک 15 منٹ میں ختم ہو جائے گا۔ اگر آپ نے درخواست نہیں کی تھی تو آپ اس ای میل کو نظر انداز کر سکتے ہیں۔",
    dir: "rtl",
  },

  id: {
    subjectTrial: (days) => `Tautan ajaib Anda untuk memulai uji coba gratis ${days} hari`,
    subjectSubscribe: "Tautan ajaib Anda untuk berlangganan",
    titleTrial: "Selamat datang di Explain My Numbers!",
    titleSubscribe: "Lanjutkan ke langganan",
    subtitleTrial: (days) => `Klik tombol di bawah untuk memulai uji coba ${days} hari. Tidak perlu kartu.`,
    subtitleSubscribe: "Klik tombol di bawah dan Anda akan diarahkan ke Stripe Checkout yang aman.",
    buttonTrial: "Mulai uji coba",
    buttonSubscribe: "Ke Checkout",
    footer:
      "Tautan ini kedaluwarsa dalam 15 menit. Jika Anda tidak meminta ini, Anda dapat mengabaikan email ini.",
    dir: "ltr",
  },

  ms: {
    subjectTrial: (days) => `Pautan ajaib anda untuk memulakan percubaan percuma ${days} hari`,
    subjectSubscribe: "Pautan ajaib anda untuk melanggan",
    titleTrial: "Selamat datang ke Explain My Numbers!",
    titleSubscribe: "Teruskan ke langganan",
    subtitleTrial: (days) => `Klik butang di bawah untuk memulakan percubaan ${days} hari. Tiada kad diperlukan.`,
    subtitleSubscribe: "Klik butang di bawah dan anda akan diarahkan ke Stripe Checkout yang selamat.",
    buttonTrial: "Mulakan percubaan",
    buttonSubscribe: "Pergi ke Checkout",
    footer:
      "Pautan ini tamat tempoh dalam 15 minit. Jika anda tidak memintanya, anda boleh abaikan e-mel ini.",
    dir: "ltr",
  },

  th: {
    subjectTrial: (days) => `ลิงก์มหัศจรรย์ของคุณเพื่อเริ่มทดลองใช้ฟรี ${days} วัน`,
    subjectSubscribe: "ลิงก์มหัศจรรย์ของคุณเพื่อสมัครสมาชิก",
    titleTrial: "ยินดีต้อนรับสู่ Explain My Numbers!",
    titleSubscribe: "ไปต่อเพื่อสมัครสมาชิก",
    subtitleTrial: (days) => `คลิกปุ่มด้านล่างเพื่อเริ่มทดลองใช้ ${days} วัน ไม่ต้องใช้บัตร`,
    subtitleSubscribe: "คลิกปุ่มด้านล่าง แล้วคุณจะถูกนำไปยัง Stripe Checkout ที่ปลอดภัย",
    buttonTrial: "เริ่มทดลองใช้ฟรี",
    buttonSubscribe: "ไปที่ Checkout",
    footer: "ลิงก์นี้จะหมดอายุใน 15 นาที หากคุณไม่ได้ร้องขอ คุณสามารถเพิกเฉยอีเมลนี้ได้",
    dir: "ltr",
  },

  vi: {
    subjectTrial: (days) => `Liên kết ma thuật để bắt đầu dùng thử miễn phí ${days} ngày`,
    subjectSubscribe: "Liên kết ma thuật để đăng ký",
    titleTrial: "Chào mừng bạn đến với Explain My Numbers!",
    titleSubscribe: "Tiếp tục đến đăng ký",
    subtitleTrial: (days) => `Nhấn nút bên dưới để bắt đầu dùng thử ${days} ngày. Không cần thẻ.`,
    subtitleSubscribe: "Nhấn nút bên dưới và bạn sẽ được chuyển đến Stripe Checkout an toàn.",
    buttonTrial: "Bắt đầu dùng thử",
    buttonSubscribe: "Đi tới Checkout",
    footer: "Liên kết này hết hạn sau 15 phút. Nếu bạn không yêu cầu, bạn có thể bỏ qua email này.",
    dir: "ltr",
  },

  ja: {
    subjectTrial: (days) => `${days}日間の無料トライアルを開始するためのマジックリンク`,
    subjectSubscribe: "購読のためのマジックリンク",
    titleTrial: "Explain My Numbersへようこそ！",
    titleSubscribe: "サブスクリプションへ進む",
    subtitleTrial: (days) => `下のボタンをクリックして${days}日間のトライアルを開始してください。カードは不要です。`,
    subtitleSubscribe: "下のボタンをクリックすると、安全なStripe Checkoutに移動します。",
    buttonTrial: "トライアル開始",
    buttonSubscribe: "Checkoutへ",
    footer:
      "このリンクは15分で期限切れになります。心当たりがない場合は、このメールを無視してください。",
    dir: "ltr",
  },

  ko: {
    subjectTrial: (days) => `${days}일 무료 체험을 시작하기 위한 매직 링크`,
    subjectSubscribe: "구독을 위한 매직 링크",
    titleTrial: "Explain My Numbers에 오신 것을 환영합니다!",
    titleSubscribe: "구독으로 계속",
    subtitleTrial: (days) => `아래 버튼을 눌러 ${days}일 체험을 시작하세요. 카드가 필요 없습니다.`,
    subtitleSubscribe: "아래 버튼을 누르면 안전한 Stripe Checkout으로 이동합니다.",
    buttonTrial: "체험 시작",
    buttonSubscribe: "Checkout으로",
    footer: "이 링크는 15분 후 만료됩니다. 요청한 적이 없다면 이 이메일을 무시해도 됩니다.",
    dir: "ltr",
  },

  zh: {
    subjectTrial: (days) => `用于开始${days}天免费试用的魔法链接`,
    subjectSubscribe: "用于订阅的魔法链接",
    titleTrial: "欢迎使用 Explain My Numbers！",
    titleSubscribe: "继续订阅",
    subtitleTrial: (days) => `点击下方按钮开始${days}天试用。无需信用卡。`,
    subtitleSubscribe: "点击下方按钮，你将被重定向到安全的 Stripe Checkout。",
    buttonTrial: "开始试用",
    buttonSubscribe: "前往 Checkout",
    footer: "此链接将在 15 分钟后过期。如果不是你本人请求的，可忽略此邮件。",
    dir: "ltr",
  },
};

function resolveTrialDays(trialDays: unknown, fallback = 7): number {
  const n =
    typeof trialDays === "number"
      ? trialDays
      : typeof trialDays === "string"
        ? Number(trialDays)
        : NaN;

  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export async function sendMagicLinkEmail({ to, verifyUrl, mode, trialDays, lang }: SendMagicLinkParams) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM;

  if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!EMAIL_FROM) throw new Error("Missing EMAIL_FROM");

  const resend = new Resend(RESEND_API_KEY);
  console.log("[sendMagicLinkEmail] mode=", mode, "to=", to);

  // ✅ English only for now
  // (later we’ll switch back to normalizeEmailLang(lang))
  const L: EmailLang = "en";
  const copy = EMAIL_COPY[L] ?? EMAIL_COPY.en;

  const days = resolveTrialDays(trialDays, 7);

  const isTrial = mode === "trial";
  const isLogin = mode === "login";

 
// ✅ Login email copy (EN only for now)
const loginSubject = "Your magic link to continue your trial";
const loginTitle = "Continue on this device";
const loginSubtitle = "Click the button below to sign in and continue your existing free trial.";
const loginButton = "Continue";

const subject =
  (isLogin ? "[LOGIN] " : isTrial ? "[TRIAL] " : "[SUBSCRIBE] ") +
  (isLogin ? loginSubject : isTrial ? copy.subjectTrial(days) : copy.subjectSubscribe);
const title = isLogin ? loginTitle : isTrial ? copy.titleTrial : copy.titleSubscribe;
const subtitle = isLogin ? loginSubtitle : isTrial ? copy.subtitleTrial(days) : copy.subtitleSubscribe;
const buttonText = isLogin ? loginButton : isTrial ? copy.buttonTrial : copy.buttonSubscribe;

  const dir = (copy.dir ?? "ltr") as "ltr" | "rtl";

  const html = `
  <div dir="${dir}" style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#0b0b0c; padding:32px;">
    <div style="max-width:560px; margin:0 auto; background:#111113; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:28px;">
      <div style="color:#fff; font-size:22px; font-weight:700; margin-bottom:10px;">${title}</div>
      <div style="color:rgba(255,255,255,0.75); font-size:14px; line-height:1.6; margin-bottom:18px;">
        ${subtitle}
      </div>
      <a href="${verifyUrl}"
         style="display:inline-block; background:#f5c542; color:#111; padding:12px 16px; border-radius:14px; font-weight:700; text-decoration:none;">
        ${buttonText}
      </a>
      <div style="color:rgba(255,255,255,0.55); font-size:12px; line-height:1.6; margin-top:16px;">
        ${copy.footer}
      </div>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
}
