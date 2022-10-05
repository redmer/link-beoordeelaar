declare class QuestionnaireData {
  answerOptions: Answer[];
  lang: string;
  translations: Record<string, string>;
  reporting: {
    email?: string;
    endpoint?: {
      authorizationType: "bearer";
      authorizationToken: string;
      method: "post";
      path: string;
    };
  };
  subjects: Subject[];
  help?: string;
  introductionText?: string;
  closingText?: string;
  keys?: string[];
}

declare type Configuration = Required<QuestionnaireData>;

declare type DefaultConfiguration = Omit<
  Configuration,
  "subjects" | "reporting"
>;

declare class InterfaceParameters {
  language: string;
  helpLink: string;
  completeByDate: Date | null;
  possibleAnswers: Answer[];
}

declare class Subject {
  url: string;
  [key: string]: string | number | null;
}

declare class Answer {
  name: string;
  description?: string;
  value?: string;
}
