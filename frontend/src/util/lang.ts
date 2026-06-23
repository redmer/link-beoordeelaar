import { Formatter } from "./StringFormat.js";

const baseTranslation = {
  /* Add translations here */
  APP_TITLE: "Categorize 🧑‍⚖️",
  CHOOSE_MULTIPLE: "*️⃣ Choose multiple",
  CHOOSE_ONE: "1️⃣ Choose one",
  CHOOSE_REQUIRED: "🔷 Required",
  DIAGNOSTICS_TITLE: "Internals",
  HELP_TITLE: "Help and Support",
  HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/en",
  INTRODUCTION_OPENING: `Choose the applicable categories for the link that opens in a popup window, by choosing one of the provided options. Press START to begin. You must allow the popups to appear. You can always reload this page, all your categorizations are safe.`,
  INTRODUCTION: `The above link has been opened in the popup window. Categorize it by choosing from the below options. You can always save and submit to decide on an answer later.`,
  ITEMS_DONE: `{0} done of {1} links`,
  ITEMS_REMAINING: `{0} remaining`,
  LANGUAGE: "English",
  LOADING_DESC: `Loading questionnaire and connecting with remote database.`,
  LOADING_TITLE: `Loading... ⏳`,
  NO_SUBJECTS_REMAINING_DESC: `Thank you for participating. Your response has been recorded.`,
  NO_SUBJECTS_REMAINING_TITLE: `This session is complete 🍵`,
  REOPEN_POPUP: "Reopen popup window 🔄️",
  SESSIONLESS_DESC: `Provide a session key that refers to the questionnaire you want filled out.`,
  SESSIONLESS_TITLE: `No session configured 🗝️`,
  START_DESC:
    "Start categorizing links. You must allow popups from this website.",
  START: "▶️ Start",
  SUBMIT_DESC: `Save categorization and open next link.`,
  SUBMIT_TITLE: "Save & next 💾",
  SUBMIT_SECTION: `Submit`,
} as const;

export const UI_TRANSLATIONS: Record<
  string,
  Record<keyof typeof baseTranslation, string>
> = {
  /* Add languages here */
  en: baseTranslation,
  nl: {
    APP_TITLE: "Beoordeel 🧑‍⚖️",
    CHOOSE_MULTIPLE: "*️⃣ Kies één of meerdere",
    CHOOSE_ONE: "1️⃣ Kies één",
    CHOOSE_REQUIRED: "🔷 Required",
    DIAGNOSTICS_TITLE: "Onder de motorkap",
    HELP_TITLE: "Ondersteuning",
    HELP_URL: "https://rdmr.eu/link-beoordeelaar/docs/help/enduser/nl",
    INTRODUCTION_OPENING: `Kies de toepasselijke categorieën voor de link die straks opent in een popupvenster. Druk op START om te beginnen. Je kunt altijd bewaren en later doorgaan.`,
    INTRODUCTION: `De bovenstaande link is geopend in het popupvenster. Beoordeel het door een van de onderstaande opties te kiezen. Je kunt altijd bewaren en later doorgaan.`,
    ITEMS_DONE: `{0} voltooid van {1} links`,
    ITEMS_REMAINING: `{0} nog te gaan`,
    LANGUAGE: "Nederlands",
    LOADING_DESC: `Vragenlijst ophalen en verbinden met databank.`,
    LOADING_TITLE: `Laden... ⏳`,
    NO_SUBJECTS_REMAINING_DESC: `Bedankt voor het beoordelen. Je antwoorden zijn opgeslagen.`,
    NO_SUBJECTS_REMAINING_TITLE: `Deze sessie is klaar 🍵`,
    REOPEN_POPUP: "Heropen popupvenster 🔄️",
    SESSIONLESS_DESC: `Geef een sessiesleutel in.`,
    SESSIONLESS_TITLE: `Onbekende sessie 🗝️`,
    START_DESC:
      "Begin met beoordelen van links. Popups van deze website moeten zijn toegestaan.",
    START: "▶️ Start",
    SUBMIT_DESC: `Sla beoordeling op en open de volgende link om te beoordelen.`,
    SUBMIT_TITLE: "Bewaar 💾 en volgende",
    SUBMIT_SECTION: `Submit`,
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
