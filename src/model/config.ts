import label from "../util/lang";

type SessionKey = string;
type FetchOptions = { cache: boolean };

export class Configuration {
  static configurationURL(fromSessionKey: SessionKey): string {
    return atob(fromSessionKey);
  }

  static sessionKeyForURL(url: SessionKey): string {
    return btoa(url).replace("=", "");
  }

  static async fetchQuestionnaire(
    sessionKey: SessionKey,
    options?: FetchOptions
  ): Promise<QuestionnaireData> {
    const { cache } = { cache: true, ...options };

    const url = this.configurationURL(sessionKey);
    const response = await fetch(url, {
      redirect: "follow",
      cache: cache ? "default" : "no-cache",
    });

    const parsedConfig = await response.json();
    if (!this.isQuestionnaireValid(parsedConfig)) {
      throw new Error("Schema validation errors. Check session key payload.");
    }

    return { ...this.questionnaireDefaults(), ...parsedConfig };
  }

  static isQuestionnaireValid(data: any): boolean {
    return data.hasOwnProperty("subjects") && data.hasOwnProperty("reporting");
  }

  static questionnaireDefaults(): Partial<QuestionnaireData> {
    return {
      lang: "en",
      help: label("HELP_URL"),
      keys: [],
      introductionText: label("INTRODUCTION"),
      closingText: label("CLOSING_REMARKS_MAIL"),
    };
  }
}
