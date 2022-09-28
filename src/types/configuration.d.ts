declare class QuestionnaireData {
  answerOptions: Answer[];
  lang: string;
  reporting: {
    email: string;
    endpoint: string;
    keys: string[];
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
