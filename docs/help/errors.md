# Diagnostics and errors

`link-beoordeelaar` reports problems in two places:

- **Critical errors** that prevent the application from starting at all are
  shown directly on the page with a fixed error code.
- **Runtime errors** (e.g. failure to fetch a subject or save an answer) are
  shown in the **Internals / Onder de motorkap** disclosure at the bottom of
  every page. Ask your user to expand it and copy its contents.

This document lists the fixed error codes a user may give you, and explains
the kinds of messages that appear in the diagnostics panel.

## Fixed error codes

#### `dfc29c07-4fc7-41f7-9d56-8db988573511`

JavaScript is turned off. This message is emitted by the page's `<noscript>`
fallback, before the application has had a chance to run.

Solution: turn JavaScript on, or whitelist the page, in a modern browser.

## Runtime diagnostics

When something goes wrong while the app is running, it stays on the same
page, switches the status indicator to _error_, and appends a human-readable
line to the diagnostics panel.

Common messages and what they mean:

- **`Failed to load next subject: ...`**: the backend did not return a next subject.
  Causes include:
  the dataset id in `links.next` is wrong,
  the backend is unreachable,
  CORS is misconfigured, or the `?filter=` is invalid.
  Check the network tab in the browser dev-tools.
- **`Failed to restore previous subject: ...`**: the user pressed _back_ but the subject referenced in browser history could no longer be fetched from the backend.
- **`Failed to save answer: ...`**: saving the user's answer with `PATCH /datasets/{dataset}/subjects/{id}/answers` failed.
  The user can retry by submitting again.
- **`Popup window was blocked by the browser.`**: the browser refused to open the popup.
  The user must allow popups from the page and click _Start_ again.
- **`Popup window is not open.`**: the popup was closed.
  The user can press _Reopen popup window 🔄️_ to reopen it for the current subject.

## Configuration problems

If the **session configuration JSON** cannot be loaded or parsed, the app falls back to a "no session configured" screen and logs the underlying fetch/parse error to the browser console (`Failed to fetch client session`).

To diagnose, ask the user for:

1. The exact URL of the page (so you can recover the session key from
   `?session=`).
2. A copy of the **Internals** panel.
3. Optionally a screenshot of the browser console.

A formal JSON Schema for the session configuration is available at [`schema/configuration.schema.json`](../../schema/configuration.schema.json).
You can validate your file against it before sending the session key to your users.
