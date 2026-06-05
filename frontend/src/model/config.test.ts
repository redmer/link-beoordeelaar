import { Configuration } from "./config.js";

describe("Configuration", () => {
  describe("sessionKeyForURL", () => {
    it("should create a session key from a URL", () => {
      const url = "https://example.com/config.json";
      const sessionKey = Configuration.sessionKeyForURL(url);

      expect(sessionKey).toBeTruthy();
      expect(typeof sessionKey).toBe("string");
    });

    it("should create a valid base64-like encoded string", () => {
      const url = "https://example.com/config.json";
      const sessionKey = Configuration.sessionKeyForURL(url);

      // Should be a non-empty string with base64 characters
      expect(/^[A-Za-z0-9+/=]+$/.test(sessionKey)).toBe(true);
    });
  });

  describe("configurationURL", () => {
    it("should decode a base64 encoded string with proper padding", () => {
      // Create a properly padded base64 string for testing
      const testString = "aGVsbG8gd29ybGQ="; // "hello world"
      const decodedUrl = Configuration.configurationURL(testString);

      expect(decodedUrl).toBe("hello world");
    });
  });

  describe("isQuestionnaireValid", () => {
    it("should return true for valid questionnaire data", () => {
      const validData = {
        subjects: [],
        reporting: {},
      };

      expect(Configuration.isQuestionnaireValid(validData)).toBe(true);
    });

    it("should return false when subjects is missing", () => {
      const invalidData = {
        reporting: {},
      };

      expect(Configuration.isQuestionnaireValid(invalidData)).toBe(false);
    });

    it("should return false when reporting is missing", () => {
      const invalidData = {
        subjects: [],
      };

      expect(Configuration.isQuestionnaireValid(invalidData)).toBe(false);
    });

    it("should return false for empty object", () => {
      expect(Configuration.isQuestionnaireValid({})).toBe(false);
    });
  });

  describe("questionnaireDefaults", () => {
    it("should return default values with required keys", () => {
      const defaults = Configuration.questionnaireDefaults();

      expect(defaults).toHaveProperty("lang", "en");
      expect(defaults).toHaveProperty("keys");
      expect(Array.isArray(defaults.keys)).toBe(true);
    });

    it("should include help URL", () => {
      const defaults = Configuration.questionnaireDefaults();

      expect(defaults.help).toBeTruthy();
    });
  });

  describe("answersPayload", () => {
    it("should create payload mapping URLs to answer values", () => {
      const subjects = [
        { url: "https://example1.com" },
        { url: "https://example2.com" },
      ] as any[];
      const answers = [{ value: "correct" }, { value: "incorrect" }] as any[];

      const payload = Configuration.answersPayload(subjects, answers);

      expect(payload).toEqual({
        "https://example1.com": "correct",
        "https://example2.com": "incorrect",
      });
    });

    it("should handle empty subject/answer arrays", () => {
      const payload = Configuration.answersPayload([], []);

      expect(payload).toEqual({});
    });

    it("should map subjects and answers in order", () => {
      const subjects = [
        { url: "url1" },
        { url: "url2" },
        { url: "url3" },
      ] as any[];
      const answers = [{ value: "a" }, { value: "b" }, { value: "c" }] as any[];

      const payload = Configuration.answersPayload(subjects, answers);

      expect(Object.keys(payload)).toHaveLength(3);
      expect(payload["url1"]).toBe("a");
      expect(payload["url2"]).toBe("b");
      expect(payload["url3"]).toBe("c");
    });
  });
});
