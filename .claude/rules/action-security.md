---
title: Auth0 Action Security
scope: litesoc-auth0-marketplace
applies_to:
  - "integration/**/*.js"
---

# Auth0 Action Security

- **Fail silently for the login flow**: an ingestion failure must never block or delay Auth0 login.
  But do **not** silently swallow security-relevant errors in logs — surface them (respecting
  `LITESOC_DEBUG_MODE`).
- The API key comes **only** from `event.secrets.LITESOC_API_KEY`. Never log it, never hardcode it,
  never echo it into responses.
- **Standardize the `X-API-Key` header casing** across all four actions (fix the `X-API-KEY` vs
  `X-API-Key` inconsistency).
- Send **only** the supported event names; the server assigns `severity`/`timestamp`.
- **Never** include raw passwords, tokens, or PII in the forwarded `/collect` payload — redact.
- Keep deployment M2M credentials (`AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`) out of
  the runtime action code.
- Validate changes with `make test` / `npm test` + `npm run lint`.
- **Distribution is the Auth0 Marketplace zip (release-check)** — never auto-submit.
