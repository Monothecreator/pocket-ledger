# Pocket Ledger Operations

## HTTPS and reverse proxy

Run one TLS-terminating reverse proxy in front of the app in production. It must:

- overwrite trusted `X-Real-IP`, never append client-controlled forwarding chains;
- redirect HTTP to HTTPS;
- set HSTS only after HTTPS is stable;
- forward `Host` and `X-Forwarded-Proto` consistently;
- expose port 3000 only to the proxy network, not the public internet.

For Docker Compose, keep PostgreSQL, Redis, migration, and Mailpit out of public port mappings. Mailpit's port binding is local-only and must be disabled or protected in production.

## PostgreSQL backups

Take encrypted backups on a schedule outside the database container volume:

```powershell
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
docker compose exec -T db pg_dump -U $env:POSTGRES_USER -d $env:POSTGRES_DB -Fc > "pocket-ledger-$timestamp.dump"
```

Test restores regularly into an isolated database. Define retention and encryption at the destination, and do not store unencrypted dumps in repository paths or source control.

## Backup verification status

A PostgreSQL custom-format dump was created and `pg_restore --list` confirmed table and data entries for `User`, `Expense`, and `AccountToken`. Encryption could not be executed in this environment because no maintained host/container encryption tool was available. Production encryption must use a reviewed tool or managed backup encryption before any dump leaves the trusted host.

Perform the restore into an isolated database named `pocket_ledger_restore`:

```powershell
# Run only against the isolated restore database.
docker compose exec -T db createdb -U $env:POSTGRES_USER pocket_ledger_restore
docker compose exec db sh -c 'pg_restore --clean --if-exists --no-owner -d pocket_ledger_restore /tmp/pocket-ledger.dump'
docker compose exec -T db psql -U $env:POSTGRES_USER -d pocket_ledger_restore -c 'SELECT count(*) FROM "User";'
```

## Redis backups and availability

Redis currently holds rate-limit counters and has persistence enabled. Counters can be recreated; therefore Redis is fail-closed for auth/AI but does not contain business records.

Monitor:
- Redis memory utilization and evictions;
- Redis healthcheck failures;
- Redis replication/primary health where managed Redis is used;
- sustained 503/429 response rates caused by Redis outage.

For multi-replica production, use managed Redis HA or Redis replication plus one logical endpoint. Do not rely on one local container as the durable control plane.

## MFA encryption-key rotation

MFA secrets are encrypted with `MFA_ENCRYPTION_KEY`. Before rotation:

1. Export encrypted ciphertext rows from a secured database backup.
2. Decrypt each ciphertext using the old key.
3. Re-encrypt each secret using a newly generated 32-byte base64url key.
4. Upgrade ciphertext atomically in a maintenance transaction.
5. Verify TOTP login for a test account.
6. Revoke the old key only after rollback retention expires.

Generate a new key locally:

```powershell
python -c "import secrets,base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('='))"
```

Never print or commit the generated key. Store it in the production secret manager and inject it into all app replicas during rotation.

## Logs and monitoring

Application logs must contain:
- route/context name;
- error class, not stack trace text;
- request ID assigned by the proxy;

They must not contain:
- passwords or MFA codes;
- recovery or verification tokens;
- AI/API/provider keys;
- SMTP credentials;
- email bodies containing account links;
- database connection strings;
- raw exception messages containing user or request payloads.

Forward only sanitized structured logs to centralized monitoring.

## External provider verification

Run only with environment-injected credentials:

```powershell
npm run verify:ai
npm run verify:smtp
```

The commands print status only and never print API keys, SMTP passwords, provider responses, or full email contents.

## Encryption and backup tools

Install and pin a maintained `age` release before running encrypted backups. The repository does not invoke a custom crypto implementation.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/backup-postgres.ps1 -Recipient age1recipient...
```

Test encrypted restore in an isolated database and verify application table counts. Restore must never use production credentials or target the production database.

## HTTPS deployment status for pocket-ledger.com

On 2026-11-06, DNS resolved the domain to 199.36.158.100 and ports 80/443 were reachable, but public HTTP/HTTPS challenges returned another service. Caddy was stopped and certificate issuance was not completed.

Before retrying:
1. Confirm DNS ownership and point all public records for this host to the intended server.
2. Ensure ports 80/443 terminate at this host's Caddy instance.
3. Remove conflicting proxy or CDN behavior from those paths.
4. Verify `/.well-known/acme-challenge/` reaches Caddy.
5. Re-start only after public challenge routing succeeds.
