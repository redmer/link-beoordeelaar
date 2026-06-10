import label, { UI_TRANSLATIONS } from "./lang.js";

describe("label (language/translations)", () => {
  it("should return English label when language is not specified", () => {
    const result = label("APP_TITLE");
    expect(result).toBe("Categorize");
  });

  it("should return English label for known keys", () => {
    const keys = [
      "DIAGNOSTICS",
      "LANGUAGE",
      "CORRECT",
      "INCORRECT",
      "START",
    ] as const;
    keys.forEach((key) => {
      expect(label(key)).toBeTruthy();
    });
  });

  it("should return the same value for consistent calls", () => {
    const result1 = label("APP_TITLE");
    const result2 = label("APP_TITLE");
    expect(result1).toBe(result2);
  });

  it("should have matching English and Dutch translations", () => {
    const keys = Object.keys(UI_TRANSLATIONS.en);
    keys.forEach((key) => {
      expect(UI_TRANSLATIONS.nl).toHaveProperty(key);
    });
  });

  it("should have English translations for all UI keys", () => {
    const requiredKeys = [
      "DIAGNOSTICS",
      "HELP_URL",
      "LANGUAGE",
      "CORRECT",
      "INCORRECT",
      "APP_TITLE",
      "FINAL_TITLE",
      "START",
      "START_DESC",
      "REOPEN_POPUP",
      "INTRODUCTION",
      "INTRODUCTION_SESSIONLESS",
      "INTRODUCTION_OPENING",
      "CLOSING_REMARKS_MAIL",
    ] as const;

    requiredKeys.forEach((key) => {
      expect(UI_TRANSLATIONS.en).toHaveProperty(key);
      expect(UI_TRANSLATIONS.en[key]).toBeTruthy();
    });
  });

  it("should have Dutch translations for all UI keys", () => {
    const requiredKeys = [
      "DIAGNOSTICS",
      "HELP_URL",
      "LANGUAGE",
      "CORRECT",
      "INCORRECT",
      "APP_TITLE",
      "FINAL_TITLE",
      "START",
      "START_DESC",
      "REOPEN_POPUP",
      "INTRODUCTION",
      "INTRODUCTION_SESSIONLESS",
      "INTRODUCTION_OPENING",
      "CLOSING_REMARKS_MAIL",
    ] as const;

    requiredKeys.forEach((key) => {
      expect(UI_TRANSLATIONS.nl).toHaveProperty(key);
      expect(UI_TRANSLATIONS.nl[key]).toBeTruthy();
    });
  });

  it("should have both languages properly defined", () => {
    expect(UI_TRANSLATIONS).toHaveProperty("en");
    expect(UI_TRANSLATIONS).toHaveProperty("nl");
    expect(Object.keys(UI_TRANSLATIONS.en).length).toBeGreaterThan(0);
    expect(Object.keys(UI_TRANSLATIONS.nl).length).toBeGreaterThan(0);
  });
});
