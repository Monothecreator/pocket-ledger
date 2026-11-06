# Pocket Ledger

Pocket Ledger is a Next.js expense-tracking application backed by PostgreSQL. Users can create an account, verify email ownership, add and delete expenses, enable MFA, recover or reset their account, and ask an AI assistant questions about their own expense records.

## Stack

- Next.js 16 and React 19
- PostgreSQL with Prisma
- Redis for shared request-rate counters
- Argon2id for password hashing
- Nodemailer for account email
- OpenAI-compatible API for expense questions
- Docker Compose and Caddy for containerized deployment

## Local development

```powershell
npm ci
npm test
npm run build
npm run lint
npm run dev
```

Production infrastructure settings are checked with:

```powershell
npm run preflight:production
```

External AI and SMTP integration checks are available through:

```powershell
npm run verify:ai
npm run verify:smtp
```

## Security

### Account takeover

**Risk:** weak password storage, automated login attempts, stolen sessions, and compromised account credentials could allow unauthorized account access.

**Control and fixes:**

- Passwords are hashed with Argon2id rather than stored as plaintext.
- Login, recovery, verification, and AI requests use shared Redis rate counters; request handling fails closed when Redis is unavailable.
- Sessions use signed, short-lived, HTTP-only cookies with `SameSite=Lax` and `Secure` enabled outside local development.
- Optional TOTP MFA secrets are encrypted with AES-256-GCM using a deployment-provided key.
- Password recovery and email verification responses use generic outcomes so account existence is not confirmed.

**Evidence:**

- `tests/password.test.ts` verifies Argon2id storage and rejection of an incorrect password.
- `tests/request-security.test.ts` verifies Redis fail-closed behavior and direct trusted proxy-address handling.
- `tests/account-controls.test.ts` verifies account-token hashing and MFA ciphertext handling.

### Cross-user data exposure

**Risk:** expense queries or deletion requests could be executed without an authenticated-owner constraint.

**Control and fixes:**

- Every expense list and deletion query includes the authenticated user ID.
- AI expense context is separately restricted to the authenticated user and limited to normalized records.
- API routes validate authenticated sessions before accessing user data.

**Evidence:**

- `tests/ownership.test.ts` verifies that list and deletion filters always include the authenticated owner.
- `tests/ai-isolation.test.ts` verifies AI context is scoped to the authenticated user and internal cent values are not exposed.

### Account-link token exposure

**Risk:** recovery and email-verification tokens in browser JavaScript could be exposed to browser history, logs, or the client.

**Control and fixes:**

- Tokens are passed only through server-side landing routes.
- Reset and verification pages do not read URL parameters in client code.
- Account token records store SHA-256 hashes rather than plaintext token values.
- Recovery and verification tokens are time-limited and single-use.

**Evidence:**

- `tests/reset-token-url.test.ts` verifies the browser pages do not read token query parameters and server landing routes are used.
- `tests/account-controls.test.ts` verifies a 43-character token is not retained and its hash does not contain the plaintext token.

### Untrusted AI context

**Risk:** expense descriptions could contain prompt-injection text or AI responses could cause cross-user disclosure.

**Control and fixes:**

- The server filters AI context by authenticated user and sends only a bounded set of normalized expense records.
- Expense text remains untrusted data, not a system instruction.
- Provider credentials are supplied through environment variables and never sent from the browser.
- AI output is rendered as React text, not HTML, and is truncated to 4,000 characters.

**Evidence:**

- `tests/ai-isolation.test.ts` verifies user scoping and normalized context.
- `tests/ai-provider.test.ts` verifies provider configuration and response limits.

### Oversized requests and abuse

**Risk:** unusually large request bodies or repeated operations could consume application or Redis capacity.

**Control and fixes:**

- JSON request bodies are rejected over the configured size limit.
- Request schemas validate and bound user-supplied fields.
- Redis-backed counters constrain repeated sensitive operations.

**Evidence:**

- `tests/request-security.test.ts` verifies oversized JSON rejection and fail-closed Redis behavior.

### Containers and deployment secrets

**Risk:** credentials or runtime services could be exposed outside their intended trust boundaries.

**Control and fixes:**

- PostgreSQL, Redis, migrations, and the Mailpit development UI use Docker Compose service isolation and local-only development bindings where appropriate.
- The application container runs as a non-root user.
- Database credentials, sessions, provider credentials, SMTP credentials, MFA encryption keys, and TLS settings are runtime environment values.
- Production preflight checks require the deployment settings before startup.

**Evidence:**

- The production build and 14 Vitest tests passed at the last local verification run.
- `scripts/preflight.mjs` fails when required production configuration is absent.
- Runtime dependency auditing reported zero vulnerabilities at the last local verification run.

## Controls that keep fixes enforced

- Security and build checks run in GitHub Actions on pushes and pull requests.
- Pull requests run the full Vitest suite, production build, production-only dependency audit, Gitleaks, and the Arko gate.
- The Arko gate is report-only by default; repository variable `ARKO_BLOCKING=true` switches findings to blocking mode.
- Sensitive production operations must be protected by GitHub branch protection and passing required status checks.
- Dependency audits and secret-scanning history checks should be run on every release candidate.
- Ownership, token handling, rate limiting, AI context isolation, password storage, and MFA encryption have direct regression tests.

## Production verification that remains external

The repository does not claim these items are live-verified without external infrastructure:

- A live AI provider request requires deployment credentials.
- External SMTP delivery requires a real mail provider.
- HTTPS requires DNS ownership and certificate-routing infrastructure.
- Encrypted PostgreSQL backups require a maintained encryption tool and isolated restore testing.
- Redis high availability requires a managed Redis endpoint or production Redis replication/failover configuration.

See `SECURITY.md`, `OPERATIONS.md`, and `DEPENDENCIES.md` for the production verification procedures and remaining release checks.

## Verification commands

```powershell
npm test
npm run build
npm run lint
npm audit --omit=dev
npm audit
```
