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
  /**
   * Number of subjects that fall within the session's *scope* (the
   * denominator of the progress bar). `null` when the session did not
   * declare a scope — in that case the frontend hides the progress bar
   * and only shows the "X remaining" label, because the dataset-wide
   * total isn't a meaningful denominator for a scoped queue.
   */
  total: number | null;
  /** Number of subjects still matching the full session filter. */
  unjudged: number;
}

export type Answers = Record<string, string[]>; // key = question id, values = AnswerOption.values

export interface SubjectPatchReq {
  answers: Answers;
}
