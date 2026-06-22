# link-beoordeelaar (frontend)

A static, single-page web application that lets users judge a list of URLs
against a configurable set of questions. The questions and the location of
the URLs are described per session in a JSON configuration file (a
_ClientSession_). Answers are stored in the [backend](../backend/README.md)
in real time.

## Features

- **Popup window** for the URL under judgement, separate from the
  questionnaire.
- **Keyboard shortcuts** for every answer option, so judgments can be
  provided quickly.
- **Resumable**: the backend keeps unfinished work, so a user can stop and
  come back later (even from a different device, by reusing the same session
  link).
- **Back navigation**: users can revisit and amend the previous subject with
  the browser's _back_ button.
- **Multilingual**: interface labels are localized; the default languages
  are `en` and `nl`.
- **Configurable per session**: questions, answer options, the dataset to
  use, and an optional filter expression are all set in the session JSON.
- **Progress and diagnostics** in the page header and footer; failures are
  surfaced to the user without breaking the flow.

## How a session works

1. The backend exposes a _dataset_ (a list of URLs and metadata).
2. You author a [session configuration](../docs/help/configuration.md) that
   points at the dataset and lists the questions to ask.
3. You host the JSON configuration on any web server and Base64-encode its
   URL into a session key.
4. Users open `<frontend>/?session=<key>`. The app fetches the configuration,
   asks the backend for the next unjudged subject, and submits each answer
   with `PATCH /datasets/{id}/subjects/{subject}/answers`.

For full details on the configuration format, the dataset endpoints and
the next-subject filter expressions, see
[docs/help/configuration.md](../docs/help/configuration.md).

## Development

The frontend is built with **React 19** (functional components + hooks) and
TypeScript, bundled with **Rollup**. Source lives in [`src/`](src/).

```bash
npm install
npm run watch    # rebuild on change
npm test         # Jest unit tests (jsdom)
npm run test:e2e # Playwright integration tests (when configured)
```

The bundled output is `dist/bundle.min.js`, loaded by [`index.html`](index.html).

For development against the local backend, run from the repo root:

```bash
npm run dev
```

This starts the backend Azure Functions host and a Rollup watcher in
parallel.

## Layout

- [`src/index.tsx`](src/index.tsx) &mdash; entry point; mounts
  `<ClientSessionProvider>` and `<App />` into `document.body`.
- [`src/app/App.tsx`](src/app/App.tsx) &mdash; top-level orchestration.
- [`src/components/`](src/components/) &mdash; presentational components
  (`Page`, `QuestionnairePage`, `Hero`, `AnswerOption`, `Progress`, ...).
- [`src/hooks/`](src/hooks/) &mdash; behaviour hooks (questionnaire session,
  popup window manager, navigation history, submission manager, app load
  state, ...).
- [`src/stores/`](src/stores/) &mdash; thin wrappers around the backend
  HTTP API (`Client.ts` for the session JSON, `Server.ts` for dataset
  endpoints).
- [`src/util/lang.ts`](src/util/lang.ts) &mdash; UI translation table
  (currently `en`, `nl`).

## Usage

Append `?session=<base64-url>` to the deployed page, where the value is the
URL-safe Base64-encoded URL of your session configuration JSON.
