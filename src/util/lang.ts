export const UI_TRANSLATIONS = {
  /* Add languages here */
  en: {
    /* Add translations here */
    DIAGNOSTICS: "Diagnostics",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/help/enduser/en",
    LANGUAGE: "English",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    INTRODUCTION: `Categorize the link that has opened in the popup window
      by choosing one of the following options. If you need to pause, you may
      resume categorizing within one week inside this very browser.`,
    CLOSING_REMARKS_MAIL: `Thank you for participating. You need to send your
      results displayed below to the e-mail address displayed below that. 
      Otherwise, your response may not be recorded.`,
  },
  nl: {
    DIAGNOSTICS: "Diagnostica",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/help/enduser/nl",
    LANGUAGE: "Nederlands",
    CORRECT: "Correct",
    INCORRECT: "Incorrect",
    INTRODUCTION: `Beoordeel de link geopend in de popup door op een van de
      opties te klikken. Als je het beoordelen moet onderbreken, kun je op deze
      computer in deze browser binnen een week doorgaan. `,
    CLOSING_REMARKS_MAIL: `Bedankt voor het meedoen. De resultaten die 
      hieronder staan moet je opsturen naar het e-mailadres dat daar weer onder
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
