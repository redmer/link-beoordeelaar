export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  /* Add languages here */
  en: {
    /* Add translations here */
    DIAGNOSTICS: "Diagnostics",
    HELP_TITLE: "Help and Support",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/en",
    LANGUAGE: "English",
    DIAGNOSTICS_TITLE: "Internals",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    APP_TITLE: "Categorize",
    FINAL_TITLE: "Ready to send in",
    CHOOSE_ONE: "Choose one",
    CHOOSE_MULTIPLE: "Choose multiple",
    SUBMIT_TITLE: "Submit and next",
    SUBMIT_DESC: `Save categorization and open next link. To skip, refresh page.`,
    START: "Start",
    START_DESC: "Commence categorizing links",
    REOPEN_POPUP: "Reopen popup window",
    INTRODUCTION: `Categorize the link that has opened in the popup window
      by choosing one of the following options per row. Any answer will be saved immediately.`,
    INTRODUCTION_SESSIONLESS: `Provide a session key that refers to the
      questionnaire you want filled out.`,
    INTRODUCTION_OPENING: `Categorize the links that open in a popup window, by
      choosing one of the provided options. Select START to begin.`,
    CLOSING_REMARKS_MAIL: `Thank you for participating. Copy and send your
      results displayed below to the e-mail address displayed below that. 
      Otherwise, your response may not be recorded.`,
    NO_SUBJECTS_REMAINING_TITLE: `Session done`,
    NO_SUBJECTS_REMAINING_DESC: `Thank you for participating. Your response has been recorded.`,
  },
  nl: {
    DIAGNOSTICS: "Diagnostica",
    HELP_TITLE: "Ondersteuning",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/nl",
    DIAGNOSTICS_TITLE: "Onder de motorkap",
    LANGUAGE: "Nederlands",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    APP_TITLE: "Beoordeel",
    FINAL_TITLE: "Klaar om in te sturen",
    SUBMIT_TITLE: "Bewaar en volgende",
    SUBMIT_DESC: `Sla beoordeling op en open de volgende link om te beoordelen. 
      Om over te slaan, ververs pagina.`,
    CHOOSE_ONE: "Kies één",
    CHOOSE_MULTIPLE: "Kies meerdere",
    START: "Start",
    START_DESC: "Begin met beoordelen van links",
    REOPEN_POPUP: "Heropen popupvenster",
    INTRODUCTION: `Beoordeel de link geopend in de popup door op een van de
      opties te klikken. Elk antwoord wordt meteen bewaard.`,
    INTRODUCTION_SESSIONLESS: `Open deze pagina met een sessiesleutel die
      verwijst naar de lijst van links die moeten worden beoordeeld.`,
    INTRODUCTION_OPENING: `Beoordeel de links die openen in een popup door op een
      van de opties te klikken. Druk op START om te beginnen.`,
    CLOSING_REMARKS_MAIL: `Bedankt voor het meedoen. Kopieer de resultaten die 
      hieronder staan en stuur ze naar het e-mailadres dat daar onder
      staat. Anders worden je resultaten mogelijk niet meegenomen.`,
    NO_SUBJECTS_REMAINING_TITLE: `Onderzoek klaar`,
    NO_SUBJECTS_REMAINING_DESC: `Bedankt. Je beoordelingen zijn opgeslagen.`,
  },
};

/** Document interface or User interface preferred language */
export function prefLangs(): readonly string[] {
  return ["x-customized", document.body.lang, "en"];
}

/**
 * Localized label.
 *
 * @param key The lookup key
 * @returns The translated label, or the untranslated key if not found.
 */
export default function label(key: string): string {
  for (const l of prefLangs()) {
    if (UI_TRANSLATIONS[l] && UI_TRANSLATIONS[l].hasOwnProperty(key))
      return UI_TRANSLATIONS[l][key];
  }
  console.warn(`Translation for "${key}" not found`);
  return key;
}
