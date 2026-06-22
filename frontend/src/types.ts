export interface Question {
  id: string;
  mode: "one" | "multiple";
  label: string; // "Keep or Delete", "Document Type", "Categories", ...
  options: AnswerOption[]; // possible answers
}

export interface AnswerOption {
  value: string; // machine readable value to be set in table
  label: string; // readable interface label
  description?: string; // optional interface sublabel
}

export interface ClientSession {
  questions: Question[];
  lang?: string;
  links: {
    next: string; // Called to retrieve the next unjudged subject, called every time a full answer is made.
    help?: string; // Supports HTML
  };
}

export interface SubjectAsInput {
  url: string;
  metadata?: Record<string, string | number | null>;
}

export interface Subject extends SubjectAsInput {
  id: string;
}

export interface SubjectWithAnswers extends Subject {
  answers: Answers;
}

export interface SubjectNextResp {
  subject: SubjectWithAnswers;
}

export interface DatasetStatsResp {
  total: number;
  unjudged: number;
}

export type Answers = Record<string, string[]>; // key = question id, values = AnswerOption.values

export interface SubjectPatchReq {
  answers: Answers;
}
