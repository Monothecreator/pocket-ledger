const required = [
  "POSTGRES_PASSWORD", "SESSION_SECRET", "REDIS_URL", "PUBLIC_BASE_URL",
  "AI_API_KEY", "AI_BASE_URL", "AI_MODEL", "SMTP_HOST", "SMTP_USER", "SMTP_PASS",
  "SMTP_FROM", "SMTP_REQUIRE_TLS", "MFA_ENCRYPTION_KEY", "APP_DOMAIN", "ACME_EMAIL",
];
const missing = required.filter((name) => !process.env[name]?.trim());
for (const name of required) {
  console.log(`${name}: ${process.env[name]?.trim() ? "configured" : "missing"}`);
}
if (missing.length) {
  console.error(`Preflight failed: ${missing.length} required setting(s) missing.`);
  process.exit(1);
}
console.log("Production preflight passed.");
