// lib/i18n/apiErrors.ts

export type ApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_FORMDATA"
  | "EMPTY_INPUT"
  | "INPUT_TOO_LARGE"
  | "UPLOAD_TOO_LARGE"
  | "UNSUPPORTED_FILE"
  | "EXCEL_PARSE_FAILED"
  | "RATE_LIMITED"
  | "UPSTREAM_FAILURE"
  | "BAD_OUTPUT_FORMAT"
  | "SERVER_ERROR"
  | "CONFIG_ERROR"
  | "GATE_REQUIRED"
  | "FORBIDDEN"
  | "NO_ENTITLEMENT"
  // ✅ Added: UI copy used when entitlement blocks access
  | "TRIAL_ENDED"
  | "SUBSCRIBE_TO_CONTINUE"
  | "TRIAL_OR_SUBSCRIBE";

export type SupportedLang =
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

export const API_ERROR_MESSAGES: Record<
  SupportedLang,
  Record<ApiErrorCode, string>
> = {
  en: {
    INVALID_JSON: "Invalid request format.",
    INVALID_FORMDATA: "Invalid form submission.",
    EMPTY_INPUT: "Please paste or upload some data.",
    INPUT_TOO_LARGE: "Input is too large.",
    UPLOAD_TOO_LARGE: "Uploaded file is too large.",
    UNSUPPORTED_FILE: "Unsupported file type.",
    EXCEL_PARSE_FAILED: "Unable to read the provided data.",
    RATE_LIMITED: "Too many requests. Please try again shortly.",
    UPSTREAM_FAILURE: "Analysis provider error. Please try again.",
    BAD_OUTPUT_FORMAT: "The analysis output was invalid.",
    SERVER_ERROR: "Server error. Please try again.",
    CONFIG_ERROR: "Server configuration error.",
    GATE_REQUIRED: "Authorization required.",
    FORBIDDEN: "Access forbidden.",

    // 🔹 Original meaning kept
    NO_ENTITLEMENT: "Your free trial has ended.",

    // ✅ Added (for UI copy)
    TRIAL_ENDED: "Your free trial has ended.",
    SUBSCRIBE_TO_CONTINUE: "Subscribe for £4.99/month to continue analysing.",
    TRIAL_OR_SUBSCRIBE:
      "You can start with a free trial or subscribe at any time.",
  },

  it: {
    INVALID_JSON: "Formato della richiesta non valido.",
    INVALID_FORMDATA: "Invio del modulo non valido.",
    EMPTY_INPUT: "Incolla o carica dei dati.",
    INPUT_TOO_LARGE: "L’input è troppo grande.",
    UPLOAD_TOO_LARGE: "Il file caricato è troppo grande.",
    UNSUPPORTED_FILE: "Tipo di file non supportato.",
    EXCEL_PARSE_FAILED: "Impossibile leggere i dati forniti.",
    RATE_LIMITED: "Troppe richieste. Riprova tra poco.",
    UPSTREAM_FAILURE: "Errore del provider di analisi. Riprova.",
    BAD_OUTPUT_FORMAT: "L’output dell’analisi non è valido.",
    SERVER_ERROR: "Errore del server. Riprova.",
    CONFIG_ERROR: "Errore di configurazione del server.",
    GATE_REQUIRED: "Autorizzazione richiesta.",
    FORBIDDEN: "Accesso negato.",

    NO_ENTITLEMENT: "La tua prova gratuita è terminata.",

    // ✅ Added
    TRIAL_ENDED: "La tua prova gratuita è terminata.",
    SUBSCRIBE_TO_CONTINUE:
      "Abbonati a £4,99/mese per continuare ad analizzare.",
    TRIAL_OR_SUBSCRIBE:
      "Puoi iniziare con una prova gratuita o abbonarti in qualsiasi momento.",
  },

  fr: {
    INVALID_JSON: "Format de requête invalide.",
    INVALID_FORMDATA: "Envoi du formulaire invalide.",
    EMPTY_INPUT: "Veuillez coller ou importer des données.",
    INPUT_TOO_LARGE: "L’entrée est trop volumineuse.",
    UPLOAD_TOO_LARGE: "Le fichier importé est trop volumineux.",
    UNSUPPORTED_FILE: "Type de fichier non pris en charge.",
    EXCEL_PARSE_FAILED: "Impossible de lire les données fournies.",
    RATE_LIMITED: "Trop de requêtes. Veuillez réessayer bientôt.",
    UPSTREAM_FAILURE: "Erreur du fournisseur d’analyse. Veuillez réessayer.",
    BAD_OUTPUT_FORMAT: "La sortie de l’analyse était invalide.",
    SERVER_ERROR: "Erreur serveur. Veuillez réessayer.",
    CONFIG_ERROR: "Erreur de configuration du serveur.",
    GATE_REQUIRED: "Autorisation requise.",
    FORBIDDEN: "Accès interdit.",

    NO_ENTITLEMENT: "Votre essai gratuit est terminé.",

    // ✅ Added
    TRIAL_ENDED: "Votre essai gratuit est terminé.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonnez-vous à 4,99 £/mois pour continuer l’analyse.",
    TRIAL_OR_SUBSCRIBE:
      "Vous pouvez commencer par un essai gratuit ou vous abonner à tout moment.",
  },

  es: {
    INVALID_JSON: "Formato de solicitud no válido.",
    INVALID_FORMDATA: "Envío de formulario no válido.",
    EMPTY_INPUT: "Pega o sube algunos datos.",
    INPUT_TOO_LARGE: "La entrada es demasiado grande.",
    UPLOAD_TOO_LARGE: "El archivo subido es demasiado grande.",
    UNSUPPORTED_FILE: "Tipo de archivo no compatible.",
    EXCEL_PARSE_FAILED: "No se pueden leer los datos proporcionados.",
    RATE_LIMITED: "Demasiadas solicitudes. Inténtalo de nuevo en breve.",
    UPSTREAM_FAILURE: "Error del proveedor de análisis. Inténtalo de nuevo.",
    BAD_OUTPUT_FORMAT: "La salida del análisis no era válida.",
    SERVER_ERROR: "Error del servidor. Inténtalo de nuevo.",
    CONFIG_ERROR: "Error de configuración del servidor.",
    GATE_REQUIRED: "Se requiere autorización.",
    FORBIDDEN: "Acceso prohibido.",

    NO_ENTITLEMENT: "Tu prueba gratuita ha terminado.",

    // ✅ Added
    TRIAL_ENDED: "Tu prueba gratuita ha terminado.",
    SUBSCRIBE_TO_CONTINUE: "Suscríbete por £4,99/mes para seguir analizando.",
    TRIAL_OR_SUBSCRIBE:
      "Puedes empezar con una prueba gratuita o suscribirte en cualquier momento.",
  },

  de: {
    INVALID_JSON: "Ungültiges Anfrageformat.",
    INVALID_FORMDATA: "Ungültige Formularübermittlung.",
    EMPTY_INPUT: "Bitte Daten einfügen oder hochladen.",
    INPUT_TOO_LARGE: "Die Eingabe ist zu groß.",
    UPLOAD_TOO_LARGE: "Die hochgeladene Datei ist zu groß.",
    UNSUPPORTED_FILE: "Nicht unterstützter Dateityp.",
    EXCEL_PARSE_FAILED:
      "Die bereitgestellten Daten konnten nicht gelesen werden.",
    RATE_LIMITED: "Zu viele Anfragen. Bitte versuche es in Kürze erneut.",
    UPSTREAM_FAILURE: "Fehler beim Analyseanbieter. Bitte erneut versuchen.",
    BAD_OUTPUT_FORMAT: "Die Analyseausgabe war ungültig.",
    SERVER_ERROR: "Serverfehler. Bitte erneut versuchen.",
    CONFIG_ERROR: "Serverkonfigurationsfehler.",
    GATE_REQUIRED: "Autorisierung erforderlich.",
    FORBIDDEN: "Zugriff verweigert.",

    NO_ENTITLEMENT: "Dein kostenloser Test ist abgelaufen.",

    // ✅ Added
    TRIAL_ENDED: "Dein kostenloser Test ist abgelaufen.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonniere für £4,99/Monat, um weiter zu analysieren.",
    TRIAL_OR_SUBSCRIBE:
      "Du kannst mit einer kostenlosen Testphase starten oder jederzeit abonnieren.",
  },

  pt: {
    INVALID_JSON: "Formato de solicitação inválido.",
    INVALID_FORMDATA: "Envio do formulário inválido.",
    EMPTY_INPUT: "Cole ou envie alguns dados.",
    INPUT_TOO_LARGE: "A entrada é grande demais.",
    UPLOAD_TOO_LARGE: "O arquivo enviado é grande demais.",
    UNSUPPORTED_FILE: "Tipo de arquivo não suportado.",
    EXCEL_PARSE_FAILED: "Não foi possível ler os dados fornecidos.",
    RATE_LIMITED: "Muitas solicitações. Tente novamente em breve.",
    UPSTREAM_FAILURE: "Erro do provedor de análise. Tente novamente.",
    BAD_OUTPUT_FORMAT: "A saída da análise era inválida.",
    SERVER_ERROR: "Erro do servidor. Tente novamente.",
    CONFIG_ERROR: "Erro de configuração do servidor.",
    GATE_REQUIRED: "Autorização necessária.",
    FORBIDDEN: "Acesso proibido.",

    NO_ENTITLEMENT: "Seu teste gratuito terminou.",

    // ✅ Added
    TRIAL_ENDED: "Seu teste gratuito terminou.",
    SUBSCRIBE_TO_CONTINUE:
      "Assine por £4,99/mês para continuar analisando.",
    TRIAL_OR_SUBSCRIBE:
      "Você pode começar com um teste gratuito ou assinar a qualquer momento.",
  },

  nl: {
    INVALID_JSON: "Ongeldig aanvraagformaat.",
    INVALID_FORMDATA: "Ongeldige formulierinzending.",
    EMPTY_INPUT: "Plak of upload wat gegevens.",
    INPUT_TOO_LARGE: "Invoer is te groot.",
    UPLOAD_TOO_LARGE: "Geüpload bestand is te groot.",
    UNSUPPORTED_FILE: "Niet-ondersteund bestandstype.",
    EXCEL_PARSE_FAILED: "De aangeleverde gegevens konden niet worden gelezen.",
    RATE_LIMITED: "Te veel verzoeken. Probeer het zo opnieuw.",
    UPSTREAM_FAILURE: "Fout bij analyseprovider. Probeer het opnieuw.",
    BAD_OUTPUT_FORMAT: "De analyse-uitvoer was ongeldig.",
    SERVER_ERROR: "Serverfout. Probeer het opnieuw.",
    CONFIG_ERROR: "Serverconfiguratiefout.",
    GATE_REQUIRED: "Autorisatie vereist.",
    FORBIDDEN: "Toegang verboden.",

    NO_ENTITLEMENT: "Je gratis proefperiode is afgelopen.",

    // ✅ Added
    TRIAL_ENDED: "Je gratis proefperiode is afgelopen.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonneer voor £4,99/maand om te blijven analyseren.",
    TRIAL_OR_SUBSCRIBE:
      "Je kunt beginnen met een gratis proefperiode of op elk moment abonneren.",
  },

  sv: {
    INVALID_JSON: "Ogiltigt begäranformat.",
    INVALID_FORMDATA: "Ogiltig formulärinsändning.",
    EMPTY_INPUT: "Klistra in eller ladda upp data.",
    INPUT_TOO_LARGE: "Indatan är för stor.",
    UPLOAD_TOO_LARGE: "Den uppladdade filen är för stor.",
    UNSUPPORTED_FILE: "Filtypen stöds inte.",
    EXCEL_PARSE_FAILED: "Det gick inte att läsa de angivna uppgifterna.",
    RATE_LIMITED: "För många förfrågningar. Försök igen snart.",
    UPSTREAM_FAILURE: "Fel hos analysleverantören. Försök igen.",
    BAD_OUTPUT_FORMAT: "Analysutdata var ogiltigt.",
    SERVER_ERROR: "Serverfel. Försök igen.",
    CONFIG_ERROR: "Serverkonfigurationsfel.",
    GATE_REQUIRED: "Behörighet krävs.",
    FORBIDDEN: "Åtkomst förbjuden.",

    NO_ENTITLEMENT: "Din gratis provperiod har gått ut.",

    // ✅ Added
    TRIAL_ENDED: "Din gratis provperiod har gått ut.",
    SUBSCRIBE_TO_CONTINUE:
      "Prenumerera för £4,99/månad för att fortsätta analysera.",
    TRIAL_OR_SUBSCRIBE:
      "Du kan börja med en gratis provperiod eller prenumerera när som helst.",
  },

  no: {
    INVALID_JSON: "Ugyldig forespørselsformat.",
    INVALID_FORMDATA: "Ugyldig skjemainnsending.",
    EMPTY_INPUT: "Lim inn eller last opp data.",
    INPUT_TOO_LARGE: "Inndata er for stor.",
    UPLOAD_TOO_LARGE: "Opplastet fil er for stor.",
    UNSUPPORTED_FILE: "Filtype støttes ikke.",
    EXCEL_PARSE_FAILED: "Kunne ikke lese de oppgitte dataen.",
    RATE_LIMITED: "For mange forespørsler. Prøv igjen snart.",
    UPSTREAM_FAILURE: "Feil hos analyseleverandør. Prøv igjen.",
    BAD_OUTPUT_FORMAT: "Analyseutdata var ugyldig.",
    SERVER_ERROR: "Serverfeil. Prøv igjen.",
    CONFIG_ERROR: "Serverkonfigurasjonsfeil.",
    GATE_REQUIRED: "Autorisasjon kreves.",
    FORBIDDEN: "Tilgang forbudt.",

    NO_ENTITLEMENT: "Din gratis prøveperiode er avsluttet.",

    // ✅ Added
    TRIAL_ENDED: "Din gratis prøveperiode er avsluttet.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonner for £4,99/måned for å fortsette å analysere.",
    TRIAL_OR_SUBSCRIBE:
      "Du kan starte med en gratis prøveperiode eller abonnere når som helst.",
  },

  da: {
    INVALID_JSON: "Ugyldigt anmodningsformat.",
    INVALID_FORMDATA: "Ugyldig formularindsendelse.",
    EMPTY_INPUT: "Indsæt eller upload nogle data.",
    INPUT_TOO_LARGE: "Input er for stor.",
    UPLOAD_TOO_LARGE: "Den uploadede fil er for stor.",
    UNSUPPORTED_FILE: "Filtypen understøttes ikke.",
    EXCEL_PARSE_FAILED: "Kunne ikke læse de angivne data.",
    RATE_LIMITED: "For mange anmodninger. Prøv igen om lidt.",
    UPSTREAM_FAILURE: "Fejl hos analyseudbyder. Prøv igen.",
    BAD_OUTPUT_FORMAT: "Analyseoutput var ugyldigt.",
    SERVER_ERROR: "Serverfejl. Prøv igen.",
    CONFIG_ERROR: "Serverkonfigurationsfejl.",
    GATE_REQUIRED: "Autorisation kræves.",
    FORBIDDEN: "Adgang forbudt.",

    NO_ENTITLEMENT: "Din gratis prøveperiode er slut.",

    // ✅ Added
    TRIAL_ENDED: "Din gratis prøveperiode er slut.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonnér for £4,99/måned for at fortsætte med at analysere.",
    TRIAL_OR_SUBSCRIBE:
      "Du kan starte med en gratis prøveperiode eller abonnere når som helst.",
  },

  fi: {
    INVALID_JSON: "Virheellinen pyyntömuoto.",
    INVALID_FORMDATA: "Virheellinen lomakkeen lähetys.",
    EMPTY_INPUT: "Liitä tai lataa dataa.",
    INPUT_TOO_LARGE: "Syöte on liian suuri.",
    UPLOAD_TOO_LARGE: "Ladattu tiedosto on liian suuri.",
    UNSUPPORTED_FILE: "Tiedostotyyppiä ei tueta.",
    EXCEL_PARSE_FAILED: "Annettuja tietoja ei voitu lukea.",
    RATE_LIMITED: "Liikaa pyyntöjä. Yritä pian uudelleen.",
    UPSTREAM_FAILURE: "Analyysipalvelun virhe. Yritä uudelleen.",
    BAD_OUTPUT_FORMAT: "Analyysin tulos oli virheellinen.",
    SERVER_ERROR: "Palvelinvirhe. Yritä uudelleen.",
    CONFIG_ERROR: "Palvelimen määritysvika.",
    GATE_REQUIRED: "Valtuutus vaaditaan.",
    FORBIDDEN: "Pääsy kielletty.",

    NO_ENTITLEMENT: "Ilmainen kokeilusi on päättynyt.",

    // ✅ Added
    TRIAL_ENDED: "Ilmainen kokeilusi on päättynyt.",
    SUBSCRIBE_TO_CONTINUE: "Tilaa £4,99/kk ja jatka analysointia.",
    TRIAL_OR_SUBSCRIBE:
      "Voit aloittaa ilmaisella kokeilulla tai tilata milloin tahansa.",
  },

  pl: {
    INVALID_JSON: "Nieprawidłowy format żądania.",
    INVALID_FORMDATA: "Nieprawidłowe wysłanie formularza.",
    EMPTY_INPUT: "Wklej lub prześlij dane.",
    INPUT_TOO_LARGE: "Dane wejściowe są zbyt duże.",
    UPLOAD_TOO_LARGE: "Przesłany plik jest zbyt duży.",
    UNSUPPORTED_FILE: "Nieobsługiwany typ pliku.",
    EXCEL_PARSE_FAILED: "Nie można odczytać podanych danych.",
    RATE_LIMITED: "Zbyt wiele żądań. Spróbuj ponownie za chwilę.",
    UPSTREAM_FAILURE: "Błąd dostawcy analizy. Spróbuj ponownie.",
    BAD_OUTPUT_FORMAT: "Wynik analizy był nieprawidłowy.",
    SERVER_ERROR: "Błąd serwera. Spróbuj ponownie.",
    CONFIG_ERROR: "Błąd konfiguracji serwera.",
    GATE_REQUIRED: "Wymagana autoryzacja.",
    FORBIDDEN: "Dostęp zabroniony.",

    NO_ENTITLEMENT: "Twoja bezpłatna wersja próbna dobiegła końca.",

    // ✅ Added
    TRIAL_ENDED: "Twoja bezpłatna wersja próbna dobiegła końca.",
    SUBSCRIBE_TO_CONTINUE:
      "Subskrybuj za £4,99/mies., aby kontynuować analizę.",
    TRIAL_OR_SUBSCRIBE:
      "Możesz zacząć od bezpłatnego okresu próbnego lub subskrybować w dowolnym momencie.",
  },

  tr: {
    INVALID_JSON: "Geçersiz istek biçimi.",
    INVALID_FORMDATA: "Geçersiz form gönderimi.",
    EMPTY_INPUT: "Lütfen veri yapıştırın veya yükleyin.",
    INPUT_TOO_LARGE: "Girdi çok büyük.",
    UPLOAD_TOO_LARGE: "Yüklenen dosya çok büyük.",
    UNSUPPORTED_FILE: "Desteklenmeyen dosya türü.",
    EXCEL_PARSE_FAILED: "Sağlanan veriler okunamadı.",
    RATE_LIMITED:
      "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin.",
    UPSTREAM_FAILURE: "Analiz sağlayıcı hatası. Lütfen tekrar deneyin.",
    BAD_OUTPUT_FORMAT: "Analiz çıktısı geçersizdi.",
    SERVER_ERROR: "Sunucu hatası. Lütfen tekrar deneyin.",
    CONFIG_ERROR: "Sunucu yapılandırma hatası.",
    GATE_REQUIRED: "Yetkilendirme gerekli.",
    FORBIDDEN: "Erişim yasak.",

    NO_ENTITLEMENT: "Ücretsiz denemeniz sona erdi.",

    // ✅ Added
    TRIAL_ENDED: "Ücretsiz denemeniz sona erdi.",
    SUBSCRIBE_TO_CONTINUE:
      "Analize devam etmek için £4,99/ay karşılığında abone olun.",
    TRIAL_OR_SUBSCRIBE:
      "Ücretsiz denemeyle başlayabilir veya istediğiniz zaman abone olabilirsiniz.",
  },

  el: {
    INVALID_JSON: "Μη έγκυρη μορφή αιτήματος.",
    INVALID_FORMDATA: "Μη έγκυρη υποβολή φόρμας.",
    EMPTY_INPUT: "Επικολλήστε ή ανεβάστε δεδομένα.",
    INPUT_TOO_LARGE: "Η είσοδος είναι πολύ μεγάλη.",
    UPLOAD_TOO_LARGE: "Το αρχείο που ανέβηκε είναι πολύ μεγάλο.",
    UNSUPPORTED_FILE: "Μη υποστηριζόμενος τύπος αρχείου.",
    EXCEL_PARSE_FAILED:
      "Δεν ήταν δυνατή η ανάγνωση των παρεχόμενων δεδομένων.",
    RATE_LIMITED: "Πάρα πολλά αιτήματα. Δοκιμάστε ξανά σύντομα.",
    UPSTREAM_FAILURE: "Σφάλμα παρόχου ανάλυσης. Δοκιμάστε ξανά.",
    BAD_OUTPUT_FORMAT: "Η έξοδος της ανάλυσης δεν ήταν έγκυρη.",
    SERVER_ERROR: "Σφάλμα διακομιστή. Δοκιμάστε ξανά.",
    CONFIG_ERROR: "Σφάλμα ρύθμισης διακομιστή.",
    GATE_REQUIRED: "Απαιτείται εξουσιοδότηση.",
    FORBIDDEN: "Απαγορεύεται η πρόσβαση.",

    NO_ENTITLEMENT: "Η δωρεάν δοκιμή σας έληξε.",

    // ✅ Added
    TRIAL_ENDED: "Η δωρεάν δοκιμή σας έληξε.",
    SUBSCRIBE_TO_CONTINUE:
      "Κάντε συνδρομή με £4,99/μήνα για να συνεχίσετε την ανάλυση.",
    TRIAL_OR_SUBSCRIBE:
      "Μπορείτε να ξεκινήσετε με δωρεάν δοκιμή ή να κάνετε συνδρομή οποιαδήποτε στιγμή.",
  },

  cs: {
    INVALID_JSON: "Neplatný formát požadavku.",
    INVALID_FORMDATA: "Neplatné odeslání formuláře.",
    EMPTY_INPUT: "Vložte nebo nahrajte data.",
    INPUT_TOO_LARGE: "Vstup je příliš velký.",
    UPLOAD_TOO_LARGE: "Nahraný soubor je příliš velký.",
    UNSUPPORTED_FILE: "Nepodporovaný typ souboru.",
    EXCEL_PARSE_FAILED: "Nelze přečíst poskytnutá data.",
    RATE_LIMITED: "Příliš mnoho požadavků. Zkuste to za chvíli.",
    UPSTREAM_FAILURE: "Chyba poskytovatele analýzy. Zkuste to znovu.",
    BAD_OUTPUT_FORMAT: "Výstup analýzy nebyl platný.",
    SERVER_ERROR: "Chyba serveru. Zkuste to znovu.",
    CONFIG_ERROR: "Chyba konfigurace serveru.",
    GATE_REQUIRED: "Vyžadováno ověření.",
    FORBIDDEN: "Přístup zakázán.",

    NO_ENTITLEMENT: "Vaše bezplatná zkušební doba skončila.",

    // ✅ Added
    TRIAL_ENDED: "Vaše bezplatná zkušební doba skončila.",
    SUBSCRIBE_TO_CONTINUE:
      "Předplaťte si za £4,99/měsíc a pokračujte v analýze.",
    TRIAL_OR_SUBSCRIBE:
      "Můžete začít bezplatnou zkušební verzí nebo si kdykoli předplatit.",
  },

  hu: {
    INVALID_JSON: "Érvénytelen kérésformátum.",
    INVALID_FORMDATA: "Érvénytelen űrlapbeküldés.",
    EMPTY_INPUT: "Illesszen be vagy töltsön fel adatokat.",
    INPUT_TOO_LARGE: "A bemenet túl nagy.",
    UPLOAD_TOO_LARGE: "A feltöltött fájl túl nagy.",
    UNSUPPORTED_FILE: "Nem támogatott fájltípus.",
    EXCEL_PARSE_FAILED:
      "A megadott adatok nem olvashatók.",
    RATE_LIMITED: "Túl sok kérés. Próbálja meg hamarosan újra.",
    UPSTREAM_FAILURE: "Elemző szolgáltató hiba. Próbálja újra.",
    BAD_OUTPUT_FORMAT: "Az elemzés kimenete érvénytelen volt.",
    SERVER_ERROR: "Szerverhiba. Próbálja újra.",
    CONFIG_ERROR: "Szerverkonfigurációs hiba.",
    GATE_REQUIRED: "Hitelesítés szükséges.",
    FORBIDDEN: "Hozzáférés tiltva.",

    NO_ENTITLEMENT: "A ingyenes próbaidőszak véget ért.",

    // ✅ Added
    TRIAL_ENDED: "Az ingyenes próbaidőszak véget ért.",
    SUBSCRIBE_TO_CONTINUE:
      "Fizessen elő £4,99/hó áron az elemzés folytatásához.",
    TRIAL_OR_SUBSCRIBE:
      "Kezdhet ingyenes próbaidőszakkal, vagy bármikor előfizethet.",
  },

  ro: {
    INVALID_JSON: "Format de cerere invalid.",
    INVALID_FORMDATA: "Trimitere de formular invalidă.",
    EMPTY_INPUT: "Lipiți sau încărcați date.",
    INPUT_TOO_LARGE: "Intrarea este prea mare.",
    UPLOAD_TOO_LARGE: "Fișierul încărcat este prea mare.",
    UNSUPPORTED_FILE: "Tip de fișier neacceptat.",
    EXCEL_PARSE_FAILED: "Nu se pot citi datele furnizate.",
    RATE_LIMITED: "Prea multe cereri. Încercați din nou în curând.",
    UPSTREAM_FAILURE: "Eroare la furnizorul de analiză. Încercați din nou.",
    BAD_OUTPUT_FORMAT: "Rezultatul analizei a fost invalid.",
    SERVER_ERROR: "Eroare de server. Încercați din nou.",
    CONFIG_ERROR: "Eroare de configurare a serverului.",
    GATE_REQUIRED: "Este necesară autorizarea.",
    FORBIDDEN: "Acces interzis.",

    NO_ENTITLEMENT: "Perioada gratuită de probă s-a încheiat.",

    // ✅ Added
    TRIAL_ENDED: "Perioada gratuită de probă s-a încheiat.",
    SUBSCRIBE_TO_CONTINUE:
      "Abonați-vă pentru £4,99/lună ca să continuați analiza.",
    TRIAL_OR_SUBSCRIBE:
      "Puteți începe cu o perioadă de probă gratuită sau vă puteți abona oricând.",
  },

  uk: {
    INVALID_JSON: "Некоректний формат запиту.",
    INVALID_FORMDATA: "Некоректне надсилання форми.",
    EMPTY_INPUT: "Будь ласка, вставте або завантажте дані.",
    INPUT_TOO_LARGE: "Вхідні дані занадто великі.",
    UPLOAD_TOO_LARGE: "Завантажений файл занадто великий.",
    UNSUPPORTED_FILE: "Непідтримуваний тип файлу.",
    EXCEL_PARSE_FAILED: "Не вдалося прочитати надані дані.",
    RATE_LIMITED:
      "Занадто багато запитів. Спробуйте знову трохи пізніше.",
    UPSTREAM_FAILURE: "Помилка постачальника аналізу. Спробуйте ще раз.",
    BAD_OUTPUT_FORMAT: "Вихідні дані аналізу були некоректні.",
    SERVER_ERROR: "Помилка сервера. Спробуйте ще раз.",
    CONFIG_ERROR: "Помилка конфігурації сервера.",
    GATE_REQUIRED: "Потрібна авторизація.",
    FORBIDDEN: "Доступ заборонено.",

    NO_ENTITLEMENT: "Ваш безкоштовний пробний період завершився.",

    // ✅ Added
    TRIAL_ENDED: "Ваш безкоштовний пробний період завершився.",
    SUBSCRIBE_TO_CONTINUE:
      "Підпишіться за £4,99/місяць, щоб продовжити аналіз.",
    TRIAL_OR_SUBSCRIBE:
      "Ви можете почати з безкоштовної пробної версії або підписатися будь-коли.",
  },

  ru: {
    INVALID_JSON: "Неверный формат запроса.",
    INVALID_FORMDATA: "Неверная отправка формы.",
    EMPTY_INPUT: "Пожалуйста, вставьте или загрузите данные.",
    INPUT_TOO_LARGE: "Ввод слишком большой.",
    UPLOAD_TOO_LARGE: "Загруженный файл слишком большой.",
    UNSUPPORTED_FILE: "Неподдерживаемый тип файла.",
    EXCEL_PARSE_FAILED: "Не удалось прочитать предоставленные данные.",
    RATE_LIMITED: "Слишком много запросов. Попробуйте снова позже.",
    UPSTREAM_FAILURE: "Ошибка поставщика анализа. Попробуйте снова.",
    BAD_OUTPUT_FORMAT: "Результат анализа был неверным.",
    SERVER_ERROR: "Ошибка сервера. Попробуйте снова.",
    CONFIG_ERROR: "Ошибка конфигурации сервера.",
    GATE_REQUIRED: "Требуется авторизация.",
    FORBIDDEN: "Доступ запрещён.",

    NO_ENTITLEMENT: "Ваш бесплатный пробный период завершён.",

    // ✅ Added
    TRIAL_ENDED: "Ваш бесплатный пробный период завершён.",
    SUBSCRIBE_TO_CONTINUE:
      "Подпишитесь за £4,99/месяц, чтобы продолжить анализ.",
    TRIAL_OR_SUBSCRIBE:
      "Вы можете начать с бесплатного пробного периода или подписаться в любое время.",
  },

  ar: {
    INVALID_JSON: "تنسيق الطلب غير صالح.",
    INVALID_FORMDATA: "إرسال النموذج غير صالح.",
    EMPTY_INPUT: "يرجى لصق البيانات أو رفعها.",
    INPUT_TOO_LARGE: "المدخلات كبيرة جدًا.",
    UPLOAD_TOO_LARGE: "الملف المرفوع كبير جدًا.",
    UNSUPPORTED_FILE: "نوع الملف غير مدعوم.",
    EXCEL_PARSE_FAILED: "تعذر قراءة البيانات المقدمة",
    RATE_LIMITED: "طلبات كثيرة جدًا. يرجى المحاولة قريبًا.",
    UPSTREAM_FAILURE: "خطأ من مزود التحليل. يرجى المحاولة مرة أخرى.",
    BAD_OUTPUT_FORMAT: "مخرجات التحليل غير صالحة.",
    SERVER_ERROR: "خطأ في الخادم. يرجى المحاولة مرة أخرى.",
    CONFIG_ERROR: "خطأ في إعدادات الخادم.",
    GATE_REQUIRED: "التفويض مطلوب.",
    FORBIDDEN: "الوصول محظور.",

    NO_ENTITLEMENT: "انتهت الفترة التجريبية المجانية.",

    // ✅ Added
    TRIAL_ENDED: "انتهت الفترة التجريبية المجانية.",
    SUBSCRIBE_TO_CONTINUE: "اشترك مقابل ‎£4.99‎/شهريًا لمتابعة التحليل.",
    TRIAL_OR_SUBSCRIBE:
      "يمكنك البدء بفترة تجريبية مجانية أو الاشتراك في أي وقت.",
  },

  he: {
    INVALID_JSON: "פורמט בקשה לא תקין.",
    INVALID_FORMDATA: "שליחת טופס לא תקינה.",
    EMPTY_INPUT: "נא להדביק או להעלות נתונים.",
    INPUT_TOO_LARGE: "הקלט גדול מדי.",
    UPLOAD_TOO_LARGE: "הקובץ שהועלה גדול מדי.",
    UNSUPPORTED_FILE: "סוג קובץ לא נתמך.",
    EXCEL_PARSE_FAILED: "לא ניתן לקרוא את הנתונים שסופקו.",
    RATE_LIMITED: "יותר מדי בקשות. נסו שוב בקרוב.",
    UPSTREAM_FAILURE: "שגיאה אצל ספק הניתוח. נסו שוב.",
    BAD_OUTPUT_FORMAT: "פלט הניתוח אינו תקין.",
    SERVER_ERROR: "שגיאת שרת. נסו שוב.",
    CONFIG_ERROR: "שגיאת תצורת שרת.",
    GATE_REQUIRED: "נדרשת הרשאה.",
    FORBIDDEN: "הגישה אסורה.",

    NO_ENTITLEMENT: "תקופת הניסיון החינמית הסתיימה.",

    // ✅ Added
    TRIAL_ENDED: "תקופת הניסיון החינמית הסתיימה.",
    SUBSCRIBE_TO_CONTINUE: "הירשמו ב-£4.99 לחודש כדי להמשיך בניתוח.",
    TRIAL_OR_SUBSCRIBE: "אפשר להתחיל עם ניסיון חינם או להירשם בכל עת.",
  },

  hi: {
    INVALID_JSON: "अनुरोध का फ़ॉर्मेट अमान्य है।",
    INVALID_FORMDATA: "फ़ॉर्म सबमिशन अमान्य है।",
    EMPTY_INPUT: "कृपया डेटा पेस्ट करें या अपलोड करें।",
    INPUT_TOO_LARGE: "इनपुट बहुत बड़ा है।",
    UPLOAD_TOO_LARGE: "अपलोड की गई फ़ाइल बहुत बड़ी है।",
    UNSUPPORTED_FILE: "असमर्थित फ़ाइल प्रकार।",
    EXCEL_PARSE_FAILED: "प्रदान किए गए डेटा को पढ़ा नहीं जा सका",
    RATE_LIMITED: "बहुत ज़्यादा अनुरोध। थोड़ी देर बाद फिर प्रयास करें।",
    UPSTREAM_FAILURE: "विश्लेषण प्रदाता त्रुटि। फिर प्रयास करें।",
    BAD_OUTPUT_FORMAT: "विश्लेषण आउटपुट अमान्य था।",
    SERVER_ERROR: "सर्वर त्रुटि। फिर प्रयास करें।",
    CONFIG_ERROR: "सर्वर कॉन्फ़िगरेशन त्रुटि।",
    GATE_REQUIRED: "अनुमोदन आवश्यक है।",
    FORBIDDEN: "प्रवेश निषिद्ध है।",

    NO_ENTITLEMENT: "आपका मुफ़्त ट्रायल समाप्त हो गया है।",

    // ✅ Added
    TRIAL_ENDED: "आपका मुफ़्त ट्रायल समाप्त हो गया है।",
    SUBSCRIBE_TO_CONTINUE: "जारी रखने के लिए £4.99/माह पर सब्सक्राइब करें।",
    TRIAL_OR_SUBSCRIBE:
      "आप मुफ़्त ट्रायल से शुरू कर सकते हैं या कभी भी सब्सक्राइब कर सकते हैं।",
  },

  bn: {
    INVALID_JSON: "অনুরোধের ফরম্যাট সঠিক নয়।",
    INVALID_FORMDATA: "ফর্ম জমা দেওয়া সঠিক নয়।",
    EMPTY_INPUT: "দয়া করে ডেটা পেস্ট করুন বা আপলোড করুন।",
    INPUT_TOO_LARGE: "ইনপুট খুব বড়।",
    UPLOAD_TOO_LARGE: "আপলোড করা ফাইল খুব বড়।",
    UNSUPPORTED_FILE: "সমর্থিত নয় এমন ফাইল টাইপ।",
    EXCEL_PARSE_FAILED: "প্রদত্ত ডেটা পড়া যায়নি",
    RATE_LIMITED: "অনেক বেশি অনুরোধ। একটু পরে আবার চেষ্টা করুন।",
    UPSTREAM_FAILURE: "বিশ্লেষণ প্রদানকারীর ত্রুটি। আবার চেষ্টা করুন।",
    BAD_OUTPUT_FORMAT: "বিশ্লেষণের আউটপুট সঠিক নয়।",
    SERVER_ERROR: "সার্ভার ত্রুটি। আবার চেষ্টা করুন।",
    CONFIG_ERROR: "সার্ভার কনফিগারেশন ত্রুটি।",
    GATE_REQUIRED: "অনুমোদন প্রয়োজন।",
    FORBIDDEN: "অ্যাক্সেস নিষিদ্ধ।",

    NO_ENTITLEMENT: "আপনার ফ্রি ট্রায়াল শেষ হয়েছে।",

    // ✅ Added
    TRIAL_ENDED: "আপনার ফ্রি ট্রায়াল শেষ হয়েছে।",
    SUBSCRIBE_TO_CONTINUE:
      "বিশ্লেষণ চালিয়ে যেতে £4.99/মাস সাবস্ক্রাইব করুন।",
    TRIAL_OR_SUBSCRIBE:
      "আপনি ফ্রি ট্রায়াল দিয়ে শুরু করতে পারেন বা যেকোনো সময় সাবস্ক্রাইব করতে পারেন।",
  },

  ur: {
    INVALID_JSON: "درخواست کی فارمیٹ درست نہیں۔",
    INVALID_FORMDATA: "فارم جمع کرانا درست نہیں۔",
    EMPTY_INPUT: "براہِ کرم ڈیٹا پیسٹ کریں یا اپ لوڈ کریں۔",
    INPUT_TOO_LARGE: "ان پٹ بہت بڑا ہے۔",
    UPLOAD_TOO_LARGE: "اپ لوڈ کی گئی فائل بہت بڑی ہے۔",
    UNSUPPORTED_FILE: "غیر معاون فائل ٹائپ۔",
    EXCEL_PARSE_FAILED: "فراہم کردہ ڈیٹا پڑھا نہیں جا سکا",
    RATE_LIMITED: "درخواستیں بہت زیادہ ہیں۔ کچھ دیر بعد دوبارہ کوشش کریں۔",
    UPSTREAM_FAILURE: "تجزیہ فراہم کنندہ کی خرابی۔ دوبارہ کوشش کریں۔",
    BAD_OUTPUT_FORMAT: "تجزیہ کا آؤٹ پٹ درست نہیں تھا۔",
    SERVER_ERROR: "سرور کی خرابی۔ دوبارہ کوشش کریں۔",
    CONFIG_ERROR: "سرور کنفیگریشن کی خرابی۔",
    GATE_REQUIRED: "اجازت درکار ہے۔",
    FORBIDDEN: "رسائی ممنوع ہے۔",

    NO_ENTITLEMENT: "آپ کا مفت ٹرائل ختم ہو گیا ہے۔",

    // ✅ Added
    TRIAL_ENDED: "آپ کا مفت ٹرائل ختم ہو گیا ہے۔",
    SUBSCRIBE_TO_CONTINUE:
      "تجزیہ جاری رکھنے کے لیے £4.99/ماہ سبسکرائب کریں۔",
    TRIAL_OR_SUBSCRIBE:
      "آپ مفت ٹرائل سے شروع کر سکتے ہیں یا کسی بھی وقت سبسکرائب کر سکتے ہیں۔",
  },

  id: {
    INVALID_JSON: "Format permintaan tidak valid.",
    INVALID_FORMDATA: "Pengiriman formulir tidak valid.",
    EMPTY_INPUT: "Silakan tempel atau unggah data.",
    INPUT_TOO_LARGE: "Input terlalu besar.",
    UPLOAD_TOO_LARGE: "File yang diunggah terlalu besar.",
    UNSUPPORTED_FILE: "Jenis file tidak didukung.",
    EXCEL_PARSE_FAILED: "Tidak dapat membaca data yang diberikan.",
    RATE_LIMITED: "Terlalu banyak permintaan. Coba lagi sebentar.",
    UPSTREAM_FAILURE: "Kesalahan penyedia analisis. Coba lagi.",
    BAD_OUTPUT_FORMAT: "Output analisis tidak valid.",
    SERVER_ERROR: "Kesalahan server. Coba lagi.",
    CONFIG_ERROR: "Kesalahan konfigurasi server.",
    GATE_REQUIRED: "Diperlukan otorisasi.",
    FORBIDDEN: "Akses ditolak.",

    NO_ENTITLEMENT: "Uji coba gratis Anda telah berakhir.",

    // ✅ Added
    TRIAL_ENDED: "Uji coba gratis Anda telah berakhir.",
    SUBSCRIBE_TO_CONTINUE:
      "Berlangganan £4.99/bulan untuk terus menganalisis.",
    TRIAL_OR_SUBSCRIBE:
      "Anda bisa mulai dengan uji coba gratis atau berlangganan kapan saja.",
  },

  ms: {
    INVALID_JSON: "Format permintaan tidak sah.",
    INVALID_FORMDATA: "Penghantaran borang tidak sah.",
    EMPTY_INPUT: "Sila tampal atau muat naik data.",
    INPUT_TOO_LARGE: "Input terlalu besar.",
    UPLOAD_TOO_LARGE: "Fail yang dimuat naik terlalu besar.",
    UNSUPPORTED_FILE: "Jenis fail tidak disokong.",
    EXCEL_PARSE_FAILED: "Tidak dapat membaca data yang diberikan.",
    RATE_LIMITED: "Terlalu banyak permintaan. Cuba lagi sebentar.",
    UPSTREAM_FAILURE: "Ralat penyedia analisis. Cuba lagi.",
    BAD_OUTPUT_FORMAT: "Output analisis tidak sah.",
    SERVER_ERROR: "Ralat pelayan. Cuba lagi.",
    CONFIG_ERROR: "Ralat konfigurasi pelayan.",
    GATE_REQUIRED: "Kebenaran diperlukan.",
    FORBIDDEN: "Akses dilarang.",

    NO_ENTITLEMENT: "Percubaan percuma anda telah tamat.",

    // ✅ Added
    TRIAL_ENDED: "Percubaan percuma anda telah tamat.",
    SUBSCRIBE_TO_CONTINUE:
      "Langgan £4.99/bulan untuk terus membuat analisis.",
    TRIAL_OR_SUBSCRIBE:
      "Anda boleh mula dengan percubaan percuma atau melanggan pada bila-bila masa.",
  },

  th: {
    INVALID_JSON: "รูปแบบคำขอไม่ถูกต้อง",
    INVALID_FORMDATA: "การส่งฟอร์มไม่ถูกต้อง",
    EMPTY_INPUT: "โปรดวางหรืออัปโหลดข้อมูล",
    INPUT_TOO_LARGE: "ข้อมูลนำเข้ามีขนาดใหญ่เกินไป",
    UPLOAD_TOO_LARGE: "ไฟล์ที่อัปโหลดมีขนาดใหญ่เกินไป",
    UNSUPPORTED_FILE: "ประเภทไฟล์ไม่รองรับ",
    EXCEL_PARSE_FAILED: "ไม่สามารถอ่านข้อมูลที่ให้มาได้",
    RATE_LIMITED: "มีคำขอมากเกินไป โปรดลองใหม่อีกครั้งในไม่ช้า",
    UPSTREAM_FAILURE: "ผู้ให้บริการวิเคราะห์เกิดข้อผิดพลาด โปรดลองใหม่",
    BAD_OUTPUT_FORMAT: "ผลลัพธ์การวิเคราะห์ไม่ถูกต้อง",
    SERVER_ERROR: "เซิร์ฟเวอร์เกิดข้อผิดพลาด โปรดลองใหม่",
    CONFIG_ERROR: "การกำหนดค่าเซิร์ฟเวอร์ผิดพลาด",
    GATE_REQUIRED: "ต้องได้รับการอนุญาต",
    FORBIDDEN: "ห้ามเข้าถึง",

    NO_ENTITLEMENT: "ช่วงทดลองใช้ฟรีของคุณสิ้นสุดแล้ว",

    // ✅ Added
    TRIAL_ENDED: "ช่วงทดลองใช้ฟรีของคุณสิ้นสุดแล้ว",
    SUBSCRIBE_TO_CONTINUE:
      "สมัครสมาชิก £4.99/เดือนเพื่อวิเคราะห์ต่อ",
    TRIAL_OR_SUBSCRIBE:
      "คุณสามารถเริ่มด้วยทดลองใช้ฟรีหรือสมัครสมาชิกได้ตลอดเวลา",
  },

  vi: {
    INVALID_JSON: "Định dạng yêu cầu không hợp lệ.",
    INVALID_FORMDATA: "Gửi biểu mẫu không hợp lệ.",
    EMPTY_INPUT: "Vui lòng dán hoặc tải lên dữ liệu.",
    INPUT_TOO_LARGE: "Dữ liệu đầu vào quá lớn.",
    UPLOAD_TOO_LARGE: "Tệp tải lên quá lớn.",
    UNSUPPORTED_FILE: "Loại tệp không được hỗ trợ.",
    EXCEL_PARSE_FAILED: "Không thể đọc dữ liệu đã cung cấp.",
    RATE_LIMITED: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
    UPSTREAM_FAILURE: "Lỗi nhà cung cấp phân tích. Vui lòng thử lại.",
    BAD_OUTPUT_FORMAT: "Đầu ra phân tích không hợp lệ.",
    SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại.",
    CONFIG_ERROR: "Lỗi cấu hình máy chủ.",
    GATE_REQUIRED: "Yêu cầu xác thực.",
    FORBIDDEN: "Truy cập bị từ chối.",

    NO_ENTITLEMENT: "Bản dùng thử miễn phí của bạn đã kết thúc.",

    // ✅ Added
    TRIAL_ENDED: "Bản dùng thử miễn phí của bạn đã kết thúc.",
    SUBSCRIBE_TO_CONTINUE:
      "Đăng ký £4.99/tháng để tiếp tục phân tích.",
    TRIAL_OR_SUBSCRIBE:
      "Bạn có thể bắt đầu bằng bản dùng thử miễn phí hoặc đăng ký bất cứ lúc nào.",
  },

  ja: {
    INVALID_JSON: "リクエスト形式が無効です。",
    INVALID_FORMDATA: "フォーム送信が無効です。",
    EMPTY_INPUT: "データを貼り付けるかアップロードしてください。",
    INPUT_TOO_LARGE: "入力が大きすぎます。",
    UPLOAD_TOO_LARGE: "アップロードしたファイルが大きすぎます。",
    UNSUPPORTED_FILE: "未対応のファイル形式です。",
    EXCEL_PARSE_FAILED:
      "提供されたデータを読み取れませんでした",
    RATE_LIMITED:
      "リクエストが多すぎます。しばらくしてからお試しください。",
    UPSTREAM_FAILURE: "分析プロバイダーのエラーです。再試行してください。",
    BAD_OUTPUT_FORMAT: "分析出力が無効でした。",
    SERVER_ERROR: "サーバーエラーです。再試行してください。",
    CONFIG_ERROR: "サーバー設定エラーです。",
    GATE_REQUIRED: "認証が必要です。",
    FORBIDDEN: "アクセスが拒否されました。",

    NO_ENTITLEMENT: "無料トライアルは終了しました。",

    // ✅ Added
    TRIAL_ENDED: "無料トライアルは終了しました。",
    SUBSCRIBE_TO_CONTINUE:
      "月額£4.99で購読して分析を続けられます。",
    TRIAL_OR_SUBSCRIBE:
      "無料トライアルで開始するか、いつでも購読できます。",
  },

  ko: {
    INVALID_JSON: "요청 형식이 올바르지 않습니다.",
    INVALID_FORMDATA: "폼 제출이 올바르지 않습니다.",
    EMPTY_INPUT: "데이터를 붙여넣거나 업로드해 주세요.",
    INPUT_TOO_LARGE: "입력이 너무 큽니다.",
    UPLOAD_TOO_LARGE: "업로드한 파일이 너무 큽니다.",
    UNSUPPORTED_FILE: "지원되지 않는 파일 형식입니다.",
    EXCEL_PARSE_FAILED: "제공된 데이터를 읽을 수 없습니다.",
    RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    UPSTREAM_FAILURE: "분석 제공자 오류입니다. 다시 시도해 주세요.",
    BAD_OUTPUT_FORMAT: "분석 출력 형식이 올바르지 않습니다.",
    SERVER_ERROR: "서버 오류입니다. 다시 시도해 주세요.",
    CONFIG_ERROR: "서버 설정 오류입니다.",
    GATE_REQUIRED: "인증이 필요합니다.",
    FORBIDDEN: "접근이 거부되었습니다.",

    NO_ENTITLEMENT: "무료 체험이 종료되었습니다.",

    // ✅ Added
    TRIAL_ENDED: "무료 체험이 종료되었습니다.",
    SUBSCRIBE_TO_CONTINUE:
      "계속 분석하려면 월 £4.99로 구독하세요.",
    TRIAL_OR_SUBSCRIBE:
      "무료 체험으로 시작하거나 언제든지 구독할 수 있습니다.",
  },

  zh: {
    INVALID_JSON: "请求格式无效。",
    INVALID_FORMDATA: "表单提交无效。",
    EMPTY_INPUT: "请粘贴或上传一些数据。",
    INPUT_TOO_LARGE: "输入内容过大。",
    UPLOAD_TOO_LARGE: "上传的文件过大。",
    UNSUPPORTED_FILE: "不支持的文件类型。",
    EXCEL_PARSE_FAILED: "无法读取提供的数据。",
    RATE_LIMITED: "请求过多，请稍后重试。",
    UPSTREAM_FAILURE: "分析服务提供方出错，请重试。",
    BAD_OUTPUT_FORMAT: "分析输出无效。",
    SERVER_ERROR: "服务器错误，请重试。",
    CONFIG_ERROR: "服务器配置错误。",
    GATE_REQUIRED: "需要授权。",
    FORBIDDEN: "禁止访问。",

    NO_ENTITLEMENT: "您的免费试用已结束。",

    // ✅ Added
    TRIAL_ENDED: "您的免费试用已结束。",
    SUBSCRIBE_TO_CONTINUE: "订阅每月£4.99以继续分析。",
    TRIAL_OR_SUBSCRIBE: "您可以先免费试用，也可以随时订阅。",
  },
};

export function normalizeLang(lang: string | null | undefined): SupportedLang {
  const s = String(lang ?? "")
    .trim()
    .toLowerCase()
    .split(",")[0]
    ?.split(";")[0]
    ?.split("-")[0]
    ?.trim();

  const supported = new Set<SupportedLang>([
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
  ]);

  return (supported.has(s as SupportedLang) ? (s as SupportedLang) : "en");
}

export function getApiErrorMessage(lang: string, code: ApiErrorCode): string {
  const L = normalizeLang(lang);
  return (
    API_ERROR_MESSAGES[L]?.[code] ??
    API_ERROR_MESSAGES.en[code] ??
    "Server error. Please try again."
  );
}
