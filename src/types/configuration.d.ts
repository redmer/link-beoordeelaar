class Configuration {
  lang?: string;
  help?: string;
  bestBefore?: string;
  subjects: Subject[];
  keys?: keyof Subject[];
  answerOptions?: Answer[];
  reporting: {
    endpoint?: string;
    email?: string;
    keys?: keyof Subject[];
  };
}

class Subject {
  url: string;
  [key: string]: string | number | null;
}

class Answer {
  name: string;
  description?: string;
  value?: string;
}
