// lib/i18n/uiCopy.ts

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
  | "uk";

export type UiCopyKey =
  | "QUICK_CHECKS_TITLE"
  | "QUICK_CHECK_1"
  | "QUICK_CHECK_2"
  | "QUICK_CHECK_3"
  | "COULDNT_COMPLETE"
  | "RESET";

export const UI_COPY: Record<UiLang18, Record<UiCopyKey, string>> = {
  en: {
    QUICK_CHECKS_TITLE: "Quick checks",
    QUICK_CHECK_1:
      "If you pasted data, ensure it’s tabular (CSV/TSV style) with a header row.",
    QUICK_CHECK_2:
      "If you uploaded Excel, try exporting the relevant sheet to CSV.",
    QUICK_CHECK_3: "If it’s rate-limited, wait a minute and retry.",
    COULDNT_COMPLETE: "Couldn’t complete",
    RESET: "Reset",
  },

  it: {
    QUICK_CHECKS_TITLE: "Controlli rapidi",
    QUICK_CHECK_1:
      "Se hai incollato dei dati, assicurati che siano tabellari (stile CSV/TSV) con una riga di intestazione.",
    QUICK_CHECK_2:
      "Se hai caricato un file Excel, prova a esportare il foglio rilevante in CSV.",
    QUICK_CHECK_3:
      "Se sei stato limitato (rate limit), aspetta un minuto e riprova.",
    COULDNT_COMPLETE: "Operazione non riuscita",
    RESET: "Reimposta",
  },

  fr: {
    QUICK_CHECKS_TITLE: "Vérifications rapides",
    QUICK_CHECK_1:
      "Si vous avez collé des données, assurez-vous qu’elles sont tabulaires (CSV/TSV) avec une ligne d’en-tête.",
    QUICK_CHECK_2:
      "Si vous avez importé un fichier Excel, essayez d’exporter la feuille concernée en CSV.",
    QUICK_CHECK_3:
      "Si vous êtes limité (rate limit), attendez une minute puis réessayez.",
    COULDNT_COMPLETE: "Analyse non terminée",
    RESET: "Réinitialiser",
  },

  es: {
    QUICK_CHECKS_TITLE: "Comprobaciones rápidas",
    QUICK_CHECK_1:
      "Si pegaste datos, asegúrate de que sean tabulares (estilo CSV/TSV) con una fila de encabezado.",
    QUICK_CHECK_2:
      "Si subiste un Excel, prueba a exportar la hoja relevante a CSV.",
    QUICK_CHECK_3:
      "Si hay limitación por tasa (rate limit), espera un minuto y vuelve a intentarlo.",
    COULDNT_COMPLETE: "No se pudo completar",
    RESET: "Restablecer",
  },

  de: {
    QUICK_CHECKS_TITLE: "Schnellchecks",
    QUICK_CHECK_1:
      "Wenn du Daten eingefügt hast, stelle sicher, dass sie tabellarisch sind (CSV/TSV) und eine Kopfzeile haben.",
    QUICK_CHECK_2:
      "Wenn du Excel hochgeladen hast, versuche das relevante Blatt als CSV zu exportieren.",
    QUICK_CHECK_3:
      "Wenn du rate-limitiert bist, warte eine Minute und versuche es erneut.",
    COULDNT_COMPLETE: "Konnte nicht abgeschlossen werden",
    RESET: "Zurücksetzen",
  },

  pt: {
    QUICK_CHECKS_TITLE: "Verificações rápidas",
    QUICK_CHECK_1:
      "Se você colou dados, verifique se estão em formato tabular (CSV/TSV) com uma linha de cabeçalho.",
    QUICK_CHECK_2:
      "Se você enviou um Excel, tente exportar a planilha relevante para CSV.",
    QUICK_CHECK_3:
      "Se estiver com limite de requisições (rate limit), aguarde um minuto e tente novamente.",
    COULDNT_COMPLETE: "Não foi possível concluir",
    RESET: "Redefinir",
  },

  nl: {
    QUICK_CHECKS_TITLE: "Snelle controles",
    QUICK_CHECK_1:
      "Als je data hebt geplakt, zorg dat het tabulair is (CSV/TSV) met een kopregel.",
    QUICK_CHECK_2:
      "Als je Excel hebt geüpload, probeer het relevante blad te exporteren naar CSV.",
    QUICK_CHECK_3:
      "Als je rate-limited bent, wacht een minuut en probeer opnieuw.",
    COULDNT_COMPLETE: "Kon niet voltooien",
    RESET: "Reset",
  },

  sv: {
    QUICK_CHECKS_TITLE: "Snabbkontroller",
    QUICK_CHECK_1:
      "Om du klistrade in data, se till att den är tabellformad (CSV/TSV) med en rubrikrad.",
    QUICK_CHECK_2:
      "Om du laddade upp Excel, testa att exportera relevant blad till CSV.",
    QUICK_CHECK_3:
      "Om du är rate-limited, vänta en minut och försök igen.",
    COULDNT_COMPLETE: "Kunde inte slutföras",
    RESET: "Återställ",
  },

  no: {
    QUICK_CHECKS_TITLE: "Raske sjekker",
    QUICK_CHECK_1:
      "Hvis du limte inn data, sørg for at de er tabellformet (CSV/TSV) med en overskriftsrad.",
    QUICK_CHECK_2:
      "Hvis du lastet opp Excel, prøv å eksportere riktig ark til CSV.",
    QUICK_CHECK_3:
      "Hvis du er rate-limited, vent et minutt og prøv igjen.",
    COULDNT_COMPLETE: "Kunne ikke fullføre",
    RESET: "Tilbakestill",
  },

  da: {
    QUICK_CHECKS_TITLE: "Hurtige tjek",
    QUICK_CHECK_1:
      "Hvis du indsatte data, så sørg for, at de er tabelformede (CSV/TSV) med en header-række.",
    QUICK_CHECK_2:
      "Hvis du uploadede Excel, så prøv at eksportere det relevante ark til CSV.",
    QUICK_CHECK_3:
      "Hvis du er rate-limited, så vent et minut og prøv igen.",
    COULDNT_COMPLETE: "Kunne ikke fuldføre",
    RESET: "Nulstil",
  },

  fi: {
    QUICK_CHECKS_TITLE: "Pikatarkistukset",
    QUICK_CHECK_1:
      "Jos liitit dataa, varmista että se on taulukkomuodossa (CSV/TSV) ja sisältää otsikkorivin.",
    QUICK_CHECK_2:
      "Jos latasit Excelin, kokeile viedä oleellinen välilehti CSV-muotoon.",
    QUICK_CHECK_3:
      "Jos sinulla on pyyntörajoitus (rate limit), odota minuutti ja yritä uudelleen.",
    COULDNT_COMPLETE: "Ei voitu suorittaa",
    RESET: "Nollaa",
  },

  pl: {
    QUICK_CHECKS_TITLE: "Szybkie sprawdzenia",
    QUICK_CHECK_1:
      "Jeśli wkleiłeś dane, upewnij się, że są tabelaryczne (CSV/TSV) i mają wiersz nagłówka.",
    QUICK_CHECK_2:
      "Jeśli wgrałeś Excela, spróbuj wyeksportować odpowiedni arkusz do CSV.",
    QUICK_CHECK_3:
      "Jeśli masz limit zapytań (rate limit), odczekaj minutę i spróbuj ponownie.",
    COULDNT_COMPLETE: "Nie udało się ukończyć",
    RESET: "Resetuj",
  },

  tr: {
    QUICK_CHECKS_TITLE: "Hızlı kontroller",
    QUICK_CHECK_1:
      "Veri yapıştırdıysanız, başlık satırı olan tablo biçiminde (CSV/TSV) olduğundan emin olun.",
    QUICK_CHECK_2:
      "Excel yüklediyseniz, ilgili sayfayı CSV olarak dışa aktarmayı deneyin.",
    QUICK_CHECK_3:
      "Rate limit varsa, bir dakika bekleyip tekrar deneyin.",
    COULDNT_COMPLETE: "Tamamlanamadı",
    RESET: "Sıfırla",
  },

  el: {
    QUICK_CHECKS_TITLE: "Γρήγοροι έλεγχοι",
    QUICK_CHECK_1:
      "Αν επικολλήσατε δεδομένα, βεβαιωθείτε ότι είναι σε μορφή πίνακα (CSV/TSV) με γραμμή κεφαλίδας.",
    QUICK_CHECK_2:
      "Αν ανεβάσατε Excel, δοκιμάστε να εξάγετε το σχετικό φύλλο σε CSV.",
    QUICK_CHECK_3:
      "Αν υπάρχει περιορισμός (rate limit), περιμένετε ένα λεπτό και δοκιμάστε ξανά.",
    COULDNT_COMPLETE: "Δεν ήταν δυνατή η ολοκλήρωση",
    RESET: "Επαναφορά",
  },

  cs: {
    QUICK_CHECKS_TITLE: "Rychlé kontroly",
    QUICK_CHECK_1:
      "Pokud jste data vložili, ujistěte se, že jsou tabulková (CSV/TSV) a mají řádek záhlaví.",
    QUICK_CHECK_2:
      "Pokud jste nahráli Excel, zkuste exportovat příslušný list do CSV.",
    QUICK_CHECK_3:
      "Pokud jste omezeni (rate limit), počkejte minutu a zkuste to znovu.",
    COULDNT_COMPLETE: "Nepodařilo se dokončit",
    RESET: "Resetovat",
  },

  hu: {
    QUICK_CHECKS_TITLE: "Gyors ellenőrzések",
    QUICK_CHECK_1:
      "Ha bemásolt adatokat, győződj meg róla, hogy táblázatos (CSV/TSV) és van fejlécsor.",
    QUICK_CHECK_2:
      "Ha Excelt töltöttél fel, próbáld a releváns munkalapot CSV-be exportálni.",
    QUICK_CHECK_3:
      "Ha rate limit van, várj egy percet és próbáld újra.",
    COULDNT_COMPLETE: "Nem sikerült befejezni",
    RESET: "Visszaállítás",
  },

  ro: {
    QUICK_CHECKS_TITLE: "Verificări rapide",
    QUICK_CHECK_1:
      "Dacă ai lipit date, asigură-te că sunt tabelare (CSV/TSV) și au un rând de antet.",
    QUICK_CHECK_2:
      "Dacă ai încărcat Excel, încearcă să exporți foaia relevantă în CSV.",
    QUICK_CHECK_3:
      "Dacă ești limitat (rate limit), așteaptă un minut și încearcă din nou.",
    COULDNT_COMPLETE: "Nu s-a putut finaliza",
    RESET: "Resetează",
  },

  uk: {
    QUICK_CHECKS_TITLE: "Швидкі перевірки",
    QUICK_CHECK_1:
      "Якщо ви вставили дані, переконайтеся, що вони табличні (CSV/TSV) і мають рядок заголовків.",
    QUICK_CHECK_2:
      "Якщо ви завантажили Excel, спробуйте експортувати потрібний аркуш у CSV.",
    QUICK_CHECK_3:
      "Якщо діє обмеження запитів (rate limit), зачекайте хвилину та спробуйте ще раз.",
    COULDNT_COMPLETE: "Не вдалося завершити",
    RESET: "Скинути",
  },
};

export function normalizeUiLang18(lang: string | null | undefined): UiLang18 {
  const s = String(lang ?? "")
    .trim()
    .toLowerCase()
    .split(",")[0]
    ?.split(";")[0]
    ?.split("-")[0]
    ?.trim();

  const supported = new Set<UiLang18>([
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
  ]);

  return (supported.has(s as UiLang18) ? (s as UiLang18) : "en");
}

export function tUi18(lang: string, key: UiCopyKey): string {
  const L = normalizeUiLang18(lang);
  return UI_COPY[L]?.[key] ?? UI_COPY.en[key] ?? "";
}
