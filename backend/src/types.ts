export type Answers = Record<string, string[]>;

export type FilterValue = string | number | boolean | null;

export type FilterExpression =
  | { and: FilterExpression[] }
  | { or: FilterExpression[] }
  | { not: FilterExpression }
  | { exists: { field: string } }
  | { eq: { field: string; value: FilterValue } }
  | { contains: { field: string; value: FilterValue } }
  | { in: { field: string; values: FilterValue[] } }
  | { between: { field: string; min?: FilterValue; max?: FilterValue } };

export interface SubjectDoc {
  id: string;
  datasetId: string;
  url: string;
  metadata?: Record<string, string | number | null>;
  answers: Answers;
  type: "subject";
  createdAt: string;
  updatedAt: string;
}

export interface DatasetCreateReq {
  subjects: Array<{
    url: string;
    metadata?: Record<string, string | number | null>;
    answers?: Answers;
  }>;
}

export interface SubjectPatchReq {
  answers: Answers;
}
