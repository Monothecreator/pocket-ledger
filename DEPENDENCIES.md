# Dependency Review

Run `npm ls --depth=0`, `npm audit --omit=dev`, and `npm audit` before release.

## Direct runtime dependencies

| Package | Purpose | Review |
|---|---|---|
| `next` | Application framework and server runtime | Supported Next.js release with installed local documentation reviewed |
| `react`, `react-dom` | User interface rendering | Maintenance status and peer versions checked by npm |
| `@prisma/client`, `@prisma/adapter-pg`, `pg` | PostgreSQL persistence and Prisma access | Runtime audit must remain clean |
| `argon2` | Password hashing | Native install scripts reviewed and maintained package selected |
| `jose` | Signed sessions | Runtime audit must remain clean |
| `zod` | Request validation | Runtime audit must remain clean |
| `ioredis` | Shared distributed rate-limit counters | Fail-closed and Redis health monitoring required |
| `nodemailer` | Verification and recovery SMTP delivery | Use current version; verify SMTP/TLS defaults |
| `otplib` | TOTP MFA provisioning and verification | Current major release with interoperability tests |

## Direct development dependencies

- `prisma`: schema and migrations.
- `typescript`: compile-time validation.
- `vitest`: security and account-control regression tests.
- `eslint` / `eslint-config-next`: lint tooling.
- `tailwindcss` / `@tailwindcss/turbopack`: styling/build tooling.
- Node type packages: TypeScript environment declarations.

## Release checks

1. Run full and production-only dependency audits.
2. Remove packages unused after feature completion.
3. Review maintenance status, release cadence, deprecation notices, and support policy for every direct dependency.
4. Verify transitive advisories and upgrades without forced breaking changes.
5. Do not use `npm audit fix --force` without compatibility review.
6. Pin infrastructure images and validate them in the target environment.
