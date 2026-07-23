---
name: xander-lab-guardrails
description: Apply Xander Lab API, authentication, task-page, and loading-state guardrails when implementing or reviewing frontend or backend features.
---

# Xander Lab Guardrails

## Before changing code

- Read the repository `AGENTS.md`; frontend work must also read `COMPONENTS.md`.
- Preserve user changes and do not commit environment files, credentials, or API keys.

## API, errors, and authentication

- Java and Node errors use `{ "code": number, "message": string, "data": null }`.
- Every error body must use an HTTP status with matching semantics: 400 / 401 / 403 / 404 / 5xx are real HTTP responses, and custom business codes are mapped to their corresponding HTTP status.
- An expired, invalid, or missing login is an actual HTTP 401 with `code: 401` and message `未登录或登录已过期`; never send HTTP 200 for an authentication failure.
- Frontend requests use `src/api/http.js`, so its refresh, logout, and toast behavior remains consistent.
- For protected task detail routes, the authorization check applies before data is returned.

## Page loading and long-running tasks

- A newly added page whose first usable view depends on required API data shows `LoadingSpinner fullScreen` until that initial load completes, including the error path.
- A user-triggered action keeps its loading feedback on the relevant button or control; do not replace the whole page unless the action itself changes the page-level state.
- Persist long-running task IDs in the route. Reload task data once when opening or refreshing that route; use polling only when real-time recovery is explicitly required.
- Server-side work that can outlive a client timeout must be persisted and idempotent. Keep remote model/network calls outside database transactions.

## Completion checklist

- Add all six locale entries when new i18n keys are introduced.
- Run the focused build, test, or compilation check for the code changed.
- Stage and commit only files belonging to the current task.
