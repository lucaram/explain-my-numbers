"use client";

import { Info, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

/**
 * CookieBanner
 * - Shows a compact bottom banner until accepted (localStorage)
 * - "Learn more" opens an in-place modal (no routing required)
 * - Modal copy is translated based on browser language (fallback: en)
 */

type CookieBannerProps = {
  onPrivacy?: () => void; // optional: if you already have a Privacy modal elsewhere, we can still call it
  storageKey?: string;
};

type Lang =
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

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const raw = (navigator.language || "en").toLowerCase(); // e.g. "it-IT"
  const base = raw.split("-")[0] as Lang;

const supported: Lang[] = [
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
  return supported.includes(base) ? base : "en";
}



const I18N: Record<
  Lang,
  {
    bannerLine: string;
    learnMore: string;
    accept: string;
    title: string;

    intro: string;

    hWhat: string;
    pWhat: string;

    hAnalytics: string;
    pAnalytics: string;

    hNo: string;
    no1: string;
    no2: string;
    no3: string;
    no4: string;

    hConsent: string;
    pConsent: string;

    hRights: string;
    pRights: string;

    close: string;
  }
> = {
  en: {
    bannerLine: "We use cookies to improve your experience & understand app usage.",
    learnMore: "Learn more",
    accept: "Accept",
    title: "Cookies",
    intro: "We use cookies to make Explain My Numbers work smoothly and to understand how the app is used.",

    hWhat: "What cookies we use",
    pWhat:
      "We use a small number of cookies and similar technologies for remembering preferences, understanding feature usage, and improving reliability and performance. We do not use cookies for advertising or tracking you across other websites.",

    hAnalytics: "Analytics & usage data",
    pAnalytics:
      "We may collect anonymous usage data such as feature interactions, general patterns, and error/performance information. This data is aggregated, does not identify you personally, and is used only to improve the product.",

    hNo: "What we don’t do",
    no1: "No selling of personal data",
    no2: "No cross-site tracking",
    no3: "No third-party advertising cookies",
    no4: "No marketing profiling",

    hConsent: "Your consent",
    pConsent:
      "Cookies that are not strictly necessary are used only after you give consent. You can withdraw consent at any time by clearing cookies or adjusting your browser settings.",

    hRights: "Your rights (UK, EU & US)",
    pRights:
      "Depending on where you live, you may have the right to access, correct, or delete data, and to object to certain processing. UK & EU users: GDPR and PECR. Some US users (e.g. California): CCPA/CPRA. To exercise your rights, contact us at privacy@yourdomain.com.",

    close: "Close",
  },

  it: {
    bannerLine: "Usiamo i cookie per migliorare l’esperienza e capire l’uso dell’app.",
    learnMore: "Dettagli",
    accept: "Accetta",
    title: "Cookie e privacy",
    intro: "Usiamo i cookie per far funzionare Explain My Numbers in modo fluido e per capire come viene usata l’app.",

    hWhat: "Quali cookie usiamo",
    pWhat:
      "Usiamo un numero limitato di cookie e tecnologie simili per ricordare preferenze, capire l’uso delle funzioni e migliorare affidabilità e prestazioni. Non usiamo cookie pubblicitari né tracciamento su altri siti.",

    hAnalytics: "Dati di utilizzo e analisi",
    pAnalytics:
      "Possiamo raccogliere dati di utilizzo anonimi (funzioni usate, pattern generali, errori e performance). I dati sono aggregati, non ti identificano e servono solo a migliorare il prodotto.",

    hNo: "Cosa non facciamo",
    no1: "Non vendiamo dati personali",
    no2: "Nessun tracciamento tra siti",
    no3: "Niente cookie pubblicitari di terze parti",
    no4: "Nessuna profilazione marketing",

    hConsent: "Il tuo consenso",
    pConsent:
      "I cookie non strettamente necessari vengono usati solo dopo il consenso. Puoi revocarlo in qualsiasi momento cancellando i cookie o modificando le impostazioni del browser.",

    hRights: "I tuoi diritti (UK, UE e USA)",
    pRights:
      "A seconda del paese, potresti avere diritto di accesso, correzione o cancellazione dei dati e di opporti ad alcuni trattamenti. UK/UE: GDPR e PECR. Alcuni stati USA (es. California): CCPA/CPRA. Per esercitare i diritti: privacy@yourdomain.com.",

    close: "Chiudi",
  },

  fr: {
    bannerLine: "Nous utilisons des cookies pour améliorer l’expérience et comprendre l’usage de l’app.",
    learnMore: "En savoir plus",
    accept: "Accepter",
    title: "Cookies & confidentialité",
    intro:
      "Nous utilisons des cookies pour faire fonctionner Explain My Numbers correctement et pour comprendre comment l’app est utilisée.",

    hWhat: "Quels cookies utilisons-nous",
    pWhat:
      "Nous utilisons un petit nombre de cookies et technologies similaires pour mémoriser des préférences, comprendre l’usage des fonctionnalités et améliorer la fiabilité et les performances. Pas de cookies publicitaires ni de suivi inter-sites.",

    hAnalytics: "Analytics & données d’usage",
    pAnalytics:
      "Nous pouvons collecter des données d’usage anonymes (fonctionnalités utilisées, tendances générales, erreurs et performance). Elles sont agrégées, ne vous identifient pas et servent uniquement à améliorer le produit.",

    hNo: "Ce que nous ne faisons pas",
    no1: "Aucune vente de données personnelles",
    no2: "Aucun suivi inter-sites",
    no3: "Aucun cookie publicitaire tiers",
    no4: "Aucun profilage marketing",

    hConsent: "Votre consentement",
    pConsent:
      "Les cookies non strictement nécessaires sont utilisés uniquement après votre consentement. Vous pouvez le retirer à tout moment en supprimant les cookies ou via les réglages du navigateur.",

    hRights: "Vos droits (UK, UE & USA)",
    pRights:
      "Selon votre pays, vous pouvez demander l’accès, la correction ou la suppression des données et vous opposer à certains traitements. UK/UE : GDPR et PECR. Certains états US (ex. Californie) : CCPA/CPRA. Contact : privacy@yourdomain.com.",

    close: "Fermer",
  },

  es: {
    bannerLine: "Usamos cookies para mejorar la experiencia y entender el uso de la app.",
    learnMore: "Más info",
    accept: "Aceptar",
    title: "Cookies y privacidad",
    intro: "Usamos cookies para que Explain My Numbers funcione bien y para entender cómo se usa la app.",

    hWhat: "Qué cookies usamos",
    pWhat:
      "Usamos un número reducido de cookies y tecnologías similares para recordar preferencias, entender el uso de funciones y mejorar fiabilidad y rendimiento. No usamos cookies de publicidad ni seguimiento entre sitios.",

    hAnalytics: "Analítica y datos de uso",
    pAnalytics:
      "Podemos recopilar datos de uso anónimos (funciones usadas, patrones generales, errores y rendimiento). Son agregados, no te identifican y se usan solo para mejorar el producto.",

    hNo: "Lo que no hacemos",
    no1: "No vendemos datos personales",
    no2: "Sin seguimiento entre sitios",
    no3: "Sin cookies publicitarias de terceros",
    no4: "Sin perfilado de marketing",

    hConsent: "Tu consentimiento",
    pConsent:
      "Las cookies no estrictamente necesarias se usan solo tras tu consentimiento. Puedes retirarlo en cualquier momento borrando cookies o ajustando tu navegador.",

    hRights: "Tus derechos (UK, UE y EE. UU.)",
    pRights:
      "Según tu país, puedes solicitar acceso, corrección o eliminación de datos y oponerte a ciertos tratamientos. UK/UE: GDPR y PECR. Algunos estados de EE. UU. (p. ej., California): CCPA/CPRA. Contacto: privacy@yourdomain.com.",

    close: "Cerrar",
  },

  de: {
    bannerLine: "Wir verwenden Cookies, um die Nutzung zu verstehen und die Erfahrung zu verbessern.",
    learnMore: "Mehr erfahren",
    accept: "Akzeptieren",
    title: "Cookies & Datenschutz",
    intro:
      "Wir verwenden Cookies, damit Explain My Numbers reibungslos funktioniert und um zu verstehen, wie die App genutzt wird.",

    hWhat: "Welche Cookies wir verwenden",
    pWhat:
      "Wir verwenden nur wenige Cookies und ähnliche Technologien, um Einstellungen zu speichern, die Nutzung von Funktionen zu verstehen und Zuverlässigkeit/Performance zu verbessern. Keine Werbe-Cookies und kein Tracking über andere Websites.",

    hAnalytics: "Analytics & Nutzungsdaten",
    pAnalytics:
      "Wir können anonyme Nutzungsdaten erfassen (genutzte Funktionen, allgemeine Muster, Fehler/Performance). Diese Daten sind aggregiert, identifizieren Sie nicht und dienen nur der Produktverbesserung.",

    hNo: "Was wir nicht tun",
    no1: "Kein Verkauf personenbezogener Daten",
    no2: "Kein Cross-Site-Tracking",
    no3: "Keine Drittanbieter-Werbe-Cookies",
    no4: "Kein Marketing-Profiling",

    hConsent: "Ihre Einwilligung",
    pConsent:
      "Nicht zwingend erforderliche Cookies werden nur nach Ihrer Einwilligung gesetzt. Sie können die Einwilligung jederzeit widerrufen, indem Sie Cookies löschen oder Browser-Einstellungen anpassen.",

    hRights: "Ihre Rechte (UK, EU & US)",
    pRights:
      "Je nach Wohnort haben Sie Rechte auf Auskunft, Berichtigung, Löschung und Widerspruch gegen bestimmte Verarbeitung. UK/EU: GDPR und PECR. Einige US-Bundesstaaten (z. B. Kalifornien): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Schließen",
  },

  pt: {
    bannerLine: "Usamos cookies para melhorar a experiência e entender o uso da app.",
    learnMore: "Saber mais",
    accept: "Aceitar",
    title: "Cookies e privacidade",
    intro: "Usamos cookies para o Explain My Numbers funcionar bem e para entender como a app é usada.",

    hWhat: "Que cookies usamos",
    pWhat:
      "Usamos um pequeno número de cookies e tecnologias semelhantes para guardar preferências, entender o uso de funcionalidades e melhorar fiabilidade e desempenho. Não usamos cookies de publicidade nem rastreio entre sites.",

    hAnalytics: "Analítica e dados de uso",
    pAnalytics:
      "Podemos recolher dados de uso anónimos (funcionalidades usadas, padrões gerais, erros e desempenho). São agregados, não o identificam e servem apenas para melhorar o produto.",

    hNo: "O que não fazemos",
    no1: "Não vendemos dados pessoais",
    no2: "Sem rastreio entre sites",
    no3: "Sem cookies de publicidade de terceiros",
    no4: "Sem perfilagem de marketing",

    hConsent: "O seu consentimento",
    pConsent:
      "Cookies não estritamente necessários só são usados após consentimento. Pode retirar o consentimento a qualquer momento apagando cookies ou ajustando o navegador.",

    hRights: "Os seus direitos (UK, UE e EUA)",
    pRights:
      "Dependendo do país, pode pedir acesso, correção ou eliminação de dados e opor-se a certos tratamentos. UK/UE: GDPR e PECR. Alguns estados dos EUA (ex. Califórnia): CCPA/CPRA. Contacto: privacy@yourdomain.com.",

    close: "Fechar",
  },

  nl: {
    bannerLine: "We gebruiken cookies om je ervaring te verbeteren en app-gebruik te begrijpen.",
    learnMore: "Meer info",
    accept: "Accepteren",
    title: "Cookies",
    intro: "We gebruiken cookies om Explain My Numbers soepel te laten werken en om te begrijpen hoe de app wordt gebruikt.",

    hWhat: "Welke cookies gebruiken we",
    pWhat:
      "We gebruiken een klein aantal cookies en vergelijkbare technologieën om voorkeuren te onthouden, gebruik te begrijpen en betrouwbaarheid/prestaties te verbeteren. Geen advertentiecookies en geen tracking over andere websites.",

    hAnalytics: "Analytics & gebruiksdata",
    pAnalytics:
      "We kunnen anonieme gebruiksdata verzamelen (gebruikte functies, algemene patronen, fouten en performance). Dit is geaggregeerd, identificeert je niet persoonlijk en wordt alleen gebruikt om het product te verbeteren.",

    hNo: "Wat we niet doen",
    no1: "Geen verkoop van persoonsgegevens",
    no2: "Geen cross-site tracking",
    no3: "Geen advertentiecookies van derden",
    no4: "Geen marketingprofilering",

    hConsent: "Jouw toestemming",
    pConsent:
      "Cookies die niet strikt noodzakelijk zijn, worden alleen gebruikt na toestemming. Je kunt toestemming altijd intrekken door cookies te wissen of browserinstellingen aan te passen.",

    hRights: "Jouw rechten (VK, EU & VS)",
    pRights:
      "Afhankelijk van je land heb je rechten op inzage, correctie/verwijdering en bezwaar tegen bepaalde verwerking. VK/EU: GDPR en PECR. Sommige VS-staten (bv. Californië): CCPA/CPRA. Contact: privacy@yourdomain.com.",

    close: "Sluiten",
  },

  sv: {
    bannerLine: "Vi använder cookies för att förbättra upplevelsen och förstå app-användning.",
    learnMore: "Läs mer",
    accept: "Acceptera",
    title: "Cookies & integritet",
    intro: "Vi använder cookies för att Explain My Numbers ska fungera smidigt och för att förstå hur appen används.",

    hWhat: "Vilka cookies vi använder",
    pWhat:
      "Vi använder ett litet antal cookies och liknande tekniker för att komma ihåg inställningar, förstå funktioners användning och förbättra tillförlitlighet/prestanda. Inga annons-cookies och ingen spårning mellan webbplatser.",

    hAnalytics: "Analys & användningsdata",
    pAnalytics:
      "Vi kan samla in anonym användningsdata (funktioner, mönster, fel och prestanda). Den är aggregerad, identifierar dig inte och används endast för att förbättra produkten.",

    hNo: "Det här gör vi inte",
    no1: "Vi säljer inte personuppgifter",
    no2: "Ingen cross-site-spårning",
    no3: "Inga tredjeparts annons-cookies",
    no4: "Ingen marknadsföringsprofilering",

    hConsent: "Ditt samtycke",
    pConsent:
      "Cookies som inte är strikt nödvändiga används bara efter samtycke. Du kan när som helst återkalla samtycket genom att rensa cookies eller ändra webbläsarinställningar.",

    hRights: "Dina rättigheter (UK, EU & US)",
    pRights:
      "Beroende på var du bor kan du ha rätt att få tillgång till, rätta eller radera data och invända mot viss behandling. UK/EU: GDPR och PECR. Vissa US-delstater (t.ex. Kalifornien): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Stäng",
  },

  no: {
    bannerLine: "Vi bruker informasjonskapsler for å forbedre opplevelsen og forstå bruk.",
    learnMore: "Les mer",
    accept: "Godta",
    title: "Informasjonskapsler og personvern",
    intro: "Vi bruker informasjonskapsler for at Explain My Numbers skal fungere godt og for å forstå hvordan appen brukes.",

    hWhat: "Hvilke informasjonskapsler vi bruker",
    pWhat:
      "Vi bruker et lite antall informasjonskapsler og lignende teknologier for å huske preferanser, forstå funksjonsbruk og forbedre stabilitet/ytelse. Ingen reklame-cookies og ingen sporing på tvers av nettsteder.",

    hAnalytics: "Analyse og bruksdata",
    pAnalytics:
      "Vi kan samle inn anonyme bruksdata (funksjoner brukt, mønstre, feil og ytelse). Dataene er aggregerte, identifiserer deg ikke og brukes kun til forbedring.",

    hNo: "Dette gjør vi ikke",
    no1: "Vi selger ikke personopplysninger",
    no2: "Ingen cross-site-sporing",
    no3: "Ingen tredjeparts reklame-cookies",
    no4: "Ingen markedsføringsprofilering",

    hConsent: "Ditt samtykke",
    pConsent:
      "Ikke strengt nødvendige cookies brukes kun etter samtykke. Du kan trekke samtykke tilbake ved å slette cookies eller endre nettleserinnstillinger.",

    hRights: "Dine rettigheter (UK, EU & US)",
    pRights:
      "Avhengig av hvor du bor kan du ha rett til innsyn, retting, sletting og innsigelse. UK/EU: GDPR og PECR. Noen US-stater (f.eks. California): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Lukk",
  },

  da: {
    bannerLine: "Vi bruger cookies til at forbedre oplevelsen og forstå brug af appen.",
    learnMore: "Læs mere",
    accept: "Accepter",
    title: "Cookies og privatliv",
    intro: "Vi bruger cookies for at Explain My Numbers fungerer godt og for at forstå, hvordan appen bruges.",

    hWhat: "Hvilke cookies vi bruger",
    pWhat:
      "Vi bruger et lille antal cookies og lignende teknologier til at huske præferencer, forstå brug af funktioner og forbedre stabilitet/ydelse. Ingen reklamecookies og ingen tracking på tværs af websites.",

    hAnalytics: "Analyse og brugsdata",
    pAnalytics:
      "Vi kan indsamle anonyme brugsdata (funktioner, mønstre, fejl og performance). Data er aggregeret, identificerer dig ikke og bruges kun til forbedring.",

    hNo: "Det gør vi ikke",
    no1: "Vi sælger ikke persondata",
    no2: "Ingen cross-site tracking",
    no3: "Ingen tredjeparts reklamecookies",
    no4: "Ingen marketing-profilering",

    hConsent: "Dit samtykke",
    pConsent:
      "Cookies der ikke er strengt nødvendige, bruges kun efter samtykke. Du kan til enhver tid trække samtykke tilbage ved at slette cookies eller ændre browserindstillinger.",

    hRights: "Dine rettigheder (UK, EU & US)",
    pRights:
      "Afhængigt af hvor du bor, kan du have ret til indsigt, rettelse, sletning og indsigelse mod visse behandlinger. UK/EU: GDPR og PECR. Nogle US-stater (fx Californien): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Luk",
  },

  fi: {
    bannerLine: "Käytämme evästeitä kokemuksen parantamiseen ja käytön ymmärtämiseen.",
    learnMore: "Lisätiedot",
    accept: "Hyväksy",
    title: "Evästeet ja tietosuoja",
    intro: "Käytämme evästeitä, jotta Explain My Numbers toimii sujuvasti ja jotta ymmärrämme, miten sovellusta käytetään.",

    hWhat: "Mitä evästeitä käytämme",
    pWhat:
      "Käytämme pientä määrää evästeitä ja vastaavia tekniikoita asetusten muistamiseen, ominaisuuksien käytön ymmärtämiseen sekä luotettavuuden ja suorituskyvyn parantamiseen. Emme käytä mainosevästeitä tai sivustojen välistä seurantaa.",

    hAnalytics: "Analytiikka ja käyttötiedot",
    pAnalytics:
      "Voimme kerätä anonyymejä käyttötietoja (käytetyt ominaisuudet, yleiset mallit, virheet ja suorituskyky). Tiedot ovat koottuja, eivät tunnista sinua ja niitä käytetään vain tuotteen parantamiseen.",

    hNo: "Mitä emme tee",
    no1: "Emme myy henkilötietoja",
    no2: "Ei sivustojen välistä seurantaa",
    no3: "Ei kolmannen osapuolen mainosevästeitä",
    no4: "Ei markkinointiprofilointia",

    hConsent: "Suostumuksesi",
    pConsent:
      "Muut kuin välttämättömät evästeet asetetaan vain suostumuksellasi. Voit perua suostumuksen poistamalla evästeet tai muuttamalla selaimen asetuksia.",

    hRights: "Oikeutesi (UK, EU & US)",
    pRights:
      "Asuinmaasta riippuen sinulla voi olla oikeus nähdä, korjata tai poistaa tietoja ja vastustaa tiettyä käsittelyä. UK/EU: GDPR ja PECR. Joissain US-osavaltioissa (esim. Kalifornia): CCPA/CPRA. Ota yhteyttä: privacy@yourdomain.com.",

    close: "Sulje",
  },

  pl: {
    bannerLine: "Używamy plików cookie, aby poprawić działanie i zrozumieć użycie aplikacji.",
    learnMore: "Więcej",
    accept: "Akceptuj",
    title: "Cookies i prywatność",
    intro: "Używamy plików cookie, aby Explain My Numbers działało płynnie i aby zrozumieć, jak aplikacja jest używana.",

    hWhat: "Jakie cookies używamy",
    pWhat:
      "Używamy niewielkiej liczby plików cookie i podobnych technologii do zapamiętywania preferencji, analizy użycia funkcji oraz poprawy niezawodności i wydajności. Nie używamy reklamowych cookies ani śledzenia między stronami.",

    hAnalytics: "Analityka i dane użycia",
    pAnalytics:
      "Możemy zbierać anonimowe dane użycia (używane funkcje, ogólne wzorce, błędy i wydajność). Dane są agregowane, nie identyfikują użytkownika i służą wyłącznie do poprawy produktu.",

    hNo: "Czego nie robimy",
    no1: "Nie sprzedajemy danych osobowych",
    no2: "Brak śledzenia między stronami",
    no3: "Brak reklamowych cookies stron trzecich",
    no4: "Brak profilowania marketingowego",

    hConsent: "Twoja zgoda",
    pConsent:
      "Cookies inne niż niezbędne są używane dopiero po wyrażeniu zgody. Zgodę możesz wycofać w każdej chwili usuwając cookies lub zmieniając ustawienia przeglądarki.",

    hRights: "Twoje prawa (UK, UE i USA)",
    pRights:
      "W zależności od kraju możesz mieć prawo dostępu, sprostowania lub usunięcia danych oraz sprzeciwu wobec niektórych działań. UK/UE: GDPR i PECR. Niektóre stany USA (np. Kalifornia): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Zamknij",
  },
    tr: {
    bannerLine: "Deneyiminizi iyileştirmek ve uygulama kullanımını anlamak için çerezler kullanırız.",
    learnMore: "Daha fazla",
    accept: "Kabul et",
    title: "Çerezler",
    intro: "Explain My Numbers’ın sorunsuz çalışması ve uygulamanın nasıl kullanıldığını anlamak için çerezler kullanırız.",

    hWhat: "Hangi çerezleri kullanıyoruz",
    pWhat:
      "Tercihleri hatırlamak, özellik kullanımını anlamak ve güvenilirlik ile performansı iyileştirmek için az sayıda çerez ve benzer teknolojiler kullanırız. Reklam çerezleri kullanmayız ve sizi diğer sitelerde takip etmeyiz.",

    hAnalytics: "Analitik ve kullanım verileri",
    pAnalytics:
      "Özellik etkileşimleri, genel kullanım desenleri ve hata/performans bilgileri gibi anonim kullanım verileri toplayabiliriz. Bu veriler toplulaştırılmıştır, sizi kişisel olarak tanımlamaz ve yalnızca ürünü iyileştirmek için kullanılır.",

    hNo: "Ne yapmıyoruz",
    no1: "Kişisel verileri satmayız",
    no2: "Siteler arası takip yok",
    no3: "Üçüncü taraf reklam çerezleri yok",
    no4: "Pazarlama profillemesi yok",

    hConsent: "Onayınız",
    pConsent:
      "Kesinlikle gerekli olmayan çerezler yalnızca onay verdikten sonra kullanılır. Çerezleri temizleyerek veya tarayıcı ayarlarınızı değiştirerek onayınızı dilediğiniz zaman geri çekebilirsiniz.",

    hRights: "Haklarınız (Birleşik Krallık, AB ve ABD)",
    pRights:
      "Yaşadığınız yere bağlı olarak verilerinize erişme, düzeltme veya silme ve belirli işlemlere itiraz etme hakkına sahip olabilirsiniz. Birleşik Krallık ve AB: GDPR ve PECR. Bazı ABD eyaletleri (ör. Kaliforniya): CCPA/CPRA. Haklarınızı kullanmak için: privacy@yourdomain.com.",

    close: "Kapat",
  },

  el: {
    bannerLine: "Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας και να κατανοήσουμε τη χρήση της εφαρμογής.",
    learnMore: "Μάθετε περισσότερα",
    accept: "Αποδοχή",
    title: "Cookies",
    intro: "Χρησιμοποιούμε cookies για να λειτουργεί ομαλά το Explain My Numbers και για να κατανοούμε πώς χρησιμοποιείται η εφαρμογή.",

    hWhat: "Ποια cookies χρησιμοποιούμε",
    pWhat:
      "Χρησιμοποιούμε έναν μικρό αριθμό cookies και παρόμοιων τεχνολογιών για αποθήκευση προτιμήσεων, κατανόηση χρήσης λειτουργιών και βελτίωση αξιοπιστίας και απόδοσης. Δεν χρησιμοποιούμε cookies διαφήμισης ούτε παρακολούθηση σε άλλους ιστότοπους.",

    hAnalytics: "Αναλυτικά και δεδομένα χρήσης",
    pAnalytics:
      "Ενδέχεται να συλλέγουμε ανώνυμα δεδομένα χρήσης όπως αλληλεπιδράσεις με λειτουργίες, γενικά μοτίβα και πληροφορίες σφαλμάτων/απόδοσης. Τα δεδομένα είναι συγκεντρωτικά, δεν σας ταυτοποιούν και χρησιμοποιούνται μόνο για βελτίωση του προϊόντος.",

    hNo: "Τι δεν κάνουμε",
    no1: "Δεν πωλούμε προσωπικά δεδομένα",
    no2: "Καμία παρακολούθηση μεταξύ ιστότοπων",
    no3: "Κανένα cookie διαφήμισης τρίτων",
    no4: "Καμία εμπορική προφίλ",

    hConsent: "Η συγκατάθεσή σας",
    pConsent:
      "Cookies που δεν είναι απολύτως απαραίτητα χρησιμοποιούνται μόνο αφού δώσετε συγκατάθεση. Μπορείτε να την ανακαλέσετε οποιαδήποτε στιγμή διαγράφοντας cookies ή αλλάζοντας τις ρυθμίσεις του προγράμματος περιήγησης.",

    hRights: "Τα δικαιώματά σας (ΗΒ, ΕΕ & ΗΠΑ)",
    pRights:
      "Ανάλογα με τον τόπο κατοικίας, μπορεί να έχετε δικαίωμα πρόσβασης, διόρθωσης ή διαγραφής δεδομένων και να αντιταχθείτε σε ορισμένη επεξεργασία. ΗΒ & ΕΕ: GDPR και PECR. Ορισμένοι χρήστες στις ΗΠΑ (π.χ. Καλιφόρνια): CCPA/CPRA. Επικοινωνία: privacy@yourdomain.com.",

    close: "Κλείσιμο",
  },

  cs: {
    bannerLine: "Používáme cookies ke zlepšení vašeho zážitku a k pochopení používání aplikace.",
    learnMore: "Více",
    accept: "Přijmout",
    title: "Cookies",
    intro: "Cookies používáme, aby Explain My Numbers fungovalo plynule a abychom porozuměli tomu, jak je aplikace používána.",

    hWhat: "Jaké cookies používáme",
    pWhat:
      "Používáme malé množství cookies a podobných technologií k zapamatování preferencí, porozumění používání funkcí a ke zlepšení spolehlivosti a výkonu. Nepoužíváme reklamní cookies ani vás nesledujeme napříč jinými weby.",

    hAnalytics: "Analytika a data o používání",
    pAnalytics:
      "Můžeme sbírat anonymní data o používání, jako jsou interakce s funkcemi, obecné vzorce a informace o chybách/výkonu. Data jsou agregovaná, neidentifikují vás osobně a slouží pouze ke zlepšení produktu.",

    hNo: "Co neděláme",
    no1: "Neprodáváme osobní údaje",
    no2: "Žádné sledování napříč weby",
    no3: "Žádné reklamní cookies třetích stran",
    no4: "Žádné marketingové profilování",

    hConsent: "Váš souhlas",
    pConsent:
      "Cookies, které nejsou nezbytně nutné, používáme pouze po udělení souhlasu. Souhlas můžete kdykoli odvolat vymazáním cookies nebo úpravou nastavení prohlížeče.",

    hRights: "Vaše práva (UK, EU & US)",
    pRights:
      "Podle toho, kde žijete, můžete mít právo na přístup, opravu nebo výmaz dat a vznést námitku proti určitému zpracování. UK & EU: GDPR a PECR. Některé státy USA (např. Kalifornie): CCPA/CPRA. Kontakt: privacy@yourdomain.com.",

    close: "Zavřít",
  },

  hu: {
    bannerLine: "Cookie-kat használunk a jobb élményért és az alkalmazáshasználat megértéséhez.",
    learnMore: "Továbbiak",
    accept: "Elfogadom",
    title: "Cookie-k",
    intro: "Cookie-kat használunk, hogy az Explain My Numbers zökkenőmentesen működjön, és hogy megértsük, hogyan használják az alkalmazást.",

    hWhat: "Milyen cookie-kat használunk",
    pWhat:
      "Kevés számú cookie-t és hasonló technológiát használunk beállítások megjegyzésére, funkcióhasználat megértésére, valamint megbízhatóság és teljesítmény javítására. Nem használunk hirdetési cookie-kat, és nem követjük Önt más webhelyeken.",

    hAnalytics: "Analitika és használati adatok",
    pAnalytics:
      "Gyűjthetünk névtelen használati adatokat (funkció-interakciók, általános minták, hiba-/teljesítményinformációk). Az adatok összesítettek, nem azonosítják Önt, és kizárólag a termék fejlesztésére szolgálnak.",

    hNo: "Amit nem teszünk",
    no1: "Nem adunk el személyes adatokat",
    no2: "Nincs webhelyek közötti követés",
    no3: "Nincsenek harmadik féltől származó hirdetési cookie-k",
    no4: "Nincs marketing profilalkotás",

    hConsent: "Az Ön hozzájárulása",
    pConsent:
      "A nem feltétlenül szükséges cookie-kat csak hozzájárulás után használjuk. A hozzájárulást bármikor visszavonhatja a cookie-k törlésével vagy a böngésző beállításainak módosításával.",

    hRights: "Az Ön jogai (UK, EU & US)",
    pRights:
      "Lakóhelyétől függően joga lehet az adatokhoz való hozzáféréshez, azok helyesbítéséhez vagy törléséhez, illetve bizonyos adatkezelések elleni tiltakozáshoz. UK & EU: GDPR és PECR. Egyes USA államok (pl. Kalifornia): CCPA/CPRA. Kapcsolat: privacy@yourdomain.com.",

    close: "Bezárás",
  },

  ro: {
    bannerLine: "Folosim cookie-uri pentru a îmbunătăți experiența și a înțelege utilizarea aplicației.",
    learnMore: "Detalii",
    accept: "Accept",
    title: "Cookie-uri",
    intro: "Folosim cookie-uri pentru ca Explain My Numbers să funcționeze fără probleme și pentru a înțelege cum este folosită aplicația.",

    hWhat: "Ce cookie-uri folosim",
    pWhat:
      "Folosim un număr redus de cookie-uri și tehnologii similare pentru a reține preferințe, a înțelege utilizarea funcțiilor și a îmbunătăți fiabilitatea și performanța. Nu folosim cookie-uri de publicitate și nu vă urmărim pe alte site-uri.",

    hAnalytics: "Analitică și date de utilizare",
    pAnalytics:
      "Putem colecta date anonime de utilizare (interacțiuni cu funcții, tipare generale, informații despre erori/performanță). Datele sunt agregate, nu vă identifică personal și sunt folosite doar pentru îmbunătățirea produsului.",

    hNo: "Ce nu facem",
    no1: "Nu vindem date personale",
    no2: "Fără urmărire între site-uri",
    no3: "Fără cookie-uri publicitare de la terți",
    no4: "Fără profilare de marketing",

    hConsent: "Consimțământul dvs.",
    pConsent:
      "Cookie-urile care nu sunt strict necesare sunt folosite numai după consimțământ. Îl puteți retrage oricând ștergând cookie-urile sau ajustând setările browserului.",

    hRights: "Drepturile dvs. (UK, UE & SUA)",
    pRights:
      "În funcție de locul în care locuiți, puteți avea dreptul de acces, corectare sau ștergere a datelor și de a vă opune anumitor prelucrări. UK & UE: GDPR și PECR. Unele state din SUA (de ex. California): CCPA/CPRA. Contact: privacy@yourdomain.com.",

    close: "Închide",
  },

  uk: {
    bannerLine: "Ми використовуємо cookies, щоб покращити роботу та зрозуміти використання застосунку.",
    learnMore: "Детальніше",
    accept: "Прийняти",
    title: "Cookies",
    intro: "Ми використовуємо cookies, щоб Explain My Numbers працював стабільно та щоб розуміти, як використовується застосунок.",

    hWhat: "Які cookies ми використовуємо",
    pWhat:
      "Ми використовуємо невелику кількість cookies і подібних технологій для запам’ятовування налаштувань, розуміння використання функцій і покращення надійності та продуктивності. Ми не використовуємо рекламні cookies і не відстежуємо вас на інших сайтах.",

    hAnalytics: "Аналітика та дані використання",
    pAnalytics:
      "Ми можемо збирати анонімні дані використання (взаємодії з функціями, загальні патерни, інформацію про помилки/продуктивність). Дані агреговані, не ідентифікують вас особисто і використовуються лише для покращення продукту.",

    hNo: "Чого ми не робимо",
    no1: "Не продаємо персональні дані",
    no2: "Жодного міжсайтового відстеження",
    no3: "Жодних сторонніх рекламних cookies",
    no4: "Жодного маркетингового профілювання",

    hConsent: "Ваша згода",
    pConsent:
      "Cookies, які не є строго необхідними, використовуються лише після вашої згоди. Ви можете відкликати згоду будь-коли, очистивши cookies або змінивши налаштування браузера.",

    hRights: "Ваші права (UK, ЄС та США)",
    pRights:
      "Залежно від місця проживання ви можете мати право на доступ, виправлення або видалення даних, а також заперечення проти певної обробки. UK та ЄС: GDPR і PECR. Деякі штати США (наприклад, Каліфорнія): CCPA/CPRA. Контакт: privacy@yourdomain.com.",

    close: "Закрити",
  },

  ru: {
    bannerLine: "Мы используем cookie-файлы, чтобы улучшить работу и понять использование приложения.",
    learnMore: "Подробнее",
    accept: "Принять",
    title: "Cookie",
    intro: "Мы используем cookie-файлы, чтобы Explain My Numbers работал стабильно и чтобы понимать, как используется приложение.",

    hWhat: "Какие cookie мы используем",
    pWhat:
      "Мы используем небольшое количество cookie и подобных технологий для запоминания настроек, понимания использования функций и улучшения надежности и производительности. Мы не используем рекламные cookie и не отслеживаем вас на других сайтах.",

    hAnalytics: "Аналитика и данные использования",
    pAnalytics:
      "Мы можем собирать анонимные данные использования (взаимодействия с функциями, общие паттерны, сведения об ошибках/производительности). Эти данные агрегируются, не идентифицируют вас лично и используются только для улучшения продукта.",

    hNo: "Чего мы не делаем",
    no1: "Мы не продаем персональные данные",
    no2: "Нет межсайтового отслеживания",
    no3: "Нет сторонних рекламных cookie",
    no4: "Нет маркетингового профилирования",

    hConsent: "Ваше согласие",
    pConsent:
      "Cookie, которые не являются строго необходимыми, используются только после вашего согласия. Вы можете отозвать согласие в любое время, удалив cookie или изменив настройки браузера.",

    hRights: "Ваши права (UK, EU и US)",
    pRights:
      "В зависимости от места проживания у вас могут быть права на доступ, исправление или удаление данных, а также возражение против определенной обработки. UK и EU: GDPR и PECR. Некоторые штаты США (например, Калифорния): CCPA/CPRA. Контакт: privacy@yourdomain.com.",

    close: "Закрыть",
  },

  ar: {
    bannerLine: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك وفهم استخدام التطبيق.",
    learnMore: "مزيد من المعلومات",
    accept: "موافقة",
    title: "ملفات تعريف الارتباط",
    intro: "نستخدم ملفات تعريف الارتباط لكي يعمل Explain My Numbers بسلاسة ولنَفهم كيف يتم استخدام التطبيق.",

    hWhat: "ما هي الملفات التي نستخدمها",
    pWhat:
      "نستخدم عددًا محدودًا من ملفات تعريف الارتباط وتقنيات مشابهة لتذكّر التفضيلات وفهم استخدام الميزات وتحسين الموثوقية والأداء. لا نستخدم ملفات تعريف ارتباط إعلانية ولا نتعقبك عبر مواقع أخرى.",

    hAnalytics: "التحليلات وبيانات الاستخدام",
    pAnalytics:
      "قد نجمع بيانات استخدام مجهولة مثل تفاعلات الميزات والأنماط العامة ومعلومات الأخطاء/الأداء. هذه البيانات مجمّعة ولا تحدد هويتك شخصيًا وتُستخدم فقط لتحسين المنتج.",

    hNo: "ما الذي لا نفعله",
    no1: "لا نبيع البيانات الشخصية",
    no2: "لا يوجد تتبع عبر المواقع",
    no3: "لا توجد ملفات تعريف ارتباط إعلانية من جهات خارجية",
    no4: "لا يوجد إنشاء ملفات تعريف تسويقية",

    hConsent: "موافقتك",
    pConsent:
      "يتم استخدام ملفات تعريف الارتباط غير الضرورية فقط بعد موافقتك. يمكنك سحب الموافقة في أي وقت عبر حذف ملفات تعريف الارتباط أو تعديل إعدادات المتصفح.",

    hRights: "حقوقك (المملكة المتحدة والاتحاد الأوروبي والولايات المتحدة)",
    pRights:
      "بحسب مكان إقامتك، قد يكون لديك الحق في الوصول إلى البيانات أو تصحيحها أو حذفها والاعتراض على بعض المعالجة. المملكة المتحدة والاتحاد الأوروبي: GDPR وPECR. بعض ولايات الولايات المتحدة (مثل كاليفورنيا): CCPA/CPRA. للتواصل: privacy@yourdomain.com.",

    close: "إغلاق",
  },

  he: {
    bannerLine: "אנחנו משתמשים בעוגיות כדי לשפר את החוויה ולהבין את השימוש באפליקציה.",
    learnMore: "מידע נוסף",
    accept: "אישור",
    title: "עוגיות",
    intro: "אנחנו משתמשים בעוגיות כדי ש-Explain My Numbers יעבוד בצורה חלקה וכדי להבין איך משתמשים באפליקציה.",

    hWhat: "אילו עוגיות אנחנו משתמשים",
    pWhat:
      "אנחנו משתמשים במספר קטן של עוגיות וטכנולוגיות דומות כדי לזכור העדפות, להבין שימוש בתכונות ולשפר אמינות וביצועים. אנחנו לא משתמשים בעוגיות פרסום ולא עוקבים אחריך באתרים אחרים.",

    hAnalytics: "אנליטיקה ונתוני שימוש",
    pAnalytics:
      "ייתכן שנאסוף נתוני שימוש אנונימיים כגון אינטראקציות עם תכונות, דפוסים כלליים ומידע על שגיאות/ביצועים. הנתונים מצטברים, לא מזהים אותך אישית ומשמשים רק לשיפור המוצר.",

    hNo: "מה אנחנו לא עושים",
    no1: "לא מוכרים נתונים אישיים",
    no2: "אין מעקב בין אתרים",
    no3: "אין עוגיות פרסום של צד שלישי",
    no4: "אין פרופילינג שיווקי",

    hConsent: "הסכמתך",
    pConsent:
      "עוגיות שאינן הכרחיות לחלוטין מופעלות רק לאחר הסכמתך. ניתן לבטל את ההסכמה בכל עת באמצעות מחיקת עוגיות או שינוי הגדרות הדפדפן.",

    hRights: "הזכויות שלך (בריטניה, האיחוד האירופי וארה״ב)",
    pRights:
      "בהתאם למקום מגוריך, ייתכן שיש לך זכות לגשת לנתונים, לתקן או למחוק אותם, ולהתנגד לעיבודים מסוימים. בריטניה והאיחוד האירופי: GDPR ו-PECR. חלק ממדינות ארה״ב (למשל קליפורניה): CCPA/CPRA. יצירת קשר: privacy@yourdomain.com.",

    close: "סגור",
  },

  hi: {
    bannerLine: "हम आपके अनुभव को बेहतर बनाने और ऐप के उपयोग को समझने के लिए कुकीज़ का उपयोग करते हैं।",
    learnMore: "और जानें",
    accept: "स्वीकार करें",
    title: "कुकीज़",
    intro: "Explain My Numbers को सुचारू रूप से चलाने और ऐप का उपयोग कैसे होता है, यह समझने के लिए हम कुकीज़ का उपयोग करते हैं।",

    hWhat: "हम कौन-सी कुकीज़ इस्तेमाल करते हैं",
    pWhat:
      "हम प्राथमिकताएँ याद रखने, फीचर उपयोग समझने और विश्वसनीयता/प्रदर्शन बेहतर करने के लिए कुछ कुकीज़ और समान तकनीकों का उपयोग करते हैं। हम विज्ञापन कुकीज़ का उपयोग नहीं करते और न ही आपको अन्य वेबसाइटों पर ट्रैक करते हैं।",

    hAnalytics: "एनालिटिक्स और उपयोग डेटा",
    pAnalytics:
      "हम फीचर इंटरैक्शन, सामान्य पैटर्न और त्रुटि/प्रदर्शन जानकारी जैसे गुमनाम उपयोग डेटा एकत्र कर सकते हैं। यह डेटा समेकित होता है, आपको व्यक्तिगत रूप से पहचानता नहीं है और केवल उत्पाद सुधार के लिए उपयोग होता है।",

    hNo: "हम क्या नहीं करते",
    no1: "व्यक्तिगत डेटा नहीं बेचते",
    no2: "क्रॉस-साइट ट्रैकिंग नहीं",
    no3: "थर्ड-पार्टी विज्ञापन कुकीज़ नहीं",
    no4: "मार्केटिंग प्रोफाइलिंग नहीं",

    hConsent: "आपकी सहमति",
    pConsent:
      "जो कुकीज़ सख्ती से आवश्यक नहीं हैं, उन्हें आपकी सहमति के बाद ही उपयोग किया जाता है। आप कुकीज़ साफ़ करके या ब्राउज़र सेटिंग बदलकर कभी भी सहमति वापस ले सकते हैं।",

    hRights: "आपके अधिकार (UK, EU और US)",
    pRights:
      "आप कहाँ रहते हैं इसके आधार पर, आपको डेटा तक पहुँच, सुधार या हटाने और कुछ प्रोसेसिंग पर आपत्ति करने का अधिकार हो सकता है। UK और EU: GDPR और PECR। US के कुछ राज्य (जैसे कैलिफ़ोर्निया): CCPA/CPRA। संपर्क: privacy@yourdomain.com.",

    close: "बंद करें",
  },

  bn: {
    bannerLine: "আপনার অভিজ্ঞতা উন্নত করতে এবং অ্যাপ ব্যবহারের ধরন বুঝতে আমরা কুকি ব্যবহার করি।",
    learnMore: "আরও জানুন",
    accept: "গ্রহণ করুন",
    title: "কুকি",
    intro: "Explain My Numbers মসৃণভাবে চালাতে এবং অ্যাপ কীভাবে ব্যবহৃত হচ্ছে তা বুঝতে আমরা কুকি ব্যবহার করি।",

    hWhat: "আমরা কোন কুকি ব্যবহার করি",
    pWhat:
      "পছন্দসমূহ মনে রাখা, ফিচার ব্যবহারের ধারণা নেওয়া এবং নির্ভরযোগ্যতা/পারফরম্যান্স উন্নত করতে আমরা অল্প কিছু কুকি ও অনুরূপ প্রযুক্তি ব্যবহার করি। আমরা বিজ্ঞাপন কুকি ব্যবহার করি না এবং অন্য ওয়েবসাইটে আপনাকে ট্র্যাক করি না।",

    hAnalytics: "অ্যানালিটিক্স ও ব্যবহার ডেটা",
    pAnalytics:
      "ফিচার ইন্টারঅ্যাকশন, সাধারণ ধারা এবং ত্রুটি/পারফরম্যান্স তথ্যের মতো বেনামী ব্যবহার ডেটা আমরা সংগ্রহ করতে পারি। এই ডেটা সমষ্টিগত, আপনাকে ব্যক্তিগতভাবে শনাক্ত করে না এবং শুধুমাত্র পণ্য উন্নত করতে ব্যবহৃত হয়।",

    hNo: "আমরা যা করি না",
    no1: "ব্যক্তিগত ডেটা বিক্রি করি না",
    no2: "ক্রস-সাইট ট্র্যাকিং নেই",
    no3: "তৃতীয় পক্ষের বিজ্ঞাপন কুকি নেই",
    no4: "মার্কেটিং প্রোফাইলিং নেই",

    hConsent: "আপনার সম্মতি",
    pConsent:
      "যে কুকিগুলো কঠোরভাবে প্রয়োজনীয় নয়, সেগুলো আপনার সম্মতির পরেই ব্যবহার করা হয়। কুকি মুছে ফেলে বা ব্রাউজারের সেটিংস পরিবর্তন করে আপনি যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন।",

    hRights: "আপনার অধিকার (UK, EU এবং US)",
    pRights:
      "আপনি কোথায় থাকেন তার উপর নির্ভর করে, ডেটা অ্যাক্সেস, সংশোধন বা মুছে ফেলার এবং কিছু প্রক্রিয়াকরণের বিরুদ্ধে আপত্তি করার অধিকার থাকতে পারে। UK/EU: GDPR ও PECR। US-এর কিছু রাজ্য (যেমন ক্যালিফোর্নিয়া): CCPA/CPRA। যোগাযোগ: privacy@yourdomain.com.",

    close: "বন্ধ",
  },

  ur: {
    bannerLine: "ہم آپ کے تجربے کو بہتر بنانے اور ایپ کے استعمال کو سمجھنے کے لیے کوکیز استعمال کرتے ہیں۔",
    learnMore: "مزید جانیں",
    accept: "قبول کریں",
    title: "کوکیز",
    intro: "Explain My Numbers کو بہتر طریقے سے چلانے اور ایپ کے استعمال کو سمجھنے کے لیے ہم کوکیز استعمال کرتے ہیں۔",

    hWhat: "ہم کون سی کوکیز استعمال کرتے ہیں",
    pWhat:
      "ہم ترجیحات یاد رکھنے، فیچر کے استعمال کو سمجھنے اور اعتمادیت/کارکردگی بہتر بنانے کے لیے چند کوکیز اور ملتی جلتی ٹیکنالوجیز استعمال کرتے ہیں۔ ہم اشتہاری کوکیز استعمال نہیں کرتے اور نہ ہی آپ کو دوسری ویب سائٹس پر ٹریک کرتے ہیں۔",

    hAnalytics: "اینالٹکس اور استعمال کا ڈیٹا",
    pAnalytics:
      "ہم گمنام استعمال کا ڈیٹا اکٹھا کر سکتے ہیں جیسے فیچر تعاملات، عمومی رجحانات، اور خرابی/کارکردگی کی معلومات۔ یہ ڈیٹا مجموعی ہوتا ہے، آپ کی ذاتی شناخت نہیں کرتا اور صرف پروڈکٹ بہتر بنانے کے لیے استعمال ہوتا ہے۔",

    hNo: "ہم کیا نہیں کرتے",
    no1: "ذاتی ڈیٹا فروخت نہیں کرتے",
    no2: "کراس سائٹ ٹریکنگ نہیں",
    no3: "تیسرے فریق کی اشتہاری کوکیز نہیں",
    no4: "مارکیٹنگ پروفائلنگ نہیں",

    hConsent: "آپ کی رضامندی",
    pConsent:
      "جو کوکیز سختی سے ضروری نہیں ہیں وہ صرف آپ کی رضامندی کے بعد استعمال کی جاتی ہیں۔ آپ کوکیز صاف کر کے یا براؤزر کی سیٹنگز بدل کر کسی بھی وقت رضامندی واپس لے سکتے ہیں۔",

    hRights: "آپ کے حقوق (UK, EU اور US)",
    pRights:
      "آپ کہاں رہتے ہیں اس کے مطابق، آپ کو ڈیٹا تک رسائی، درستگی یا حذف کرنے اور بعض پروسیسنگ پر اعتراض کرنے کا حق ہو سکتا ہے۔ UK/EU: GDPR اور PECR۔ US کی کچھ ریاستیں (مثلاً کیلیفورنیا): CCPA/CPRA۔ رابطہ: privacy@yourdomain.com.",

    close: "بند کریں",
  },

  id: {
    bannerLine: "Kami menggunakan cookie untuk meningkatkan pengalaman dan memahami penggunaan aplikasi.",
    learnMore: "Selengkapnya",
    accept: "Terima",
    title: "Cookie",
    intro: "Kami menggunakan cookie agar Explain My Numbers berjalan lancar dan untuk memahami bagaimana aplikasi digunakan.",

    hWhat: "Cookie apa yang kami gunakan",
    pWhat:
      "Kami menggunakan sejumlah kecil cookie dan teknologi serupa untuk mengingat preferensi, memahami penggunaan fitur, serta meningkatkan keandalan dan performa. Kami tidak menggunakan cookie iklan atau melacak Anda di situs lain.",

    hAnalytics: "Analitik & data penggunaan",
    pAnalytics:
      "Kami dapat mengumpulkan data penggunaan anonim seperti interaksi fitur, pola umum, serta informasi error/performa. Data ini teragregasi, tidak mengidentifikasi Anda secara pribadi, dan hanya digunakan untuk meningkatkan produk.",

    hNo: "Yang tidak kami lakukan",
    no1: "Tidak menjual data pribadi",
    no2: "Tidak ada pelacakan lintas situs",
    no3: "Tidak ada cookie iklan pihak ketiga",
    no4: "Tidak ada profiling pemasaran",

    hConsent: "Persetujuan Anda",
    pConsent:
      "Cookie yang tidak benar-benar diperlukan hanya digunakan setelah Anda memberi persetujuan. Anda dapat menarik persetujuan kapan saja dengan menghapus cookie atau menyesuaikan pengaturan browser.",

    hRights: "Hak Anda (UK, EU & US)",
    pRights:
      "Tergantung tempat Anda tinggal, Anda mungkin memiliki hak untuk mengakses, memperbaiki, atau menghapus data, serta menolak pemrosesan tertentu. UK & EU: GDPR dan PECR. Beberapa negara bagian AS (mis. California): CCPA/CPRA. Hubungi: privacy@yourdomain.com.",

    close: "Tutup",
  },

  ms: {
    bannerLine: "Kami menggunakan kuki untuk menambah baik pengalaman dan memahami penggunaan aplikasi.",
    learnMore: "Ketahui lagi",
    accept: "Terima",
    title: "Kuki",
    intro: "Kami menggunakan kuki untuk memastikan Explain My Numbers berfungsi dengan lancar dan untuk memahami bagaimana aplikasi digunakan.",

    hWhat: "Kuki yang kami gunakan",
    pWhat:
      "Kami menggunakan sejumlah kecil kuki dan teknologi serupa untuk mengingati pilihan, memahami penggunaan ciri, serta menambah baik kebolehpercayaan dan prestasi. Kami tidak menggunakan kuki pengiklanan atau menjejak anda merentas laman web lain.",

    hAnalytics: "Analitik & data penggunaan",
    pAnalytics:
      "Kami mungkin mengumpul data penggunaan tanpa nama seperti interaksi ciri, corak umum, serta maklumat ralat/prestasi. Data ini diagregatkan, tidak mengenal pasti anda, dan digunakan hanya untuk menambah baik produk.",

    hNo: "Apa yang kami tidak lakukan",
    no1: "Tidak menjual data peribadi",
    no2: "Tiada penjejakan rentas laman",
    no3: "Tiada kuki pengiklanan pihak ketiga",
    no4: "Tiada pemprofilan pemasaran",

    hConsent: "Persetujuan anda",
    pConsent:
      "Kuki yang tidak benar-benar diperlukan hanya digunakan selepas anda memberi persetujuan. Anda boleh menarik balik persetujuan pada bila-bila masa dengan memadam kuki atau melaraskan tetapan pelayar.",

    hRights: "Hak anda (UK, EU & US)",
    pRights:
      "Bergantung pada tempat anda tinggal, anda mungkin mempunyai hak untuk mengakses, membetulkan atau memadam data, dan membantah pemprosesan tertentu. UK & EU: GDPR dan PECR. Sesetengah negeri AS (cth. California): CCPA/CPRA. Hubungi: privacy@yourdomain.com.",

    close: "Tutup",
  },

  th: {
    bannerLine: "เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์และทำความเข้าใจการใช้งานแอป",
    learnMore: "ดูเพิ่มเติม",
    accept: "ยอมรับ",
    title: "คุกกี้",
    intro: "เราใช้คุกกี้เพื่อให้ Explain My Numbers ทำงานได้ราบรื่น และเพื่อทำความเข้าใจว่าแอปถูกใช้งานอย่างไร",

    hWhat: "คุกกี้ที่เราใช้",
    pWhat:
      "เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันจำนวนเล็กน้อยเพื่อจดจำการตั้งค่า ทำความเข้าใจการใช้งานฟีเจอร์ และปรับปรุงความเสถียรและประสิทธิภาพ เราไม่ใช้คุกกี้โฆษณาและไม่ติดตามคุณข้ามเว็บไซต์อื่น",

    hAnalytics: "การวิเคราะห์และข้อมูลการใช้งาน",
    pAnalytics:
      "เราอาจเก็บข้อมูลการใช้งานแบบไม่ระบุตัวตน เช่น การโต้ตอบกับฟีเจอร์ รูปแบบการใช้งานทั่วไป และข้อมูลข้อผิดพลาด/ประสิทธิภาพ ข้อมูลนี้ถูกรวมเป็นภาพรวม ไม่ระบุตัวตน และใช้เพื่อปรับปรุงผลิตภัณฑ์เท่านั้น",

    hNo: "สิ่งที่เราไม่ทำ",
    no1: "ไม่ขายข้อมูลส่วนบุคคล",
    no2: "ไม่ติดตามข้ามเว็บไซต์",
    no3: "ไม่มีคุกกี้โฆษณาจากบุคคลที่สาม",
    no4: "ไม่มีการทำโปรไฟล์การตลาด",

    hConsent: "ความยินยอมของคุณ",
    pConsent:
      "คุกกี้ที่ไม่จำเป็นอย่างเคร่งครัดจะถูกใช้หลังจากคุณให้ความยินยอมเท่านั้น คุณสามารถถอนความยินยอมได้ทุกเมื่อโดยการลบคุกกี้หรือปรับการตั้งค่าเบราว์เซอร์",

    hRights: "สิทธิของคุณ (สหราชอาณาจักร สหภาพยุโรป และสหรัฐฯ)",
    pRights:
      "ขึ้นอยู่กับที่ที่คุณอาศัยอยู่ คุณอาจมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูล และคัดค้านการประมวลผลบางอย่าง UK/EU: GDPR และ PECR บางรัฐในสหรัฐฯ (เช่น แคลิฟอร์เนีย): CCPA/CPRA ติดต่อ: privacy@yourdomain.com.",

    close: "ปิด",
  },

  vi: {
    bannerLine: "Chúng tôi dùng cookie để cải thiện trải nghiệm và hiểu cách ứng dụng được sử dụng.",
    learnMore: "Tìm hiểu thêm",
    accept: "Chấp nhận",
    title: "Cookie",
    intro: "Chúng tôi dùng cookie để Explain My Numbers hoạt động mượt mà và để hiểu cách ứng dụng được sử dụng.",

    hWhat: "Chúng tôi dùng loại cookie nào",
    pWhat:
      "Chúng tôi dùng một số ít cookie và công nghệ tương tự để ghi nhớ tùy chọn, hiểu việc sử dụng tính năng và cải thiện độ tin cậy/hiệu năng. Chúng tôi không dùng cookie quảng cáo và không theo dõi bạn trên các website khác.",

    hAnalytics: "Phân tích & dữ liệu sử dụng",
    pAnalytics:
      "Chúng tôi có thể thu thập dữ liệu sử dụng ẩn danh như tương tác tính năng, xu hướng chung và thông tin lỗi/hiệu năng. Dữ liệu được tổng hợp, không nhận diện cá nhân và chỉ dùng để cải thiện sản phẩm.",

    hNo: "Chúng tôi không làm",
    no1: "Không bán dữ liệu cá nhân",
    no2: "Không theo dõi liên trang",
    no3: "Không có cookie quảng cáo của bên thứ ba",
    no4: "Không lập hồ sơ marketing",

    hConsent: "Sự đồng ý của bạn",
    pConsent:
      "Cookie không thực sự cần thiết chỉ được dùng sau khi bạn đồng ý. Bạn có thể rút lại sự đồng ý bất cứ lúc nào bằng cách xóa cookie hoặc điều chỉnh cài đặt trình duyệt.",

    hRights: "Quyền của bạn (UK, EU & US)",
    pRights:
      "Tùy nơi bạn sống, bạn có thể có quyền truy cập, sửa hoặc xóa dữ liệu và phản đối một số hoạt động xử lý. UK & EU: GDPR và PECR. Một số bang của Mỹ (ví dụ California): CCPA/CPRA. Liên hệ: privacy@yourdomain.com.",

    close: "Đóng",
  },

  ja: {
    bannerLine: "当社は、体験の向上とアプリ利用状況の把握のためにCookieを使用します。",
    learnMore: "詳細",
    accept: "同意する",
    title: "Cookie",
    intro: "Explain My Numbers をスムーズに動作させ、アプリの利用状況を把握するためにCookieを使用します。",

    hWhat: "使用するCookieの種類",
    pWhat:
      "設定の保存、機能の利用状況の把握、信頼性とパフォーマンスの改善のために、少数のCookieおよび類似技術を使用します。広告Cookieは使用せず、他サイトを横断した追跡も行いません。",

    hAnalytics: "分析と利用データ",
    pAnalytics:
      "機能の操作、一般的な利用傾向、エラー/性能情報などの匿名化された利用データを収集する場合があります。データは集計され、個人を特定せず、製品改善のみに使用します。",

    hNo: "行わないこと",
    no1: "個人データの販売はしません",
    no2: "サイト間追跡はしません",
    no3: "第三者の広告Cookieはありません",
    no4: "マーケティング目的のプロファイリングはしません",

    hConsent: "同意について",
    pConsent:
      "厳密に必要でないCookieは、同意をいただいた後にのみ使用します。Cookieの削除やブラウザ設定の変更により、いつでも同意を撤回できます。",

    hRights: "あなたの権利（UK, EU & US）",
    pRights:
      "居住地により、データへのアクセス、訂正、削除、特定の処理への異議申し立ての権利がある場合があります。UK/EU: GDPR と PECR。米国の一部州（例: カリフォルニア）: CCPA/CPRA。連絡先: privacy@yourdomain.com。",

    close: "閉じる",
  },

  ko: {
    bannerLine: "당사는 사용자 경험 개선 및 앱 사용 방식 이해를 위해 쿠키를 사용합니다.",
    learnMore: "자세히",
    accept: "동의",
    title: "쿠키",
    intro: "Explain My Numbers가 원활하게 작동하도록 하고 앱 사용 방식을 이해하기 위해 쿠키를 사용합니다.",

    hWhat: "사용하는 쿠키",
    pWhat:
      "환경설정 저장, 기능 사용 이해, 안정성 및 성능 개선을 위해 소수의 쿠키 및 유사 기술을 사용합니다. 광고 쿠키를 사용하지 않으며 다른 웹사이트에서 사용자를 추적하지 않습니다.",

    hAnalytics: "분석 및 사용 데이터",
    pAnalytics:
      "기능 상호작용, 일반적인 패턴, 오류/성능 정보와 같은 익명 사용 데이터를 수집할 수 있습니다. 이 데이터는 집계되며 개인을 식별하지 않고 제품 개선에만 사용됩니다.",

    hNo: "하지 않는 일",
    no1: "개인 데이터 판매 없음",
    no2: "사이트 간 추적 없음",
    no3: "제3자 광고 쿠키 없음",
    no4: "마케팅 프로파일링 없음",

    hConsent: "동의",
    pConsent:
      "엄격히 필요하지 않은 쿠키는 동의 후에만 사용됩니다. 쿠키를 삭제하거나 브라우저 설정을 조정하여 언제든 동의를 철회할 수 있습니다.",

    hRights: "사용자 권리 (UK, EU & US)",
    pRights:
      "거주 지역에 따라 데이터 접근/수정/삭제 및 특정 처리에 대한 이의 제기 권리가 있을 수 있습니다. UK & EU: GDPR 및 PECR. 일부 미국 주(예: 캘리포니아): CCPA/CPRA. 문의: privacy@yourdomain.com.",

    close: "닫기",
  },

  zh: {
    bannerLine: "我们使用 Cookie 来提升体验并了解应用的使用情况。",
    learnMore: "了解更多",
    accept: "接受",
    title: "Cookie",
    intro: "我们使用 Cookie 让 Explain My Numbers 更顺畅运行，并了解应用是如何被使用的。",

    hWhat: "我们使用哪些 Cookie",
    pWhat:
      "我们使用少量 Cookie 和类似技术来记住偏好设置、了解功能使用情况，并提升可靠性与性能。我们不使用广告 Cookie，也不会跨其他网站跟踪您。",

    hAnalytics: "分析与使用数据",
    pAnalytics:
      "我们可能会收集匿名使用数据，例如功能交互、总体使用模式以及错误/性能信息。这些数据为汇总形式，不会识别您的个人身份，仅用于改进产品。",

    hNo: "我们不会做什么",
    no1: "不出售个人数据",
    no2: "不进行跨站跟踪",
    no3: "不使用第三方广告 Cookie",
    no4: "不进行营销画像",

    hConsent: "您的同意",
    pConsent:
      "非严格必要的 Cookie 仅在您同意后使用。您可以随时通过清除 Cookie 或调整浏览器设置来撤回同意。",

    hRights: "您的权利（英国、欧盟与美国）",
    pRights:
      "根据您所在地区，您可能有权访问、更正或删除数据，并反对某些处理。英国与欧盟：GDPR 与 PECR。美国部分州（如加州）：CCPA/CPRA。联系：privacy@yourdomain.com。",

    close: "关闭",
  },

};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="text-[12px] font-black uppercase tracking-[0.18em] text-zinc-900/80 dark:text-white/70">
        {title}
      </div>
      <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t}
          className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-[12px] font-semibold text-zinc-800
                 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function PrivacyModal({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const t = I18N[lang];
  const isRTL = lang === "ar" || lang === "he" || lang === "ur";


  useEffect(() => {
  if (!open) return;

  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  window.addEventListener("keydown", onKey);

  return () => {
    document.body.style.overflow = prev;
    window.removeEventListener("keydown", onKey);
  };
}, [open, onClose]);


  if (!open) return null;
  

  return (
  <div className="fixed inset-0 z-[100] print:hidden">
    {/* ✅ One full-screen click surface */}
    <div
      className="absolute inset-0 bg-black/35 backdrop-blur-[2px] dark:bg-black/55"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* ✅ Full-screen layout wrapper (no click handler needed here) */}
    <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6 pointer-events-none">
      {/* ✅ Modal card: re-enable pointer events and stop bubbling */}
      <div
        role="dialog"
        dir={isRTL ? "rtl" : "ltr"}
        aria-modal="true"
        aria-label={t.title}
        onClick={(e) => e.stopPropagation()}
        className={[
          "pointer-events-auto",
          "w-full max-w-2xl",
          "rounded-3xl border",
          "bg-white/85 backdrop-blur-2xl",
          "border-white/70",
          "shadow-[0_30px_90px_rgba(0,0,0,0.25)]",
          "dark:bg-zinc-950/65 dark:border-white/10",
          "overflow-hidden",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-white/70 dark:border-white/10 dark:bg-white/[0.05]">
                <Info size={16} className="text-zinc-700 dark:text-white/70" />
              </span>
              <div className="text-[15px] sm:text-[16px] font-extrabold tracking-[-0.02em] text-zinc-900 dark:text-white">
                {t.title}
              </div>
            </div>
            <div className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {t.intro}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className={[
              "shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border",
              "border-zinc-200 bg-white/70 text-zinc-800 hover:bg-white",
              "dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.10]",
              "transition-colors",
              "cursor-pointer",
            ].join(" ")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div
          className={[
            "px-5 pb-5",
            "max-h-[70vh] sm:max-h-[75vh]",
            "overflow-y-auto",
            "overscroll-contain",
            "[webkit-overflow-scrolling:touch]",
          ].join(" ")}
        >
          <div className="space-y-5">
            <Section title={t.hWhat}>{t.pWhat}</Section>
            <Section title={t.hAnalytics}>{t.pAnalytics}</Section>
            <Section title={t.hNo}>
              <PillList items={[t.no1, t.no2, t.no3, t.no4]} />
            </Section>
            <Section title={t.hConsent}>{t.pConsent}</Section>
            <Section title={t.hRights}>{t.pRights}</Section>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={[
                "h-10 px-5 rounded-full border font-extrabold text-[13px]",
                "bg-white/70 border-zinc-200 text-zinc-900 hover:bg-white",
"dark:bg-white/[0.04] dark:border-white/10 dark:text-white/85 dark:hover:bg-white/[0.07]",
                "transition-colors",
                "cursor-pointer",
              ].join(" ")}
            >
              {t.close}
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200/80 to-transparent dark:via-white/10" />
      </div>
    </div>
  </div>
);

}

export default function CookieBanner({
  onPrivacy,
  storageKey = "emn_cookie_consent_v1",
}: CookieBannerProps) {
  const [show, setShow] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const lang = useMemo(() => detectLang(), []);
  const isRTL = lang === "ar" || lang === "he" || lang === "ur";

  const t = I18N[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) setShow(true);
    } catch {
      setShow(true);
    }
  }, [storageKey]);

  const accept = () => {
    try {
      localStorage.setItem(storageKey, "accepted");
    } catch {}
    setShow(false);
    setOpenModal(false);
  };

  const learnMore = () => {
    // If you provided a custom privacy modal elsewhere, call it.
    // Otherwise, open the built-in modal below.
    if (onPrivacy) onPrivacy();
    else setOpenModal(true);
  };

  if (!show) return null;

  return (
    <>
      <PrivacyModal open={openModal} onClose={() => setOpenModal(false)} lang={lang} />

      <div
       dir={isRTL ? "rtl" : "ltr"}
        className={[
          "fixed left-0 right-0 bottom-3 z-[70]",
          "px-2 sm:px-4",
          "print:hidden",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto w-full max-w-3xl sm:max-w-5xl",
            "rounded-2xl border",
            "px-2.5 py-2 sm:px-4 sm:py-2",
            "backdrop-blur-xl",
"bg-white/70 border-white/70",
"dark:bg-zinc-950/70 dark:border-white/12",
"shadow-[0_12px_38px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_55px_rgba(0,0,0,0.45)]",

            "relative overflow-hidden",
          ].join(" ")}
        >
          {/* subtle glow */}
          <div className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-35">
            <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/55 blur-2xl dark:bg-white/10" />
            <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-emerald-200/35 blur-2xl dark:bg-emerald-400/10" />
          </div>

          <div
            className={[
              "relative flex flex-col sm:flex-row",
              "items-center sm:items-center",
              "gap-2",
              "sm:justify-between",
            ].join(" ")}
          >
            {/* TEXT — centered on mobile, left on desktop */}
            <div
  className={[
    "flex items-center gap-2",
    isRTL ? "flex-row-reverse" : "flex-row",
    "text-[12.5px] sm:text-[13px]",
    "leading-none",
    "text-zinc-700 dark:text-white/80",
    isRTL ? "text-center sm:text-right" : "text-center sm:text-left",
  ].join(" ")}
>

              <Info
                size={14}
                strokeWidth={2}
                className="shrink-0 text-zinc-500 dark:text-white/50"
                aria-hidden="true"
              />
              <span>{t.bannerLine}</span>
            </div>

            {/* BUTTONS — centered on mobile, right on desktop */}
<div
  className={[
    "flex items-center gap-2 justify-center shrink-0",
    isRTL ? "sm:justify-start" : "sm:justify-end",
  ].join(" ")}
>
              <button
                type="button"
                onClick={learnMore}
                className={[
                  "h-9 px-3.5",
                  "rounded-full border font-extrabold",
                  "text-[12.5px]",
"bg-white/65 border-zinc-200 text-zinc-900",
"hover:bg-white hover:border-zinc-300 hover:shadow-sm",
"dark:bg-white/[0.04] dark:border-white/10 dark:text-white/85",
"dark:hover:bg-white/[0.07]",
                   "cursor-pointer",
                  "transition-colors",
                ].join(" ")}
              >
                {t.learnMore}
              </button>

              <button
                type="button"
                onClick={accept}
                className={[
                  "h-9 px-3.5",
                  "rounded-full font-extrabold",
                  "text-[12.5px]",
                  "bg-black text-white",
                  "shadow-[0_10px_24px_rgba(0,0,0,0.16)]",
                  "hover:translate-y-[-1px] active:translate-y-[0px]",
                  "transition-transform",
                  "cursor-pointer",
                  "dark:bg-white dark:text-black",
                ].join(" ")}
              >
                {t.accept}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
