# link-beoordeelaar (backend)

Azure Functions app that stores the URLs to be judged and the answers given to them in Azure Cosmos DB.
The frontend (a static SPA, see [`../frontend/`](../frontend)) only talks to this backend.

## Terminology

- A **Subject** is a URL to be judged together with arbitrary metadata.
- An **AnswerOption** has a value (machine-readable), a label, an optional description, and an optional `final` flag.
  Answer options are grouped into **Question**s that allow either a single answer (`mode: "one"`) or several (`mode: "multiple"`).
- A **Dataset** is a list of unique subjects.
  Creating a dataset and downloading it require an Azure Functions key;
  reading the next subject, reading dataset stats, fetching a single subject and patching its answers are anonymous.
- A **ClientSession** is an ordered list of questions, an optional help link and a fully configured next-subject URL.
  ClientSessions are static JSON files served from any web host; the backend never sees them.

## Configuration

| Variable           | Default            | Description                                |
| ------------------ | ------------------ | ------------------------------------------ |
| `COSMOS_ENDPOINT`  | _(required)_       | URI of the Cosmos DB account.              |
| `COSMOS_KEY`       | _(required)_       | Account key.                               |
| `COSMOS_DATABASE`  | `link-beoordelaar` | Database id (created if missing).          |
| `COSMOS_CONTAINER` | `subjects`         | Container id (partition key `/datasetId`). |

For local development, populate `local.settings.json` and run `npm start`
(or `npm run dev` from the repo root, which also starts the frontend bundler).

## HTTP API

| Method | Path                                                | Auth      | Body / Query                | Returns                             |
| ------ | --------------------------------------------------- | --------- | --------------------------- | ----------------------------------- |
| POST   | `/datasets/create`                                  | function  | `DatasetCreateReq`          | `201 { id }`, `400`                 |
| GET    | `/datasets/{dataset}/next-subject`                  | anonymous | `?filter=<urlencoded JSON>` | `200 SubjectNextResp`, `400`, `404` |
| GET    | `/datasets/{dataset}/stats`                         | anonymous | `?filter=<urlencoded JSON>` | `200 DatasetStatsResp`, `400`       |
| GET    | `/datasets/{dataset}/subjects/{subject_id}`         | anonymous |                             | `200 SubjectDoc`, `404`             |
| PATCH  | `/datasets/{dataset}/subjects/{subject_id}/answers` | anonymous | `SubjectPatchReq`           | `202`, `400`, `404`                 |
| GET    | `/datasets/{dataset}/download`                      | function  |                             | `200 DatasetDownloadResp`, `404`    |

`next-subject` returns one randomly-chosen subject from up to the first 50
matching the filter. `stats.total` is unfiltered; `stats.unjudged` applies
the same `filter` as `next-subject`, so it represents the number of
subjects still eligible.

`PATCH /answers` merges the supplied `answers` map with the stored one
(keys are question ids; values are arrays of answer values). Submitting the
same key again replaces its previous values.

### Filter expressions

`filter` is a URL-encoded JSON object. Supported shapes:

- `{ "and": [ ... ] }`, `{ "or": [ ... ] }`, `{ "not": ... }`
- `{ "eq":       { "field": "<path>", "value": <scalar> } }`
- `{ "contains": { "field": "<path>", "value": <scalar> } }`
- `{ "exists":   { "field": "<path>" } }`

Allowed field paths:

- `id`, `url`
- `metadata.<key>` (alphanumerics and underscore)
- `answers.<questionId>` (alphanumerics and underscore)

`eq` and `contains` are guarded with `IS_DEFINED(...)` so that comparing
a missing property yields `false` instead of `undefined`. As a result,
`{ "not": { "contains": ... } }` matches both subjects where the field is
missing and subjects where the field exists but does not contain the value.

See [`docs/help/configuration.md`](../docs/help/configuration.md) for an
end-to-end example, the URL-encoded form, and notes on common patterns.
