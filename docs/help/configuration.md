# Configuring `link-beoordeelaar` for your users

This document describes how to prepare `link-beoordeelaar` for your users.

`link-beoordeelaar` consists of two pieces:

- a **frontend** (a static web page) that your users open in their browser; and
- a **backend** (Azure Functions + Cosmos DB) that stores the URLs to be judged
  (the _dataset_) and collects the answers.

To run a session, you:

1. [Deploy the frontend and backend](#deploy-link-beoordeelaar).
2. [Create a dataset](#create-a-dataset) on the backend with the URLs you
   want judged.
3. [Author a session configuration](#session-configuration) (a JSON file)
   that points at that dataset and lists the questions to ask.
4. [Generate a session key](#generate-session-key) and send it to your users.
5. When users are done, [download the dataset](#download-the-dataset).

## Deploy `link-beoordeelaar`

The frontend works statically from `https://rdmr.eu/link-beoordeelaar/`.
You can also deploy it on your own domain by cloning
[the repository](https://github.com/redmer/link-beoordeelaar) and following
your internal steps to publish the contents of `frontend/`.

The backend (`backend/`) is an Azure Functions app that requires an Azure
Cosmos DB account. Configure these environment variables when deploying:

| Variable           | Default            | Description                                |
| ------------------ | ------------------ | ------------------------------------------ |
| `COSMOS_ENDPOINT`  | _(required)_       | URI of the Cosmos DB account.              |
| `COSMOS_KEY`       | _(required)_       | Primary or read/write key.                 |
| `COSMOS_DATABASE`  | `link-beoordelaar` | Database id (created if missing).          |
| `COSMOS_CONTAINER` | `subjects`         | Container id (partition key `/datasetId`). |

The endpoints `POST /datasets/create` and `GET /datasets/{dataset}/download` require an Azure Functions key (`authLevel: function`).
The endpoints used by users' browsers (`next-subject`, `stats`, `subjects/{id}`, `subjects/{id}/answers`) are anonymous.

You may deploy the backend using `func azure functionapp publish $NAME --build remote`.

## Create a dataset

Send the URLs to be judged to the backend:

```http
POST https://<your-backend>/api/datasets/create?code=<function-key>
Content-Type: application/json

{
  "subjects": [
    { "url": "https://en.wikipedia.org/wiki/Las_Meninas",
      "metadata": { "Title": "Las Meninas" } },
    { "url": "https://en.wikipedia.org/wiki/Portrait_of_a_Young_Girl_(Christus)",
      "metadata": { "Title": "Portrait of a Young Girl" } }
  ]
}
```

Each subject **must** have a `url`.
Duplicate URLs are removed automatically.
You **may** include arbitrary `metadata` (string, number or null values), which is shown to the user as context for the URL.

The response contains the new dataset id:

```json
{ "id": "89bcda59-ef9a-4690-aaff-e0b91a82e758" }
```

Note the id; you'll need it for the session configuration and for downloading the results.

## Session Configuration

A session configuration is a JSON file describing the questions to ask and where the dataset lives.
It implements the [`ClientSession`](#schema) interface.

### Minimal example

```json
{
  "questions": [
    {
      "id": "q1",
      "mode": "one",
      "label": "Keep?",
      "options": [
        { "value": "keep", "label": "Keep this ✅" },
        { "value": "delete", "label": "Delete it 👋" }
      ]
    }
  ],
  "links": {
    "next": "https://<your-backend>/api/datasets/89bcda59-ef9a-4690-aaff-e0b91a82e758/next-subject"
  }
}
```

Host this JSON anywhere your users' browsers can fetch it
(it is loaded with CORS, so make sure the host allows that).

### Schema

```ts
interface ClientSession {
  questions: Question[];
  lang?: "en" | "nl";
  links: {
    next: string; // URL to /datasets/{id}/next-subject (optionally with ?filter=...)
    help?: string; // shown in the page footer; defaults to the bundled help page
  };
}

interface Question {
  id: string; // matches keys in the saved `answers` object
  mode: "one" | "multiple"; // single-choice or multi-choice
  label: string; // shown in the interface
  options: AnswerOption[];
}

interface AnswerOption {
  value: string; // machine-readable, stored in answers
  label: string; // shown in the interface
  description?: string; // shown as sublabel
}
```

A formal JSON Schema is available at [`schema/configuration.schema.json`](../../schema/configuration.schema.json),
with a working example in [`schema/example.json`](../../schema/example.json).

### Next-subject filters

The `links.next` URL may contain a `filter` query parameter.
Its value is a URL-encoded JSON object that describes which subjects are eligible to be returned by `/datasets/{dataset}/next-subject`.
The same filter is applied to `/datasets/{dataset}/stats` to compute the _unjudged_ count.

The filter supports basic boolean composition and matching against `metadata.<key>` and `answers.<questionId>` fields.

Supported operators:

- `and` / `or` / `not`
- `eq`: field equals value
- `contains`: field is a string containing the value as a substring,
  or an array containing the value as an element
- `exists`: field is defined
- `in`: field equals any of the listed values (use this instead of an
  `or` of many `eq`s — it is dramatically smaller on the wire)
- `between`: field is in an inclusive `[min, max]` range; either bound
  may be omitted to make the range half-open

Allowed fields:

- `id`, `url`
- `metadata.<key>`
- `answers.<questionId>`

#### Example

"Give me a subject where `q1` is not `delete`,
and where not all of the other answers are already present."

```json
{
  "and": [
    { "not": { "contains": { "field": "answers.q1", "value": "delete" } } },
    {
      "or": [
        { "not": { "exists": { "field": "answers.q1" } } },
        { "not": { "exists": { "field": "answers.q2" } } },
        { "not": { "exists": { "field": "answers.q3" } } }
      ]
    }
  ]
}
```

URL-encoded (for `?filter=`):

```
%7B%22and%22%3A%5B%7B%22not%22%3A%7B%22contains%22%3A%7B%22field%22%3A%22answers.q1%22%2C%22value%22%3A%22delete%22%7D%7D%7D%2C%7B%22or%22%3A%5B%7B%22not%22%3A%7B%22exists%22%3A%7B%22field%22%3A%22answers.q1%22%7D%7D%7D%2C%7B%22not%22%3A%7B%22exists%22%3A%7B%22field%22%3A%22answers.q2%22%7D%7D%7D%2C%7B%22not%22%3A%7B%22exists%22%3A%7B%22field%22%3A%22answers.q3%22%7D%7D%7D%5D%7D%5D%7D
```

#### Exists example

"Give me subjects where any value for `q2` is already present."

```json
{ "exists": { "field": "answers.q2" } }
```

#### `in` example

"Give me subjects whose `metadata.subjectDate` is one of these years."

```json
{
  "in": {
    "field": "metadata.subjectDate",
    "values": ["1966", "1967", "1968", "1969", "1970"]
  }
}
```

This is equivalent to an `or` of `eq` clauses but produces a much shorter
URL — prefer it whenever you have more than two or three values, since
the encoded `or`/`eq` form grows quadratically in URI length and can hit
the server's URI-length limit.

#### `between` example

"Give me subjects whose `metadata.subjectDate` is between 1966 and 2025
(inclusive)."

```json
{
  "between": {
    "field": "metadata.subjectDate",
    "min": "1966",
    "max": "2025"
  }
}
```

Either `min` or `max` may be omitted to express a half-open range
(`>= min` only, or `<= max` only). Both bounds being absent is rejected.
String comparison uses Cosmos' lexicographic order, so it works for
zero-padded years and ISO-8601 dates but not for free-form strings.

## Generate Session Key

Once you have deployed the [session configuration](#session-configuration) somewhere your users' browsers can fetch it, you can generate the session key.

The session key is the Base64-encoded (URL-safe) representation of the URL to the session configuration JSON.

> **Example**
>
> If the JSON file is hosted at `https://example.org/data.json`,
> the key can be generated on the command line thus:
>
> ```bash
> $ echo -n "https://example.org/data.json" | base64
> aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24=
> ```
>
> Your session key is this code, without the trailing `=` signs.
> Other programming languages and online services also provide Base64 encoding.

Send your session key to your users by appending `?session=<key>` to the URL of the deployed frontend.

> **Example**
>
> - `https://rdmr.eu/link-beoordeelaar/?session=aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24`
> - `https://example.org/link-beoordeelaar?session=aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24`

Different users may share the same session key:
the backend hands out one randomly chosen unjudged subject at a time, so multiple reviewers can work through the same dataset in parallel.

## Download the dataset

Once the session is finished, retrieve all subjects and their answers:

```http
GET https://<your-backend>/api/datasets/{dataset}/download?code=<function-key>
```

The response contains the dataset id and a `results` array. Each result is a
subject with its `url`, `metadata`, and the `answers` map, where keys are
question ids and values are arrays of the chosen answer values.

```ts
interface DatasetDownloadResp {
  id: string;
  results: Array<{
    id: string;
    url: string;
    metadata?: Record<string, string | number | null>;
    answers: Record<string, string[]>;
  }>;
}
```

## Help

If you need further support, open a ticket at [GitHub](https://github.com/redmer/link-beoordeelaar).
Those are handled without warranty.
