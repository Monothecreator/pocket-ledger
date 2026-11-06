import nodemailer from "nodemailer";

export async function sendMail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  if (!host || !from) throw new Error("SMTP is not configured");
  const secure = port === 465;
  const requireTls = process.env.SMTP_REQUIRE_TLS ? process.env.SMTP_REQUIRE_TLS === "true" : !secure;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    requireTLS: requireTls,
  });
  await transport.sendMail({ from, to, subject, text });
}
