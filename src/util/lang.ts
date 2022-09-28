export const UI_TRANSLATIONS = {
  /* Add languages here */
  en: {
    /* Add translations here */
    DIAGNOSTICS: "Diagnostics",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/help/enduser/en",
    LANGUAGE: "English",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    APP_TITLE: "Categorize",
    FINAL_TITLE: "Ready to send in",
    START: "Start",
    START_DESC: "Commence categorizing links",
    INTRODUCTION: `Categorize the link that has opened in the popup window
      by choosing one of the following options. If you need to pause, you may
      resume categorizing within one week inside this very browser.`,
    INTRODUCTION_SESSIONLESS: `Provide a session key that refers to the
      questionnaire you want filled out.`,
    INTRODUCTION_OPENING: `Categorize the links that open in a popup window, by
      choosing one of the provided options. Select START to begin.`,
    CLOSING_REMARKS_MAIL: `Thank you for participating. Copy and send your
      results displayed below to the e-mail address displayed below that. 
      Otherwise, your response may not be recorded.`,
  },
  nl: {
    DIAGNOSTICS: "Diagnostica",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/help/enduser/nl",
    LANGUAGE: "Nederlands",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    APP_TITLE: "Beoordeel",
    FINAL_TITLE: "Klaar om in te sturen",
    START: "Start",
    START_DESC: "Begin met beoordelen van links",
    INTRODUCTION: `Beoordeel de link geopend in de popup door op een van de
      opties te klikken. Als je het beoordelen moet onderbreken, kun je op deze
      computer in deze browser binnen een week doorgaan. `,
    INTRODUCTION_SESSIONLESS: `Open deze pagina met een sessiesleutel die
      verwijst naar de lijst van links die moeten worden beoordeeld.`,
    INTRODUCTION_OPENING: `Beoordeel de links die openen in een popup door op een
      van de opties te klikken. Druk op START om te beginnen.`,
    CLOSING_REMARKS_MAIL: `Bedankt voor het meedoen. Kopieer de resultaten die 
      hieronder staan en stuur ze naar het e-mailadres dat daar onder
      staat. Anders worden je resultaten niet meegenomen.`,
  },
};

/** Document interface or User interface preferred language */
export function prefLangs(): readonly string[] {
  return [document.body.lang || "en"];
}

/**
 * Localized label.
 *
 * @param key The lookup key
 * @returns The translated label, or the untranslated key if not found.
 */
export default function label(key: string): string {
  for (const l of prefLangs()) {
    if (
      UI_TRANSLATIONS.hasOwnProperty(l) &&
      UI_TRANSLATIONS[l].hasOwnProperty(key)
    )
      return UI_TRANSLATIONS[l][key];
  }
  console.warn(`Translation for "${key}" not found`);
  return key;
}
