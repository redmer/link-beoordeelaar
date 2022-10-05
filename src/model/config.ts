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
    const { cache } = { cache: false, ...options };

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
    };
  }

  static answersPayload(
    subjects: Subject[],
    answers: Answer[]
  ): Record<string, string> {
    const zipped = subjects.map((s, i) => [s, answers[i]]);

    return zipped.reduce(
      (body: Record<string, string>, [subject, answer]: [Subject, Answer]) => {
        return { ...body, [subject.url]: answer.value };
      },
      {}
    );
  }

  static async postAnswers(
    payload: Record<string, string>,
    endpoint: QuestionnaireData["reporting"]["endpoint"],
    { sessionKey }: { sessionKey: string }
  ) {
    let authHeaders;
    if (endpoint.authorizationType == "bearer")
      authHeaders = {
        Authorization: `Bearer ${atob(endpoint.authorizationToken)}`,
      };

    await fetch(endpoint.path, {
      method: endpoint.method,
      redirect: "follow",
      headers: { ...authHeaders },
      body: JSON.stringify({
        event_type: "save_payload",
        client_payload: {
          session: sessionKey,
          answers: btoa(JSON.stringify(payload)),
        },
      }),
    });
  }
}
