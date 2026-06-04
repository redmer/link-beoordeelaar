## Terminology

- A **Subject** is a URL to be judged and arbitrairy metadata for it.
- An **AnswerOption** is a key, label and description. Answering options are grouped in `Question`s that either allow a single answer or multiple.
- **Datasets** represent a list of unique URLs to be judged with arbitrairy metadata. The creation and download of a dataset is authenticated, but individual updates are not.
- A **ClientSession** is an ordered list of Questions, an optional help link and a fully configured next-subject link to the dataset server. ClientSessions can be prepared fully statically, e.g. saved to a static web page to link to. The server is not aware of ClientSessions.

## Server side API

| Path                                                      | Input              | Output                              | Auth | Desc                                                                    |
| --------------------------------------------------------- | ------------------ | ----------------------------------- | ---- | ----------------------------------------------------------------------- |
| `POST /datasets/create`                                   | `DatasetCreateReq` | 201 `DatasetCreateResp`, 401        | 1    |
| `GET /datasets/{dataset}/next-subject?filter={...}`       |                    | 200 `SubjectNextResp`, 404          | 0    | Returns a single new subject. One randomized filter result is returned. |
| `PATCH /datasets/{dataset}/subjects/{subject_id}/answers` | `SubjectPatchReq`  | 202, 401, 404                       | 0    |
| `GET /datasets/{dataset}/download`                        |                    | 200 `DatasetDownloadResp`, 401, 404 | 1    |

```ts
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
  final?: true; // This answer option makes this subject done, so client may fetch next subject
}

interface ClientSession {
  questions: Question[];
  links: {
    next: string; // Called to retrieve the next unjudged subject, called every time a full answer is made.
    help?: string; // Supports HTML
  };
}
```

```ts
interface SubjectAsInput {
  url: string;
  metadata?: Record<string, string | number | null>;
}

interface Subject extends SubjectAsInput {
  id: string;
}

interface SubjectWithAnswers extends Subject {
  answers: Answers;
}

interface SubjectNextResp {
  subject: SubjectWithAnswers;
  stats: {
    total: number;
    unjudged: number;
  };
}

type Answers = Record<string, string[]>; // key = question id, values = AnswerOption.values

interface SubjectPatchReq {
  answers: Answers;
}

interface DatasetCreateReq {
  subjects: SubjectAsInput[]; // The set of URLs to be judged in this dataset.
}

interface DatasetCreateResp {
  id: string; // Server-generated UUID
}

interface DatasetDownloadResp {
  id: string; // Server-generated UUID
  results: SubjectWithAnswers[];
}
```
