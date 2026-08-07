# CLAUDE.md — litesoc-auth0-marketplace

> Repo-specific guide. Read the workspace root [`../CLAUDE.md`](../CLAUDE.md) first for mission,
> Golden Rules, and the shared agents in `../.claude/agents/` (integration-reviewer, backend,
> security, test-runner, bug-investigator, …) and rules in `../.claude/rules/`. **Do not redefine
> root agents or root rules here** — this file only complements them.

## Purpose
**Auth0 Marketplace integration** — four Auth0 Action integrations that forward authentication
events to `https://api.litesoc.io/collect` via `fetch` `POST`. Gives LiteSOC customers turnkey
auth-event ingestion from their Auth0 tenant. (v2.0.0.)

## Technology stack
- Plain **JavaScript**, CommonJS, targeting the **Auth0 Actions runtime** (Node 18+).
- `private: true` — **not published to any npm/registry**.
- Test: Jest `^29.7`. Lint: ESLint `^8.57`. Makefile + Docker orchestrate `make test`.
- Sends events with **raw `fetch`** to `/collect` — does **not** use the SDK.

## Key directories
- `integration/` — one dir per Auth0 trigger, each containing `integration.action.js`,
  `*.spec.js`, `configuration.json`, `installation_guide.md`:
  - `post-login/`, `post-user-registration/`, `post-change-password/`, `send-phone-message/`.
- `media/` (marketplace assets), `coverage/`.
- `SUBMISSION_CHECKLIST.md` — partner-portal + final submission still **pending**.

## Commands
package.json scripts:
- `test` → `jest`
- `lint` → `eslint integration/**/*.js`
- `lint:fix` → `eslint integration/**/*.js --fix`

Makefile targets: `make test` (loops each integration dir with `npx jest --passWithNoTests`),
`make lint`, `make zip`, `make clean`, `make deploy_init`,
`make deploy_get_token` (curl Auth0 `/oauth/token`), `make install`, `make help`.

## Architecture & boundaries
- Trigger → event-name mapping:
  - `post-login` → `auth.login_success`
  - `post-user-registration` → `auth.login_success`
  - `post-change-password` → `auth.password_reset`
  - `send-phone-message` (MFA) → `auth.mfa_challenge`
- Actions **fail silently**: an ingestion error must **never block the Auth0 login flow**.
- Send only the supported event names; the **server** assigns `severity`/`timestamp`.
- Auth: `X-API-Key` header to `/collect`, key sourced from the Auth0 secret
  `event.secrets.LITESOC_API_KEY`.
- **KNOWN ISSUE — flag on sight:** header-casing is inconsistent across actions
  (`X-API-KEY` vs `X-API-Key`). Standardize on `X-API-Key`.

## External dependencies
- `https://api.litesoc.io/collect` (ingestion).
- Auth0 platform (Actions runtime, `/oauth/token` for deploy tooling).

## Environment variables
Names only — never values:
- Runtime (Auth0 Action): secret `LITESOC_API_KEY`; config var `LITESOC_DEBUG_MODE`.
- Deployment tooling (M2M, host-side): `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`.
- The deployment `AUTH0_*` creds must stay **out of** the runtime action code.

## Security-sensitive code paths
- Each `integration/*/integration.action.js` — builds and sends the `/collect` payload.
  - API key comes **only** from `event.secrets.LITESOC_API_KEY`; never log it.
  - Never include raw passwords, tokens, or PII in the forwarded payload — redact.
  - Fail silently for the login flow, but do not swallow security-relevant errors in logs.

## Database / migration responsibility
None. No schema or migrations.

## Deployment / distribution target
**Auth0 Marketplace submission**: `make zip` → `dist/litesoc-auth0-integration.zip`. No registry
publish, no CHANGELOG, no CI. Submission is manual (release-check) — never auto-submit.

## Cross-repository consumers & dependencies
- Producer for the LiteSOC ingestion API (`lsoc_app` `/collect` contract).
- Keep event names and payload shape in sync with the `lsoc_app` contract, the SDKs, and
  `litesoc-docs`.

## Repo-specific rules & skills pointer
- Local rule: [`.claude/rules/action-security.md`](.claude/rules/action-security.md).
- Root rules/skills apply — see `../.claude/rules/` and `../.claude/skills/`.
