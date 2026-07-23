---
name: xander-lab-guardrails
description: Apply Xander Lab API, authentication, task-page, and loading-state guardrails when implementing or reviewing frontend or backend features.
---

# Xander Lab Guardrails

## API and authentication

- Java and Node errors use `{ "code": number, "message": string, "data": null }`.
- 400 / 401 / 403 / 404 / 5xx are real HTTP responses, never HTTP 200 envelopes. Custom business codes must map to the corresponding HTTP status.
- An expired, invalid, or missing login returns HTTP 401 with the canonical login-expired message.
- Frontend requests use `src/api/http.js` so refresh, logout, and Toast handling stays consistent.

## Page loading and long-running tasks

- A new page whose first usable state needs API data uses `LoadingSpinner fullScreen` until that request settles, including errors.
- A user-triggered action uses button-level loading unless it replaces the complete page state.
- Persist long-running task IDs in routes and restore the saved task on refresh. Do not poll unless real-time recovery is explicitly required.
- Keep remote model/network calls outside database transactions and make timeout-prone mutations idempotent.

## Completion checklist

- Update all six locales for any new i18n key.
- Never commit credentials or local runtime configuration.
- Run focused validation and stage only task files.
