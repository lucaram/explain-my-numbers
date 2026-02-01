// src/lib/i18n/errorsAndMessages.ts

export const I18N_MESSAGES = {
  en: {
    RATE_LIMITED: "Too many requests. Give it a minute, then try again.",
    INVALID_JSON: "Request format error. Refresh the page and try again.",
    EMPTY_INPUT: "Please paste or upload some numbers.",
    UPSTREAM_FAILURE: "Analysis provider is temporarily unavailable. Try again in a moment.",
    BAD_OUTPUT_FORMAT: "Output formatting failed. Try again (or simplify the input).",
    GATE_REQUIRED: "Security check failed. Please retry.",

    FREE_TRIAL_USED_NOTE: "Free trial already used for this email. Please subscribe to continue.",
    FREE_TRIAL_USED_BLOCK: "Free trial already used — subscription required after the trial period.",
    TRIAL_STARTED: "Trial started. You can continue.",

    MAGIC_LINK_FAILED: "Could not send magic link. Please try again.",
    MAGIC_LINK_TRIAL_SENT: "Magic link sent. Check your email to start your 7-day trial.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Magic link sent. Check your email to continue to checkout.",
    MAGIC_LINK_UNEXPECTED: "Something went wrong. Please try again later.",

    // ✅ NEW: translated “login mode” success sentences
    MAGIC_LINK_TRIAL_LOGIN_SENT: "Magic link sent — this will log you into your existing trial.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Already subscribed — we emailed you a sign-in link. Use Manage to edit billing.",

    INVALID_EMAIL: "Enter a valid email address.",

    MAGIC_EMAIL_HELP: "Enter your email to receive a secure sign-in link.",

    // ✅ NEW: access/recovery sentence
    ACCESS_RECOVER_NOTE:
      "Your access is tied to your email, not your device. Recover anytime.",
  },

  it: {
    RATE_LIMITED: "Troppe richieste. Attendi un minuto e riprova.",
    INVALID_JSON: "Formato della richiesta non valido. Ricarica la pagina e riprova.",
    EMPTY_INPUT: "Incolla o carica dei dati numerici.",
    UPSTREAM_FAILURE: "Il servizio di analisi non è disponibile al momento. Riprova tra poco.",
    BAD_OUTPUT_FORMAT: "Errore di formattazione dell’output. Riprova o semplifica i dati.",
    GATE_REQUIRED: "Controllo di sicurezza non riuscito. Riprova.",

    FREE_TRIAL_USED_NOTE:
      "La prova gratuita è già stata utilizzata per questa email. Abbonati per continuare.",
    FREE_TRIAL_USED_BLOCK: "Prova gratuita già utilizzata — è richiesto un abbonamento.",
    TRIAL_STARTED: "Prova avviata. Puoi continuare.",

    MAGIC_LINK_FAILED: "Impossibile inviare il link. Riprova.",
    MAGIC_LINK_TRIAL_SENT: "Link inviato. Controlla l’email per iniziare la prova di 7 giorni.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Link inviato. Controlla l’email per procedere al pagamento.",
    MAGIC_LINK_UNEXPECTED: "Qualcosa è andato storto. Riprova più tardi.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link inviato — ti farà accedere alla tua prova già attiva.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Sei già abbonato — ti abbiamo inviato un link di accesso. Usa Gestisci per modificare la fatturazione.",

    INVALID_EMAIL: "Inserisci un indirizzo email valido.",

    MAGIC_EMAIL_HELP: "Inserisci la tua email per ricevere un link di accesso sicuro.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Il tuo accesso è legato alla tua email, non al dispositivo. Recuperalo in qualsiasi momento.",
  },

  fr: {
    RATE_LIMITED: "Trop de requêtes. Attendez une minute puis réessayez.",
    INVALID_JSON: "Format de requête invalide. Actualisez la page et réessayez.",
    EMPTY_INPUT: "Veuillez coller ou importer des données numériques.",
    UPSTREAM_FAILURE: "Le service d’analyse est temporairement indisponible.",
    BAD_OUTPUT_FORMAT: "Échec du formatage de la sortie. Réessayez.",
    GATE_REQUIRED: "Échec du contrôle de sécurité. Veuillez réessayer.",

    FREE_TRIAL_USED_NOTE: "L’essai gratuit a déjà été utilisé pour cette adresse email.",
    FREE_TRIAL_USED_BLOCK: "Essai gratuit déjà utilisé — abonnement requis.",
    TRIAL_STARTED: "Essai démarré. Vous pouvez continuer.",

    MAGIC_LINK_FAILED: "Impossible d’envoyer le lien.",
    MAGIC_LINK_TRIAL_SENT: "Lien envoyé. Vérifiez votre email pour commencer l’essai.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Lien envoyé. Vérifiez votre email pour continuer le paiement.",
    MAGIC_LINK_UNEXPECTED: "Une erreur s’est produite. Veuillez réessayer plus tard.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Lien envoyé — il vous connectera à votre essai déjà en cours.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Déjà abonné — nous vous avons envoyé un lien de connexion. Utilisez Gérer pour modifier la facturation.",

    INVALID_EMAIL: "Veuillez saisir une adresse email valide.",

    MAGIC_EMAIL_HELP:
      "Saisissez votre adresse e-mail pour recevoir un lien de connexion sécurisé.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Votre accès est lié à votre email, pas à votre appareil. Récupérez-le à tout moment.",
  },

  es: {
    RATE_LIMITED: "Demasiadas solicitudes. Espera un minuto y vuelve a intentarlo.",
    INVALID_JSON:
      "Error en el formato de la solicitud. Recarga la página e inténtalo de nuevo.",
    EMPTY_INPUT: "Pega o carga datos numéricos.",
    UPSTREAM_FAILURE: "El servicio de análisis no está disponible temporalmente.",
    BAD_OUTPUT_FORMAT: "Error al formatear la salida. Inténtalo de nuevo.",
    GATE_REQUIRED: "Falló la verificación de seguridad. Inténtalo de nuevo.",

    FREE_TRIAL_USED_NOTE:
      "La prueba gratuita ya se ha utilizado con este correo electrónico.",
    FREE_TRIAL_USED_BLOCK: "Prueba gratuita ya utilizada — se requiere suscripción.",
    TRIAL_STARTED: "Prueba iniciada. Puedes continuar.",

    MAGIC_LINK_FAILED: "No se pudo enviar el enlace.",
    MAGIC_LINK_TRIAL_SENT: "Enlace enviado. Revisa tu correo para iniciar la prueba.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Enlace enviado. Revisa tu correo para continuar con el pago.",
    MAGIC_LINK_UNEXPECTED: "Algo salió mal. Inténtalo más tarde.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Enlace enviado — te iniciará sesión en tu prueba ya existente.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Ya estás suscrito — te enviamos un enlace de acceso. Usa Gestionar para editar la facturación.",

    INVALID_EMAIL: "Introduce una dirección de correo válida.",

    MAGIC_EMAIL_HELP:
      "Introduce tu correo electrónico para recibir un enlace de acceso seguro.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Tu acceso está vinculado a tu correo electrónico, no a tu dispositivo. Recupéralo en cualquier momento.",
  },

  de: {
    RATE_LIMITED:
      "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
    INVALID_JSON: "Ungültiges Anfrageformat. Seite neu laden und erneut versuchen.",
    EMPTY_INPUT: "Bitte fügen Sie Zahlen ein oder laden Sie Daten hoch.",
    UPSTREAM_FAILURE: "Der Analysedienst ist vorübergehend nicht verfügbar.",
    BAD_OUTPUT_FORMAT: "Ausgabeformatierung fehlgeschlagen. Bitte erneut versuchen.",
    GATE_REQUIRED: "Sicherheitsüberprüfung fehlgeschlagen. Bitte erneut versuchen.",

    FREE_TRIAL_USED_NOTE:
      "Die kostenlose Testversion wurde für diese E-Mail bereits verwendet.",
    FREE_TRIAL_USED_BLOCK: "Kostenlose Testversion bereits verwendet — Abonnement erforderlich.",
    TRIAL_STARTED: "Testversion gestartet. Sie können fortfahren.",

    MAGIC_LINK_FAILED: "Der Link konnte nicht gesendet werden.",
    MAGIC_LINK_TRIAL_SENT:
      "Link gesendet. Bitte E-Mail prüfen, um die Testversion zu starten.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Link gesendet. Bitte E-Mail prüfen, um mit dem Kauf fortzufahren.",
    MAGIC_LINK_UNEXPECTED: "Etwas ist schiefgelaufen. Bitte später erneut versuchen.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link gesendet — damit melden Sie sich in Ihrer bestehenden Testphase an.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Bereits abonniert — wir haben Ihnen einen Anmeldelink per E-Mail gesendet. Verwenden Sie Verwalten, um die Abrechnung zu bearbeiten.",

    INVALID_EMAIL: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",

    MAGIC_EMAIL_HELP:
      "Geben Sie Ihre E-Mail-Adresse ein, um einen sicheren Anmeldelink zu erhalten.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Ihr Zugriff ist an Ihre E-Mail gebunden, nicht an Ihr Gerät. Jederzeit wiederherstellbar.",
  },

  pt: {
    RATE_LIMITED: "Muitas solicitações. Aguarde um minuto e tente novamente.",
    INVALID_JSON:
      "Formato de solicitação inválido. Atualize a página e tente novamente.",
    EMPTY_INPUT: "Cole ou carregue dados numéricos.",
    UPSTREAM_FAILURE: "O serviço de análise está temporariamente indisponível.",
    BAD_OUTPUT_FORMAT: "Falha ao formatar a saída. Tente novamente.",
    GATE_REQUIRED: "Falha na verificação de segurança. Tente novamente.",

    FREE_TRIAL_USED_NOTE: "A avaliação gratuita já foi utilizada para este email.",
    FREE_TRIAL_USED_BLOCK: "Avaliação gratuita já utilizada — assinatura necessária.",
    TRIAL_STARTED: "Avaliação iniciada. Você pode continuar.",

    MAGIC_LINK_FAILED: "Não foi possível enviar o link.",
    MAGIC_LINK_TRIAL_SENT: "Link enviado. Verifique seu email para iniciar a avaliação.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Link enviado. Verifique seu email para continuar o pagamento.",
    MAGIC_LINK_UNEXPECTED: "Algo deu errado. Tente novamente mais tarde.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link enviado — isto fará login no seu teste já existente.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Já subscrito — enviámos um link de acesso por e-mail. Use Gerir para editar a faturação.",

    INVALID_EMAIL: "Digite um endereço de email válido.",

    MAGIC_EMAIL_HELP: "Digite seu e-mail para receber um link seguro de acesso.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "O seu acesso está ligado ao seu email, não ao dispositivo. Recupere a qualquer momento.",
  },

  nl: {
    RATE_LIMITED: "Te veel verzoeken. Wacht even en probeer het opnieuw.",
    INVALID_JSON: "Ongeldig aanvraagformaat. Vernieuw de pagina en probeer het opnieuw.",
    EMPTY_INPUT: "Plak of upload numerieke gegevens.",
    UPSTREAM_FAILURE: "De analyseservice is tijdelijk niet beschikbaar.",
    BAD_OUTPUT_FORMAT: "Formatteren van uitvoer mislukt. Probeer opnieuw.",
    GATE_REQUIRED: "Beveiligingscontrole mislukt. Probeer opnieuw.",

    FREE_TRIAL_USED_NOTE: "De gratis proefperiode is al gebruikt voor dit e-mailadres.",
    FREE_TRIAL_USED_BLOCK: "Gratis proefperiode al gebruikt — abonnement vereist.",
    TRIAL_STARTED: "Proefperiode gestart. U kunt doorgaan.",

    MAGIC_LINK_FAILED: "Kan de link niet verzenden.",
    MAGIC_LINK_TRIAL_SENT: "Link verzonden. Controleer uw e-mail om te starten.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Link verzonden. Controleer uw e-mail om verder te gaan.",
    MAGIC_LINK_UNEXPECTED: "Er is iets misgegaan. Probeer het later opnieuw.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link verzonden — hiermee logt u in op uw bestaande proefperiode.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Al geabonneerd — we hebben u een aanmeldlink gemaild. Gebruik Beheren om de facturering te wijzigen.",

    INVALID_EMAIL: "Voer een geldig e-mailadres in.",

    MAGIC_EMAIL_HELP:
      "Voer je e-mailadres in om een veilige aanmeldlink te ontvangen.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Je toegang is gekoppeld aan je e-mailadres, niet aan je apparaat. Herstel op elk moment.",
  },

  sv: {
    RATE_LIMITED: "För många förfrågningar. Vänta en minut och försök igen.",
    INVALID_JSON: "Felaktigt begäranformat. Uppdatera sidan och försök igen.",
    EMPTY_INPUT: "Klistra in eller ladda upp numeriska data.",
    UPSTREAM_FAILURE: "Analystjänsten är tillfälligt otillgänglig.",
    BAD_OUTPUT_FORMAT: "Utdataformatering misslyckades. Försök igen.",
    GATE_REQUIRED: "Säkerhetskontrollen misslyckades. Försök igen.",

    FREE_TRIAL_USED_NOTE: "Den kostnadsfria provperioden har redan använts för denna e-post.",
    FREE_TRIAL_USED_BLOCK: "Gratis provperiod redan använd — prenumeration krävs.",
    TRIAL_STARTED: "Provperiod startad. Du kan fortsätta.",

    MAGIC_LINK_FAILED: "Det gick inte att skicka länken.",
    MAGIC_LINK_TRIAL_SENT:
      "Länk skickad. Kontrollera din e-post för att starta provperioden.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Länk skickad. Kontrollera din e-post för att fortsätta till betalning.",
    MAGIC_LINK_UNEXPECTED: "Något gick fel. Försök igen senare.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Länk skickad — detta loggar in dig på din befintliga provperiod.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Redan prenumerant — vi mejlade en inloggningslänk. Använd Hantera för att ändra fakturering.",

    INVALID_EMAIL: "Ange en giltig e-postadress.",

    MAGIC_EMAIL_HELP:
      "Ange din e-postadress för att få en säker inloggningslänk.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Din åtkomst är kopplad till din e-post, inte din enhet. Återställ när som helst.",
  },

  no: {
    RATE_LIMITED: "For mange forespørsler. Vent et minutt og prøv igjen.",
    INVALID_JSON: "Ugyldig forespørselsformat. Oppdater siden og prøv igjen.",
    EMPTY_INPUT: "Lim inn eller last opp numeriske data.",
    UPSTREAM_FAILURE: "Analysetjenesten er midlertidig utilgjengelig.",
    BAD_OUTPUT_FORMAT: "Formatering av utdata mislyktes. Prøv igjen.",
    GATE_REQUIRED: "Sikkerhetskontroll mislyktes. Prøv igjen.",

    FREE_TRIAL_USED_NOTE: "Gratis prøveperiode er allerede brukt for denne e-posten.",
    FREE_TRIAL_USED_BLOCK: "Gratis prøveperiode allerede brukt — abonnement kreves.",
    TRIAL_STARTED: "Prøveperiode startet. Du kan fortsette.",

    MAGIC_LINK_FAILED: "Kunne ikke sende lenken.",
    MAGIC_LINK_TRIAL_SENT: "Lenke sendt. Sjekk e-posten din for å starte prøveperioden.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Lenke sendt. Sjekk e-posten din for å fortsette til betaling.",
    MAGIC_LINK_UNEXPECTED: "Noe gikk galt. Prøv igjen senere.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Lenke sendt — dette logger deg inn i din eksisterende prøveperiode.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Allerede abonnert — vi sendte deg en innloggingslenke på e-post. Bruk Administrer for å endre fakturering.",

    INVALID_EMAIL: "Oppgi en gyldig e-postadresse.",

    MAGIC_EMAIL_HELP:
      "Skriv inn e-posten din for å motta en sikker påloggingslenke.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Tilgangen din er knyttet til e-posten din, ikke enheten din. Gjenopprett når som helst.",
  },

  da: {
    RATE_LIMITED: "For mange forespørgsler. Vent et minut og prøv igen.",
    INVALID_JSON: "Ugyldigt anmodningsformat. Opdater siden og prøv igen.",
    EMPTY_INPUT: "Indsæt eller upload numeriske data.",
    UPSTREAM_FAILURE: "Analysetjenesten er midlertidigt utilgængelig.",
    BAD_OUTPUT_FORMAT: "Formatering af output mislykkedes. Prøv igen.",
    GATE_REQUIRED: "Sikkerhedskontrol mislykkedes. Prøv igen.",

    FREE_TRIAL_USED_NOTE: "Den gratis prøveperiode er allerede brugt for denne e-mail.",
    FREE_TRIAL_USED_BLOCK: "Gratis prøveperiode allerede brugt — abonnement påkrævet.",
    TRIAL_STARTED: "Prøveperiode startet. Du kan fortsætte.",

    MAGIC_LINK_FAILED: "Kunne ikke sende linket.",
    MAGIC_LINK_TRIAL_SENT: "Link sendt. Tjek din e-mail for at starte prøveperioden.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Link sendt. Tjek din e-mail for at fortsætte til betaling.",
    MAGIC_LINK_UNEXPECTED: "Noget gik galt. Prøv igen senere.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link sendt — dette logger dig ind på din eksisterende prøveperiode.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Allerede abonnent — vi har sendt dig et login-link via e-mail. Brug Administrér til at ændre fakturering.",

    INVALID_EMAIL: "Indtast en gyldig e-mailadresse.",

    MAGIC_EMAIL_HELP: "Indtast din e-mail for at modtage et sikkert login-link.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Din adgang er knyttet til din e-mail, ikke din enhed. Gendan når som helst.",
  },

  fi: {
    RATE_LIMITED: "Liian monta pyyntöä. Odota hetki ja yritä uudelleen.",
    INVALID_JSON: "Virheellinen pyyntömuoto. Päivitä sivu ja yritä uudelleen.",
    EMPTY_INPUT: "Liitä tai lataa numeerisia tietoja.",
    UPSTREAM_FAILURE: "Analyysipalvelu ei ole tilapäisesti käytettävissä.",
    BAD_OUTPUT_FORMAT: "Tulosteen muotoilu epäonnistui. Yritä uudelleen.",
    GATE_REQUIRED: "Tietoturvatarkistus epäonnistui. Yritä uudelleen.",

    FREE_TRIAL_USED_NOTE: "Ilmainen kokeilujakso on jo käytetty tälle sähköpostille.",
    FREE_TRIAL_USED_BLOCK: "Ilmainen kokeilujakso jo käytetty — tilaus vaaditaan.",
    TRIAL_STARTED: "Kokeilujakso aloitettu. Voit jatkaa.",

    MAGIC_LINK_FAILED: "Linkkiä ei voitu lähettää.",
    MAGIC_LINK_TRIAL_SENT: "Linkki lähetetty. Tarkista sähköposti aloittaaksesi kokeilun.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Linkki lähetetty. Tarkista sähköposti jatkaaksesi maksua.",
    MAGIC_LINK_UNEXPECTED: "Jotain meni pieleen. Yritä myöhemmin uudelleen.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Linkki lähetetty — se kirjaa sinut sisään olemassa olevaan kokeilujaksoosi.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Olet jo tilaaja — lähetimme sinulle kirjautumislinkin sähköpostitse. Käytä Hallitse muokataksesi laskutusta.",

    INVALID_EMAIL: "Anna kelvollinen sähköpostiosoite.",

    MAGIC_EMAIL_HELP:
      "Syötä sähköpostiosoitteesi saadaksesi suojatun kirjautumislinkin.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Pääsysi on sidottu sähköpostiisi, ei laitteeseesi. Palauta milloin tahansa.",
  },

  pl: {
    RATE_LIMITED: "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.",
    INVALID_JSON: "Nieprawidłowy format żądania. Odśwież stronę i spróbuj ponownie.",
    EMPTY_INPUT: "Wklej lub prześlij dane liczbowe.",
    UPSTREAM_FAILURE: "Usługa analizy jest tymczasowo niedostępna.",
    BAD_OUTPUT_FORMAT: "Błąd formatowania danych wyjściowych. Spróbuj ponownie.",
    GATE_REQUIRED: "Błąd weryfikacji bezpieczeństwa. Spróbuj ponownie.",

    FREE_TRIAL_USED_NOTE:
      "Bezpłatny okres próbny został już wykorzystany dla tego adresu e-mail.",
    FREE_TRIAL_USED_BLOCK:
      "Bezpłatny okres próbny już wykorzystany — wymagana subskrypcja.",
    TRIAL_STARTED: "Okres próbny rozpoczęty. Możesz kontynuować.",

    MAGIC_LINK_FAILED: "Nie udało się wysłać linku.",
    MAGIC_LINK_TRIAL_SENT: "Link wysłany. Sprawdź e-mail, aby rozpocząć okres próbny.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Link wysłany. Sprawdź e-mail, aby przejść do płatności.",
    MAGIC_LINK_UNEXPECTED: "Coś poszło nie tak. Spróbuj ponownie później.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link wysłany — zaloguje Cię do Twojego istniejącego okresu próbnego.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Masz już subskrypcję — wysłaliśmy link logowania e-mailem. Użyj Zarządzaj, aby edytować rozliczenia.",

    INVALID_EMAIL: "Wprowadź poprawny adres e-mail.",

    MAGIC_EMAIL_HELP:
      "Wpisz swój adres e-mail, aby otrzymać bezpieczny link logowania.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Twój dostęp jest powiązany z Twoim e-mailem, a nie z urządzeniem. Odzyskaj go w dowolnym momencie.",
  },

  tr: {
    RATE_LIMITED: "Çok fazla istek. Bir dakika bekleyip tekrar deneyin.",
    INVALID_JSON: "Geçersiz istek biçimi. Sayfayı yenileyip tekrar deneyin.",
    EMPTY_INPUT: "Sayısal verileri yapıştırın veya yükleyin.",
    UPSTREAM_FAILURE: "Analiz hizmeti geçici olarak kullanılamıyor.",
    BAD_OUTPUT_FORMAT: "Çıktı biçimlendirme başarısız oldu. Tekrar deneyin.",
    GATE_REQUIRED: "Güvenlik kontrolü başarısız oldu. Tekrar deneyin.",

    FREE_TRIAL_USED_NOTE: "Ücretsiz deneme bu e-posta için zaten kullanıldı.",
    FREE_TRIAL_USED_BLOCK: "Ücretsiz deneme zaten kullanıldı — abonelik gerekli.",
    TRIAL_STARTED: "Deneme başladı. Devam edebilirsiniz.",

    MAGIC_LINK_FAILED: "Bağlantı gönderilemedi.",
    MAGIC_LINK_TRIAL_SENT:
      "Bağlantı gönderildi. Denemeyi başlatmak için e-postanızı kontrol edin.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Bağlantı gönderildi. Ödemeye devam etmek için e-postanızı kontrol edin.",
    MAGIC_LINK_UNEXPECTED: "Bir şeyler ters gitti. Daha sonra tekrar deneyin.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Bağlantı gönderildi — mevcut denemenize giriş yapmanızı sağlayacak.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Zaten abonesiniz — size bir giriş bağlantısı e-postaladık. Faturalamayı düzenlemek için Yönet’i kullanın.",

    INVALID_EMAIL: "Geçerli bir e-posta adresi girin.",

    MAGIC_EMAIL_HELP: "Güvenli bir giriş bağlantısı almak için e-postanızı girin.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Erişiminiz cihazınıza değil, e-postanıza bağlıdır. İstediğiniz zaman geri alabilirsiniz.",
  },

  el: {
    RATE_LIMITED: "Πάρα πολλά αιτήματα. Περιμένετε ένα λεπτό και δοκιμάστε ξανά.",
    INVALID_JSON: "Μη έγκυρη μορφή αιτήματος. Ανανεώστε τη σελίδα και δοκιμάστε ξανά.",
    EMPTY_INPUT: "Επικολλήστε ή ανεβάστε αριθμητικά δεδομένα.",
    UPSTREAM_FAILURE: "Η υπηρεσία ανάλυσης δεν είναι προσωρινά διαθέσιμη.",
    BAD_OUTPUT_FORMAT: "Αποτυχία μορφοποίησης εξόδου. Δοκιμάστε ξανά.",
    GATE_REQUIRED: "Αποτυχία ελέγχου ασφαλείας. Δοκιμάστε ξανά.",

    FREE_TRIAL_USED_NOTE: "Η δωρεάν δοκιμή έχει ήδη χρησιμοποιηθεί για αυτό το email.",
    FREE_TRIAL_USED_BLOCK: "Η δωρεάν δοκιμή έχει ήδη χρησιμοποιηθεί — απαιτείται συνδρομή.",
    TRIAL_STARTED: "Η δοκιμή ξεκίνησε. Μπορείτε να συνεχίσετε.",

    MAGIC_LINK_FAILED: "Δεν ήταν δυνατή η αποστολή του συνδέσμου.",
    MAGIC_LINK_TRIAL_SENT:
      "Ο σύνδεσμος στάλθηκε. Ελέγξτε το email σας για να ξεκινήσετε τη δοκιμή.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Ο σύνδεσμος στάλθηκε. Ελέγξτε το email σας για να συνεχίσετε την πληρωμή.",
    MAGIC_LINK_UNEXPECTED: "Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Ο σύνδεσμος στάλθηκε — θα σας συνδέσει στη δοκιμή που έχετε ήδη.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Είστε ήδη συνδρομητής — σας στείλαμε σύνδεσμο σύνδεσης με email. Χρησιμοποιήστε το Διαχείριση για να επεξεργαστείτε τη χρέωση.",

    INVALID_EMAIL: "Εισαγάγετε μια έγκυρη διεύθυνση email.",

    MAGIC_EMAIL_HELP:
      "Εισαγάγετε το email σας για να λάβετε έναν ασφαλή σύνδεσμο σύνδεσης.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Η πρόσβασή σας συνδέεται με το email σας, όχι με τη συσκευή σας. Ανακτήστε την οποιαδήποτε στιγμή.",
  },

  cs: {
    RATE_LIMITED: "Příliš mnoho požadavků. Počkejte chvíli a zkuste to znovu.",
    INVALID_JSON: "Neplatný formát požadavku. Obnovte stránku a zkuste to znovu.",
    EMPTY_INPUT: "Vložte nebo nahrajte číselná data.",
    UPSTREAM_FAILURE: "Analytická služba je dočasně nedostupná.",
    BAD_OUTPUT_FORMAT: "Formátování výstupu selhalo. Zkuste to znovu.",
    GATE_REQUIRED: "Bezpečnostní kontrola selhala. Zkuste to znovu.",

    FREE_TRIAL_USED_NOTE: "Bezplatná zkušební verze již byla použita pro tento e-mail.",
    FREE_TRIAL_USED_BLOCK:
      "Bezplatná zkušební verze již použita — vyžaduje se předplatné.",
    TRIAL_STARTED: "Zkušební verze zahájena. Můžete pokračovat.",

    MAGIC_LINK_FAILED: "Nepodařilo se odeslat odkaz.",
    MAGIC_LINK_TRIAL_SENT:
      "Odkaz odeslán. Zkontrolujte e-mail pro zahájení zkušební verze.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Odkaz odeslán. Zkontrolujte e-mail pro pokračování k platbě.",
    MAGIC_LINK_UNEXPECTED: "Něco se pokazilo. Zkuste to později.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Odkaz odeslán — přihlásí vás do vaší stávající zkušební verze.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Již máte předplatné — poslali jsme vám přihlašovací odkaz e-mailem. Použijte Spravovat pro úpravu fakturace.",

    INVALID_EMAIL: "Zadejte platnou e-mailovou adresu.",

    MAGIC_EMAIL_HELP: "Zadejte svůj e-mail a obdržíte bezpečný přihlašovací odkaz.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Váš přístup je vázán na váš e-mail, ne na zařízení. Obnovit můžete kdykoli.",
  },

  hu: {
    RATE_LIMITED: "Túl sok kérés. Várjon egy percet, majd próbálja újra.",
    INVALID_JSON: "Érvénytelen kérésformátum. Frissítse az oldalt és próbálja újra.",
    EMPTY_INPUT: "Illesszen be vagy töltsön fel numerikus adatokat.",
    UPSTREAM_FAILURE: "Az elemző szolgáltatás átmenetileg nem elérhető.",
    BAD_OUTPUT_FORMAT: "A kimenet formázása sikertelen. Próbálja újra.",
    GATE_REQUIRED: "A biztonsági ellenőrzés sikertelen. Próbálja újra.",

    FREE_TRIAL_USED_NOTE: "Az ingyenes próba már fel lett használva ehhez az e-mailhez.",
    FREE_TRIAL_USED_BLOCK: "Az ingyenes próba már felhasználva — előfizetés szükséges.",
    TRIAL_STARTED: "A próba elindult. Folytathatja.",

    MAGIC_LINK_FAILED: "Nem sikerült elküldeni a hivatkozást.",
    MAGIC_LINK_TRIAL_SENT:
      "Hivatkozás elküldve. Ellenőrizze az e-mailt a próba indításához.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Hivatkozás elküldve. Ellenőrizze az e-mailt a fizetés folytatásához.",
    MAGIC_LINK_UNEXPECTED: "Valami hiba történt. Próbálja később újra.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link elküldve — ezzel bejelentkezik a meglévő próbaidőszakába.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Már előfizető — e-mailben elküldtük a bejelentkezési linket. A számlázás módosításához használja a Kezelés opciót.",

    INVALID_EMAIL: "Adjon meg egy érvényes e-mail címet.",

    MAGIC_EMAIL_HELP:
      "Adja meg az e-mail címét, hogy biztonságos bejelentkezési linket kapjon.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "A hozzáférésed az e-mail címedhez kötődik, nem az eszközödhöz. Bármikor visszaállítható.",
  },

  ro: {
    RATE_LIMITED: "Prea multe cereri. Așteptați un minut și încercați din nou.",
    INVALID_JSON: "Format de cerere invalid. Reîmprospătați pagina și încercați din nou.",
    EMPTY_INPUT: "Lipiți sau încărcați date numerice.",
    UPSTREAM_FAILURE: "Serviciul de analiză este temporar indisponibil.",
    BAD_OUTPUT_FORMAT: "Formatarea ieșirii a eșuat. Încercați din nou.",
    GATE_REQUIRED: "Verificarea de securitate a eșuat. Încercați din nou.",

    FREE_TRIAL_USED_NOTE:
      "Perioada de probă gratuită a fost deja utilizată pentru acest email.",
    FREE_TRIAL_USED_BLOCK: "Perioada de probă deja utilizată — este necesar un abonament.",
    TRIAL_STARTED: "Perioada de probă a început. Puteți continua.",

    MAGIC_LINK_FAILED: "Nu s-a putut trimite linkul.",
    MAGIC_LINK_TRIAL_SENT:
      "Link trimis. Verificați emailul pentru a începe perioada de probă.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Link trimis. Verificați emailul pentru a continua plata.",
    MAGIC_LINK_UNEXPECTED: "Ceva nu a funcționat. Încercați mai târziu.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Link trimis — te va autentifica în perioada ta de probă existentă.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Ești deja abonat — ți-am trimis un link de autentificare pe email. Folosește Manage pentru a edita facturarea.",

    INVALID_EMAIL: "Introduceți o adresă de email validă.",

    MAGIC_EMAIL_HELP:
      "Introduceți adresa de email pentru a primi un link de autentificare securizat.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Accesul tău este legat de emailul tău, nu de dispozitiv. Îl poți recupera oricând.",
  },

  uk: {
    RATE_LIMITED: "Занадто багато запитів. Зачекайте хвилину та спробуйте знову.",
    INVALID_JSON: "Невірний формат запиту. Оновіть сторінку та спробуйте знову.",
    EMPTY_INPUT: "Вставте або завантажте числові дані.",
    UPSTREAM_FAILURE: "Служба аналізу тимчасово недоступна.",
    BAD_OUTPUT_FORMAT: "Не вдалося відформатувати результат. Спробуйте ще раз.",
    GATE_REQUIRED: "Помилка перевірки безпеки. Спробуйте знову.",

    FREE_TRIAL_USED_NOTE:
      "Безкоштовний пробний період вже використано для цієї електронної пошти.",
    FREE_TRIAL_USED_BLOCK: "Безкоштовний пробний період уже використано — потрібна підписка.",
    TRIAL_STARTED: "Пробний період розпочато. Ви можете продовжити.",

    MAGIC_LINK_FAILED: "Не вдалося надіслати посилання.",
    MAGIC_LINK_TRIAL_SENT:
      "Посилання надіслано. Перевірте пошту, щоб розпочати пробний період.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Посилання надіслано. Перевірте пошту, щоб продовжити оплату.",
    MAGIC_LINK_UNEXPECTED: "Щось пішло не так. Спробуйте пізніше.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Посилання надіслано — воно увійде вас у вашу існуючу пробну версію.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Ви вже підписані — ми надіслали вам посилання для входу на email. Використайте Manage, щоб змінити оплату.",

    INVALID_EMAIL: "Введіть дійсну адресу електронної пошти.",

    MAGIC_EMAIL_HELP:
      "Введіть свою електронну пошту, щоб отримати безпечне посилання для входу.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Ваш доступ прив’язаний до вашої електронної пошти, а не до пристрою. Відновлюйте будь-коли.",
  },

  ru: {
    RATE_LIMITED: "Слишком много запросов. Подождите минуту и попробуйте снова.",
    INVALID_JSON: "Неверный формат запроса. Обновите страницу и попробуйте снова.",
    EMPTY_INPUT: "Вставьте или загрузите числовые данные.",
    UPSTREAM_FAILURE: "Служба анализа временно недоступна.",
    BAD_OUTPUT_FORMAT: "Ошибка форматирования результата. Попробуйте снова.",
    GATE_REQUIRED: "Ошибка проверки безопасности. Попробуйте снова.",

    FREE_TRIAL_USED_NOTE: "Бесплатный пробный период уже использован для этого email.",
    FREE_TRIAL_USED_BLOCK: "Бесплатный пробный период уже использован — требуется подписка.",
    TRIAL_STARTED: "Пробный период начат. Вы можете продолжить.",

    MAGIC_LINK_FAILED: "Не удалось отправить ссылку.",
    MAGIC_LINK_TRIAL_SENT:
      "Ссылка отправлена. Проверьте почту, чтобы начать пробный период.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "Ссылка отправлена. Проверьте почту, чтобы продолжить оплату.",
    MAGIC_LINK_UNEXPECTED: "Что-то пошло не так. Попробуйте позже.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Ссылка отправлена — она выполнит вход в ваш уже существующий пробный период.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Вы уже подписаны — мы отправили вам ссылку для входа. Используйте Manage, чтобы изменить параметры оплаты.",

    INVALID_EMAIL: "Введите корректный адрес электронной почты.",

    MAGIC_EMAIL_HELP:
      "Введите вашу почту, чтобы получить безопасную ссылку для входа.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Ваш доступ привязан к вашей почте, а не к устройству. Восстановить можно в любое время.",
  },

  ar: {
    RATE_LIMITED: "طلبات كثيرة جدًا. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.",
    INVALID_JSON: "تنسيق الطلب غير صالح. حدّث الصفحة وحاول مرة أخرى.",
    EMPTY_INPUT: "يرجى لصق أو تحميل بيانات رقمية.",
    UPSTREAM_FAILURE: "خدمة التحليل غير متاحة مؤقتًا.",
    BAD_OUTPUT_FORMAT: "فشل تنسيق الإخراج. حاول مرة أخرى.",
    GATE_REQUIRED: "فشل التحقق الأمني. حاول مرة أخرى.",

    FREE_TRIAL_USED_NOTE: "تم استخدام الفترة التجريبية المجانية بالفعل لهذا البريد الإلكتروني.",
    FREE_TRIAL_USED_BLOCK: "تم استخدام الفترة التجريبية المجانية — الاشتراك مطلوب.",
    TRIAL_STARTED: "بدأت الفترة التجريبية. يمكنك المتابعة.",

    MAGIC_LINK_FAILED: "تعذر إرسال الرابط.",
    MAGIC_LINK_TRIAL_SENT:
      "تم إرسال الرابط. تحقق من بريدك الإلكتروني لبدء الفترة التجريبية.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "تم إرسال الرابط. تحقق من بريدك الإلكتروني للمتابعة إلى الدفع.",
    MAGIC_LINK_UNEXPECTED: "حدث خطأ ما. يرجى المحاولة لاحقًا.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "تم إرسال الرابط — سيقوم بتسجيل دخولك إلى تجربتك الحالية.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "أنت مشترك بالفعل — أرسلنا لك رابط تسجيل دخول عبر البريد الإلكتروني. استخدم Manage لتعديل الفوترة.",

    INVALID_EMAIL: "أدخل عنوان بريد إلكتروني صالحًا.",

    MAGIC_EMAIL_HELP: "أدخل بريدك الإلكتروني لتلقي رابط تسجيل دخول آمن.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "وصولك مرتبط ببريدك الإلكتروني، وليس بجهازك. يمكنك الاستعادة في أي وقت.",
  },

  he: {
    RATE_LIMITED: "יותר מדי בקשות. אנא המתן דקה ונסה שוב.",
    INVALID_JSON: "פורמט בקשה לא תקין. רענן את הדף ונסה שוב.",
    EMPTY_INPUT: "אנא הדבק או העלה נתונים מספריים.",
    UPSTREAM_FAILURE: "שירות הניתוח אינו זמין זמנית.",
    BAD_OUTPUT_FORMAT: "עיצוב הפלט נכשל. נסה שוב.",
    GATE_REQUIRED: "בדיקת האבטחה נכשלה. נסה שוב.",

    FREE_TRIAL_USED_NOTE: "תקופת הניסיון החינמית כבר נוצלה עבור אימייל זה.",
    FREE_TRIAL_USED_BLOCK: "תקופת הניסיון כבר נוצלה — נדרש מנוי.",
    TRIAL_STARTED: "הניסיון התחיל. ניתן להמשיך.",

    MAGIC_LINK_FAILED: "לא ניתן לשלוח את הקישור.",
    MAGIC_LINK_TRIAL_SENT:
      "הקישור נשלח. בדוק את האימייל כדי להתחיל את תקופת הניסיון.",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "הקישור נשלח. בדוק את האימייל כדי להמשיך לתשלום.",
    MAGIC_LINK_UNEXPECTED: "משהו השתבש. נסה שוב מאוחר יותר.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "הקישור נשלח — הוא יחבר אותך לתקופת הניסיון הקיימת שלך.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "כבר יש לך מנוי — שלחנו לך קישור התחברות באימייל. השתמש ב-Manage כדי לערוך חיוב.",

    INVALID_EMAIL: "הזן כתובת אימייל תקינה.",

    MAGIC_EMAIL_HELP: "הזן את כתובת האימייל שלך כדי לקבל קישור כניסה מאובטח.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "הגישה שלך קשורה לאימייל שלך, לא למכשיר. ניתן לשחזר בכל עת.",
  },

  hi: {
    RATE_LIMITED: "बहुत अधिक अनुरोध। एक मिनट रुकें और फिर से प्रयास करें।",
    INVALID_JSON: "अनुरोध का प्रारूप अमान्य है। पृष्ठ को रीफ़्रेश करें और पुनः प्रयास करें।",
    EMPTY_INPUT: "कृपया संख्यात्मक डेटा पेस्ट करें या अपलोड करें।",
    UPSTREAM_FAILURE: "विश्लेषण सेवा अस्थायी रूप से उपलब्ध नहीं है।",
    BAD_OUTPUT_FORMAT: "आउटपुट फ़ॉर्मेटिंग विफल रही। फिर से प्रयास करें।",
    GATE_REQUIRED: "सुरक्षा जांच विफल रही। फिर से प्रयास करें।",

    FREE_TRIAL_USED_NOTE: "इस ईमेल के लिए मुफ्त परीक्षण पहले ही उपयोग किया जा चुका है।",
    FREE_TRIAL_USED_BLOCK:
      "मुफ्त परीक्षण पहले ही उपयोग किया जा चुका है — सदस्यता आवश्यक है।",
    TRIAL_STARTED: "परीक्षण शुरू हुआ। आप आगे बढ़ सकते हैं।",

    MAGIC_LINK_FAILED: "लिंक भेजा नहीं जा सका।",
    MAGIC_LINK_TRIAL_SENT: "लिंक भेज दिया गया है। परीक्षण शुरू करने के लिए ईमेल जांचें।",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "लिंक भेज दिया गया है। भुगतान जारी रखने के लिए ईमेल जांचें।",
    MAGIC_LINK_UNEXPECTED: "कुछ गलत हो गया। बाद में पुनः प्रयास करें।",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "लिंक भेज दिया गया है — यह आपको आपके मौजूदा ट्रायल में लॉग इन कर देगा।",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "आप पहले से सब्सक्राइब हैं — हमने आपको साइन-इन लिंक ईमेल किया है। बिलिंग बदलने के लिए Manage का उपयोग करें।",

    INVALID_EMAIL: "एक मान्य ईमेल पता दर्ज करें।",

    MAGIC_EMAIL_HELP:
      "सुरक्षित साइन-इन लिंक पाने के लिए अपना ईमेल दर्ज करें।",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "आपकी पहुँच आपके ईमेल से जुड़ी है, आपके डिवाइस से नहीं। कभी भी पुनः प्राप्त करें।",
  },

  bn: {
    RATE_LIMITED: "অতিরিক্ত অনুরোধ। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।",
    INVALID_JSON: "অনুরোধের ফরম্যাট সঠিক নয়। পৃষ্ঠা রিফ্রেশ করে আবার চেষ্টা করুন।",
    EMPTY_INPUT: "সংখ্যাসূচক ডেটা পেস্ট বা আপলোড করুন।",
    UPSTREAM_FAILURE: "বিশ্লেষণ সেবা সাময়িকভাবে অনুপলব্ধ।",
    BAD_OUTPUT_FORMAT: "আউটপুট ফরম্যাট করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    GATE_REQUIRED: "নিরাপত্তা যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",

    FREE_TRIAL_USED_NOTE: "এই ইমেইলের জন্য ফ্রি ট্রায়াল ইতিমধ্যেই ব্যবহৃত হয়েছে।",
    FREE_TRIAL_USED_BLOCK: "ফ্রি ট্রায়াল ইতিমধ্যেই ব্যবহৃত — সাবস্ক্রিপশন প্রয়োজন।",
    TRIAL_STARTED: "ট্রায়াল শুরু হয়েছে। আপনি এগিয়ে যেতে পারেন।",

    MAGIC_LINK_FAILED: "লিংক পাঠানো যায়নি।",
    MAGIC_LINK_TRIAL_SENT: "লিংক পাঠানো হয়েছে। ট্রায়াল শুরু করতে ইমেইল চেক করুন।",
    MAGIC_LINK_SUBSCRIBE_SENT: "লিংক পাঠানো হয়েছে। পেমেন্ট চালিয়ে যেতে ইমেইল চেক করুন।",
    MAGIC_LINK_UNEXPECTED: "কিছু ভুল হয়েছে। পরে আবার চেষ্টা করুন।",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "লিংক পাঠানো হয়েছে — এটি আপনার বিদ্যমান ট্রায়ালে লগইন করিয়ে দেবে।",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "আপনি ইতিমধ্যেই সাবস্ক্রাইব করেছেন — আমরা আপনাকে সাইন-ইন লিংক ইমেইল করেছি। বিলিং এডিট করতে Manage ব্যবহার করুন।",

    INVALID_EMAIL: "একটি বৈধ ইমেইল ঠিকানা লিখুন।",

    MAGIC_EMAIL_HELP: "নিরাপদ সাইন-ইন লিঙ্ক পেতে আপনার ইমেইল লিখুন।",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "আপনার অ্যাক্সেস আপনার ইমেইলের সাথে যুক্ত, ডিভাইসের সাথে নয়। যে কোনো সময় পুনরুদ্ধার করুন।",
  },

  ur: {
    RATE_LIMITED: "بہت زیادہ درخواستیں۔ ایک منٹ انتظار کریں اور دوبارہ کوشش کریں۔",
    INVALID_JSON: "درخواست کا فارمیٹ درست نہیں۔ صفحہ ریفریش کریں اور دوبارہ کوشش کریں۔",
    EMPTY_INPUT: "عددی ڈیٹا پیسٹ کریں یا اپ لوڈ کریں۔",
    UPSTREAM_FAILURE: "تجزیاتی سروس عارضی طور پر دستیاب نہیں ہے۔",
    BAD_OUTPUT_FORMAT: "آؤٹ پٹ کی فارمیٹنگ ناکام ہو گئی۔ دوبارہ کوشش کریں۔",
    GATE_REQUIRED: "سیکیورٹی چیک ناکام ہو گیا۔ دوبارہ کوشش کریں۔",

    FREE_TRIAL_USED_NOTE: "اس ای میل کے لیے مفت آزمائش پہلے ہی استعمال ہو چکی ہے۔",
    FREE_TRIAL_USED_BLOCK: "مفت آزمائش پہلے ہی استعمال ہو چکی ہے — سبسکرپشن درکار ہے۔",
    TRIAL_STARTED: "آزمائش شروع ہو گئی ہے۔ آپ جاری رکھ سکتے ہیں۔",

    MAGIC_LINK_FAILED: "لنک بھیجا نہیں جا سکا۔",
    MAGIC_LINK_TRIAL_SENT: "لنک بھیج دیا گیا ہے۔ آزمائش شروع کرنے کے لیے ای میل چیک کریں۔",
    MAGIC_LINK_SUBSCRIBE_SENT: "لنک بھیج دیا گیا ہے۔ ادائیگی جاری رکھنے کے لیے ای میل چیک کریں۔",
    MAGIC_LINK_UNEXPECTED: "کچھ غلط ہو گیا۔ بعد میں دوبارہ کوشش کریں۔",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "لنک بھیج دیا گیا ہے — یہ آپ کو آپ کے موجودہ ٹرائل میں لاگ اِن کر دے گا۔",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "آپ پہلے سے سبسکرائب ہیں — ہم نے آپ کو سائن اِن لنک ای میل کر دیا ہے۔ بلنگ میں تبدیلی کے لیے Manage استعمال کریں۔",

    INVALID_EMAIL: "درست ای میل پتہ درج کریں۔",

    MAGIC_EMAIL_HELP: "محفوظ سائن اِن لنک حاصل کرنے کے لیے اپنا ای میل درج کریں۔",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "آپ کی رسائی آپ کے ای میل سے منسلک ہے، ڈیوائس سے نہیں۔ کسی بھی وقت بحال کریں۔",
  },

  id: {
    RATE_LIMITED: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
    INVALID_JSON: "Format permintaan tidak valid. Muat ulang halaman dan coba lagi.",
    EMPTY_INPUT: "Tempel atau unggah data numerik.",
    UPSTREAM_FAILURE: "Layanan analisis sementara tidak tersedia.",
    BAD_OUTPUT_FORMAT: "Pemformatan output gagal. Coba lagi.",
    GATE_REQUIRED: "Pemeriksaan keamanan gagal. Coba lagi.",

    FREE_TRIAL_USED_NOTE: "Uji coba gratis sudah digunakan untuk email ini.",
    FREE_TRIAL_USED_BLOCK: "Uji coba gratis sudah digunakan — langganan diperlukan.",
    TRIAL_STARTED: "Uji coba dimulai. Anda dapat melanjutkan.",

    MAGIC_LINK_FAILED: "Tidak dapat mengirim tautan.",
    MAGIC_LINK_TRIAL_SENT: "Tautan dikirim. Periksa email untuk memulai uji coba.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Tautan dikirim. Periksa email untuk melanjutkan pembayaran.",
    MAGIC_LINK_UNEXPECTED: "Terjadi kesalahan. Silakan coba lagi nanti.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Tautan dikirim — ini akan masuk ke uji coba Anda yang sudah ada.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Sudah berlangganan — kami mengirimkan tautan masuk lewat email. Gunakan Manage untuk mengubah penagihan.",

    INVALID_EMAIL: "Masukkan alamat email yang valid.",

    MAGIC_EMAIL_HELP: "Masukkan email Anda untuk menerima tautan masuk yang aman.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Akses Anda terkait dengan email Anda, bukan perangkat Anda. Pulihkan kapan saja.",
  },

  ms: {
    RATE_LIMITED: "Terlalu banyak permintaan. Tunggu sebentar dan cuba lagi.",
    INVALID_JSON: "Format permintaan tidak sah. Muat semula halaman dan cuba lagi.",
    EMPTY_INPUT: "Tampal atau muat naik data berangka.",
    UPSTREAM_FAILURE: "Perkhidmatan analisis tidak tersedia buat sementara waktu.",
    BAD_OUTPUT_FORMAT: "Pemformatan output gagal. Cuba lagi.",
    GATE_REQUIRED: "Pemeriksaan keselamatan gagal. Cuba lagi.",

    FREE_TRIAL_USED_NOTE: "Percubaan percuma telah digunakan untuk e-mel ini.",
    FREE_TRIAL_USED_BLOCK: "Percubaan percuma telah digunakan — langganan diperlukan.",
    TRIAL_STARTED: "Percubaan bermula. Anda boleh meneruskan.",

    MAGIC_LINK_FAILED: "Tidak dapat menghantar pautan.",
    MAGIC_LINK_TRIAL_SENT: "Pautan dihantar. Semak e-mel untuk memulakan percubaan.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Pautan dihantar. Semak e-mel untuk meneruskan pembayaran.",
    MAGIC_LINK_UNEXPECTED: "Sesuatu telah berlaku. Cuba lagi kemudian.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Pautan dihantar — ini akan log masuk ke percubaan sedia ada anda.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Sudah melanggan — kami menghantar pautan log masuk melalui e-mel. Gunakan Manage untuk mengubah pengebilan.",

    INVALID_EMAIL: "Masukkan alamat e-mel yang sah.",

    MAGIC_EMAIL_HELP:
      "Masukkan e-mel anda untuk menerima pautan log masuk yang selamat.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Akses anda terikat pada e-mel anda, bukan peranti anda. Pulihkan pada bila-bila masa.",
  },

  th: {
    RATE_LIMITED: "มีคำขอมากเกินไป โปรดรอสักครู่แล้วลองใหม่อีกครั้ง",
    INVALID_JSON: "รูปแบบคำขอไม่ถูกต้อง รีเฟรชหน้าแล้วลองใหม่",
    EMPTY_INPUT: "โปรดวางหรืออัปโหลดข้อมูลตัวเลข",
    UPSTREAM_FAILURE: "บริการวิเคราะห์ไม่พร้อมใช้งานชั่วคราว",
    BAD_OUTPUT_FORMAT: "การจัดรูปแบบผลลัพธ์ล้มเหลว ลองใหม่อีกครั้ง",
    GATE_REQUIRED: "การตรวจสอบความปลอดภัยล้มเหลว โปรดลองอีกครั้ง",

    FREE_TRIAL_USED_NOTE: "การทดลองใช้ฟรีถูกใช้ไปแล้วสำหรับอีเมลนี้",
    FREE_TRIAL_USED_BLOCK: "การทดลองใช้ฟรีถูกใช้ไปแล้ว — จำเป็นต้องสมัครสมาชิก",
    TRIAL_STARTED: "เริ่มการทดลองใช้ฟรีแล้ว คุณสามารถดำเนินการต่อได้",

    MAGIC_LINK_FAILED: "ไม่สามารถส่งลิงก์ได้",
    MAGIC_LINK_TRIAL_SENT: "ส่งลิงก์แล้ว ตรวจสอบอีเมลเพื่อเริ่มทดลองใช้ฟรี",
    MAGIC_LINK_SUBSCRIBE_SENT: "ส่งลิงก์แล้ว ตรวจสอบอีเมลเพื่อดำเนินการชำระเงิน",
    MAGIC_LINK_UNEXPECTED: "เกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "ส่งลิงก์แล้ว — ลิงก์นี้จะพาคุณเข้าสู่ระบบในช่วงทดลองที่มีอยู่",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "คุณสมัครสมาชิกแล้ว — เราส่งลิงก์เข้าสู่ระบบให้ทางอีเมล ใช้ Manage เพื่อแก้ไขการเรียกเก็บเงิน",

    INVALID_EMAIL: "กรุณากรอกอีเมลที่ถูกต้อง",

    MAGIC_EMAIL_HELP: "กรอกอีเมลของคุณเพื่อรับลิงก์เข้าสู่ระบบที่ปลอดภัย",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "การเข้าถึงของคุณผูกกับอีเมล ไม่ใช่อุปกรณ์ กู้คืนได้ทุกเมื่อ",
  },

  vi: {
    RATE_LIMITED: "Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.",
    INVALID_JSON: "Định dạng yêu cầu không hợp lệ. Làm mới trang và thử lại.",
    EMPTY_INPUT: "Vui lòng dán hoặc tải lên dữ liệu số.",
    UPSTREAM_FAILURE: "Dịch vụ phân tích tạm thời không khả dụng.",
    BAD_OUTPUT_FORMAT: "Định dạng đầu ra thất bại. Vui lòng thử lại.",
    GATE_REQUIRED: "Kiểm tra bảo mật thất bại. Vui lòng thử lại.",

    FREE_TRIAL_USED_NOTE: "Bản dùng thử miễn phí đã được sử dụng cho email này.",
    FREE_TRIAL_USED_BLOCK: "Bản dùng thử đã được sử dụng — cần đăng ký.",
    TRIAL_STARTED: "Bản dùng thử đã bắt đầu. Bạn có thể tiếp tục.",

    MAGIC_LINK_FAILED: "Không thể gửi liên kết.",
    MAGIC_LINK_TRIAL_SENT: "Liên kết đã được gửi. Kiểm tra email để bắt đầu dùng thử.",
    MAGIC_LINK_SUBSCRIBE_SENT: "Liên kết đã được gửi. Kiểm tra email để tiếp tục thanh toán.",
    MAGIC_LINK_UNEXPECTED: "Đã xảy ra lỗi. Vui lòng thử lại sau.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "Liên kết đã được gửi — liên kết này sẽ đăng nhập vào bản dùng thử hiện có của bạn.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "Bạn đã đăng ký — chúng tôi đã gửi liên kết đăng nhập qua email. Dùng Manage để chỉnh sửa thanh toán.",

    INVALID_EMAIL: "Nhập địa chỉ email hợp lệ.",

    MAGIC_EMAIL_HELP: "Nhập email của bạn để nhận liên kết đăng nhập an toàn.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "Quyền truy cập của bạn gắn với email, không phải thiết bị. Khôi phục bất cứ lúc nào.",
  },

  ja: {
    RATE_LIMITED: "リクエストが多すぎます。少し待ってから再試行してください。",
    INVALID_JSON: "リクエスト形式が無効です。ページを更新して再試行してください。",
    EMPTY_INPUT: "数値データを貼り付けるかアップロードしてください。",
    UPSTREAM_FAILURE: "分析サービスは一時的に利用できません。",
    BAD_OUTPUT_FORMAT: "出力のフォーマットに失敗しました。再試行してください。",
    GATE_REQUIRED: "セキュリティチェックに失敗しました。再試行してください。",

    FREE_TRIAL_USED_NOTE: "このメールアドレスでは既に無料トライアルが使用されています。",
    FREE_TRIAL_USED_BLOCK:
      "無料トライアルは既に使用されています — サブスクリプションが必要です。",
    TRIAL_STARTED: "トライアルが開始されました。続行できます。",

    MAGIC_LINK_FAILED: "リンクを送信できませんでした。",
    MAGIC_LINK_TRIAL_SENT:
      "リンクが送信されました。メールを確認してトライアルを開始してください。",
    MAGIC_LINK_SUBSCRIBE_SENT:
      "リンクが送信されました。メールを確認して支払いを続行してください。",
    MAGIC_LINK_UNEXPECTED: "問題が発生しました。後でもう一度お試しください。",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "リンクを送信しました — 既存のトライアルにログインします。",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "すでに購読中です — サインインリンクをメールで送信しました。請求情報の編集には Manage を使用してください。",

    INVALID_EMAIL: "有効なメールアドレスを入力してください。",

    MAGIC_EMAIL_HELP:
      "安全なサインインリンクを受け取るためにメールアドレスを入力してください。",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "アクセスは端末ではなくメールアドレスに紐づきます。いつでも復元できます。",
  },

  ko: {
    RATE_LIMITED: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
    INVALID_JSON: "요청 형식이 올바르지 않습니다. 페이지를 새로고침하고 다시 시도하세요.",
    EMPTY_INPUT: "숫자 데이터를 붙여넣거나 업로드하세요.",
    UPSTREAM_FAILURE: "분석 서비스가 일시적으로 사용할 수 없습니다.",
    BAD_OUTPUT_FORMAT: "출력 형식 지정에 실패했습니다. 다시 시도하세요.",
    GATE_REQUIRED: "보안 확인에 실패했습니다. 다시 시도하세요.",

    FREE_TRIAL_USED_NOTE: "이 이메일에 대한 무료 체험이 이미 사용되었습니다.",
    FREE_TRIAL_USED_BLOCK: "무료 체험이 이미 사용됨 — 구독이 필요합니다.",
    TRIAL_STARTED: "체험이 시작되었습니다. 계속할 수 있습니다.",

    MAGIC_LINK_FAILED: "링크를 보낼 수 없습니다.",
    MAGIC_LINK_TRIAL_SENT: "링크가 전송되었습니다. 이메일을 확인하여 체험을 시작하세요.",
    MAGIC_LINK_SUBSCRIBE_SENT: "링크가 전송되었습니다. 이메일을 확인하여 결제를 진행하세요.",
    MAGIC_LINK_UNEXPECTED: "문제가 발생했습니다. 나중에 다시 시도하세요.",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "링크가 전송되었습니다 — 기존 체험에 로그인됩니다.",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "이미 구독 중입니다 — 로그인 링크를 이메일로 보냈습니다. 결제 정보를 수정하려면 Manage를 사용하세요.",

    INVALID_EMAIL: "유효한 이메일 주소를 입력하세요.",

    MAGIC_EMAIL_HELP: "안전한 로그인 링크를 받으려면 이메일을 입력하세요.",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "접근 권한은 기기가 아니라 이메일에 연결됩니다. 언제든지 복구할 수 있어요.",
  },

  zh: {
    RATE_LIMITED: "请求过多。请稍等片刻后重试。",
    INVALID_JSON: "请求格式无效。请刷新页面后重试。",
    EMPTY_INPUT: "请粘贴或上传数值数据。",
    UPSTREAM_FAILURE: "分析服务暂时不可用。",
    BAD_OUTPUT_FORMAT: "输出格式化失败。请重试。",
    GATE_REQUIRED: "安全检查失败。请重试。",

    FREE_TRIAL_USED_NOTE: "该电子邮箱的免费试用已被使用。",
    FREE_TRIAL_USED_BLOCK: "免费试用已被使用 — 需要订阅。",
    TRIAL_STARTED: "试用已开始。您可以继续。",

    MAGIC_LINK_FAILED: "无法发送链接。",
    MAGIC_LINK_TRIAL_SENT: "链接已发送。请检查邮箱以开始试用。",
    MAGIC_LINK_SUBSCRIBE_SENT: "链接已发送。请检查邮箱以继续付款。",
    MAGIC_LINK_UNEXPECTED: "出现问题。请稍后再试。",

    // ✅ NEW
    MAGIC_LINK_TRIAL_LOGIN_SENT:
      "链接已发送 — 该链接会让你登录到现有的试用中。",
    MAGIC_LINK_SUBSCRIBE_LOGIN_SENT:
      "你已订阅 — 我们已通过邮件发送登录链接。使用 Manage 来修改账单。",

    INVALID_EMAIL: "请输入有效的电子邮箱地址。",

    MAGIC_EMAIL_HELP: "请输入你的邮箱以接收安全的登录链接。",

    // ✅ NEW
    ACCESS_RECOVER_NOTE:
      "你的访问权限绑定在邮箱上，而不是设备上。随时可恢复。",
  },
};
