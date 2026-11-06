import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_VERIFY_TO } = process.env;
if (!SMTP_HOST || !SMTP_FROM || !SMTP_VERIFY_TO) {
  console.error("Missing SMTP_HOST, SMTP_FROM, or SMTP_VERIFY_TO.");
  process.exit(2);
}
const port = Number(SMTP_PORT ?? 587);
const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  requireTLS: process.env.SMTP_REQUIRE_TLS === "true",
});
await transport.verify();
await transport.sendMail({
  from: SMTP_FROM,
  to: SMTP_VERIFY_TO,
  subject: "Pocket Ledger SMTP verification",
  text: "This temporary message verifies SMTP delivery. Do not reply.",
});
console.log("SMTP connection and test delivery verified.");
