import { Formatter } from "./StringFormat.js";

const baseTranslation = {
  /* Add translations here */
  APP_TITLE: "🧑‍⚖️ Categorize",
  CHOOSE_MULTIPLE: "*️⃣ Choose multiple",
  CHOOSE_ONE: "1️⃣ Choose one",
  CHOOSE_REQUIRED: "🔷 Required",
  DIAGNOSTICS_TITLE: "Internals",
  HELP_TITLE: "Help and Support",
  HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/en",
  INTRODUCTION_OPENING: `Choose the applicable categories for the link that opens in a popup window, by choosing one of the provided options. Press START to begin. You must allow the popups to appear. You can always reload this page, all your categorizations are safe.`,
  INTRODUCTION: `The above link has been opened in the popup window. Categorize it by choosing from the below options. You can always save and submit to decide on an answer later.`,
  ITEMS_REMAINING: `{0} remaining`,
  LANGUAGE: "English",
  NO_SUBJECTS_REMAINING_DESC: `Thank you for participating. Your response has been recorded.`,
  NO_SUBJECTS_REMAINING_TITLE: `🍵 This session is completely done.`,
  REOPEN_POPUP: "Reopen popup window",
  SESSIONLESS_DESC: `Provide a session key that refers to the questionnaire you want filled out.`,
  SESSIONLESS_TITLE: `No session configured`,
  START_DESC:
    "Start categorizing links. You must allow popups from this website.",
  START: "▶️ Start",
  SUBMIT_DESC: `Save categorization and open next link. To skip, refresh page.`,
  SUBMIT_TITLE: "💾 Save and next",
  SUBMIT_SECTION: `Submit`,
} as const;

export const UI_TRANSLATIONS: Record<
  string,
  Record<keyof typeof baseTranslation, string>
> = {
  /* Add languages here */
  en: baseTranslation,
  nl: {
    HELP_TITLE: "Ondersteuning",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/nl",
    DIAGNOSTICS_TITLE: "Onder de motorkap",
    LANGUAGE: "Nederlands",
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
    SESSIONLESS_DESC: `Open deze pagina met een sessiesleutel die
      verwijst naar de lijst van links die moeten worden beoordeeld.`,
    INTRODUCTION_OPENING: `Beoordeel de links die openen in een popup door op een
      van de opties te klikken. Druk op START om te beginnen.`,
    NO_SUBJECTS_REMAINING_TITLE: `Onderzoek klaar`,
    NO_SUBJECTS_REMAINING_DESC: `Bedankt. Je beoordelingen zijn opgeslagen.`,
    ITEMS_REMAINING: `{0} nog te gaan`,
    SESSIONLESS_TITLE: "Sessiesleutel ontbreekt",
  },
};

/** Document interface or User interface preferred language */
export function prefLangs(): readonly string[] {
  const [navlang] = new Intl.NumberFormat(navigator.languages)
    .resolvedOptions()
    .locale.split("-", 1);
  return [document.body.lang, navlang, "en"];
}

/**
 * Localized label.
 *
 * @param key The lookup key
 * @returns The translated label, or the untranslated key if not found.
 */
export default function label(
  key: keyof typeof baseTranslation,
  ...args: string[]
): string {
  for (const l of prefLangs()) {
    if (UI_TRANSLATIONS[l])
      if (UI_TRANSLATIONS[l].hasOwnProperty(key))
        return Formatter.format(UI_TRANSLATIONS[l][key], ...args);
  }
  console.warn(`Translation for "${key}" not found`);
  return key;
}
