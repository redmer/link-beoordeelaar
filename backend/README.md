## Terminology

- A **Subject** is a URL to be judged and arbitrairy metadata for it.
- An **AnswerOption** is a key, label and description. Answering options are grouped in `Question`s that either allow a single answer or multiple.
- **Datasets** represent a list of unique URLs to be judged with arbitrairy metadata. The creation and download of a dataset is authenticated, but individual updates are not.
- A **Session** is an ordered list of Questions, an optional help link and a fully configured next-subject link to the dataset server. Sessions can be prepared fully statically, e.g. saved to a static web page to link to.

## Server side API

- `POST /datasets/create` with an array of Subjects. Each subject URL MUST be unique. This endpoint requires authentication. The endpoint creates an unguessable UUID and returns it to the caller. (`DatasetCreateRequest`)
- `GET /datasets/{dataset}/next-subject?filter={...}` returns a single subject (`SubjectNextResp`). This endpoint does **not** require authentication. The results of the filter are sorted randomly and only the first is returned. That way potential overlap with parallel sessions is minimized.
- `POST /datasets/{dataset}/subjects/{subject_id}/judgment` with an object that gives the judgments for this URL. This endpoint does **not** require authentication. The `subject_id` is at the discretion of the server implementation.
- `GET /datasets/{dataset}/download` (`DatasetDownloadResp`) returns the full list of links and judgments. This endpoint requires authentication.

```ts
interface SubjectAsInput {
  url: string;
  metadata?: Record<string, string | number | null>;
}

interface Subject {
  id: string;
  url: string;
  links: {
    patch: string; // /datasets/{dataset}/subjects/{subject_id}
  };
  metadata?: Record<string, string | number | null>;
}

interface SubjectWithJudgments {
  url: string;
  metadata?: Record<string, string | number | null>;
  judgments: Judgments;
}

interface Question {
  id: string;
  mode: "one" | "multiple";
  label: string; // "Keep or Delete", "Document Type", "Categories", ...
  options: AnswerOption[]; // possible answers
}

interface AnswerOption {
  value: string; // machine readable value to be set in table
  label: string; // readable interface label
  description?: string; // optional interface sublabel
  effects?: {
    terminate: true; // obviates subsequent Questions
  };
}

interface Dataset {
  id?: string; // Server-generated UUID
  subjects: SubjectAsInput[]; // Set for POST, the set of URLs to be judged in this dataset.
}

interface Session {
  questions: Question[];
  links: {
    next: string; // Called to retrieve the next unjudged subject, called every time a full judgment is made.
    help?: string; // Supports HTML
  };
}

interface SubjectNextResp {
  subject: Subject;
  stats: {
    total: number;
    unjudged: number;
  };
}

type Judgments = Record<string, string[]>; // key = question id, values = AnswerOption.values

interface SubjectPatchReq {
  judgments: Judgments;
}

interface DatasetDownloadResp {
  results: SubjectWithJudgments[];
}

interface DatasetCreateRequest {
  subjects: SubjectAsInput[];
}
```
