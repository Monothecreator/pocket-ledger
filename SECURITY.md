# Pocket Ledger Security Review

## Hostile-review status

- Critical: None identified in implemented ownership filters.
- High: In-memory rate limiting has been replaced by shared Redis counters, but Redis availability is fail-closed.
- High: Account recovery and verification tokens are stored hashed and expire after one hour or 24 hours respectively; plaintext links exist only in delivery.
- High: Prompt instructions are not a security boundary. Expense text remains untrusted model context; server-side filtering is the authorization boundary.
- Medium: Forwarded IP headers must be overwritten by a trusted reverse proxy. The app intentionally uses only `X-Real-IP`; direct clients and untrusted proxy chains must not control it.
- Medium: Provider responses are rendered as React text rather than HTML and truncated to 4,000 characters.
- Medium: Distributed login lockout has not been added beyond sliding Redis counters.

## Verification completed

- Production build: passed.
- Security and provider tests: 12 passed.
- Production dependency audit: 0 vulnerabilities.
- Fresh PostgreSQL, Redis, application, migration, and Mailpit volumes started successfully.
- Automatic signup verification email was delivered to local Mailpit.
- PostgreSQL custom-format backup contained User, Expense, and AccountToken tables and data sections.
- Gitleaks history scan passed over one commit.

## External verification remaining

- Live AI-provider request: blocked because AI_API_KEY, AI_BASE_URL, and AI_MODEL are absent.
- Real SMTP-provider delivery: blocked because external SMTP credentials are absent; local Mailpit delivery passed.
- HTTPS certificates: require a production domain and certificate infrastructure.
- Encrypted backup storage and isolated restore: blocked because no reviewed encryption tool was available in the host/container; plain backup structure passed.
- Maintenance verification for all transitive dependencies requires a release-time registry and maintenance review.

## Dependencies

Run `npm audit --omit=dev`, `npm audit`, and `npm ls --depth=0` before release. Development tooling currently reports moderate ESLint advisories. Review upgrades without forced breaking changes.

## Secret and history checks

- Never commit `.env`, database credentials, AI keys, session secrets, MFA keys, SMTP credentials, or recovery links.
- Pin and run a maintained secret scanner in CI over both tracked files and full Git history.
- Rotate any exposed secret immediately and replace the runtime environment value.

## Threat model

Assets:
- Password hashes
- Email addresses
- Expense data and categories
- Session tokens
- Recovery and verification links
- MFA secrets and encrypted keys
- AI provider credentials
- SMTP credentials
- Database and Redis credentials

Entry points:
- Signup/login/logout/recovery/reset/verification/MFA routes
- Expense create/list/delete routes
- AI spending route
- Docker Compose environment and backing services

Top risks and controls:
1. Account takeover: Argon2id, generic errors, Redis counters, and optional MFA.
2. Cross-user data access: authenticated user ID included in every expense query/delete.
3. Session theft: HTTP-only, SameSite=Lax, Secure-in-production, short-lived signed cookies.
4. AI data exposure: server-side filtering, bounded context, provider key environment isolation, text rendering, and truncation.
5. Recovery token theft: SHA-256 storage, expiry, single use, SMTP delivery, and generic responses.
6. MFA compromise: AES-256-GCM encryption with environment key and no plaintext secret response.
7. Redis/proxy abuse: distributed counters, fail-closed behavior, trusted proxy header setup.
8. Container secret compromise: non-root runtime, ignored env files, runtime secrets, and local-only Mailpit UI.

## Confidence and verification

Confidence is high for source-local ownership, password hashing, token handling, local SMTP, Docker startup, Redis limiting, and provider client behavior. Verify live provider retention, SMTP provider controls, TLS certificates, backup encryption, key rotation, and Redis HA against official vendor documentation before production.
