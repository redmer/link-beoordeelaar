export type Answers = Record<string, string[]>;

export interface SubjectDoc {
  id: string;
  datasetId: string;
  url: string;
  metadata?: Record<string, string | number | null>;
  answers: Answers;
  isJudged: boolean;
  type: "subject";
  createdAt: string;
  updatedAt: string;
}

export interface DatasetCreateReq {
  subjects: Array<{
    url: string;
    metadata?: Record<string, string | number | null>;
  }>;
}

export interface SubjectPatchReq {
  answers: Answers;
}
