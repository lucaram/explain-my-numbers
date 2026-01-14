// /lib/email.ts
import { Resend } from "resend";

type SendMagicLinkParams = {
  to: string;
  verifyUrl: string;
  trialDays: number;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing ${name} env var`);
  return String(v).trim();
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendMagicLinkEmail({ to, verifyUrl, trialDays }: SendMagicLinkParams) {
  const RESEND_API_KEY = mustEnv("RESEND_API_KEY");
  const EMAIL_FROM = mustEnv("EMAIL_FROM"); // e.g. "Explain My Numbers <noreply@yourdomain.com>"
  const APP_NAME = (process.env.APP_NAME || "Explain My Numbers").trim();

  const resend = new Resend(RESEND_API_KEY);

  const subject = `Your magic link (${trialDays}-day free trial)`;

  const safeApp = escapeHtml(APP_NAME);
  const safeUrl = escapeHtml(verifyUrl);

  const text = [
    `${APP_NAME}`,
    ``,
    `Here’s your magic link to start your ${trialDays}-day unlimited trial:`,
    verifyUrl,
    ``,
    `This link expires soon for security.`,
  ].join("\n");

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5;">
    <h2 style="margin:0 0 12px 0;">${safeApp}</h2>
    <p style="margin:0 0 14px 0;">Here’s your magic link to start your <strong>${trialDays}-day</strong> unlimited trial:</p>
    <p style="margin:0 0 18px 0;">
      <a href="${safeUrl}" style="display:inline-block; padding:10px 14px; border-radius:10px; text-decoration:none; border:1px solid #ddd;">
        Sign in
      </a>
    </p>
    <p style="margin:0; color:#666; font-size:13px;">This link expires soon for security.</p>
    <p style="margin:18px 0 0 0; color:#666; font-size:13px;">If the button doesn’t work, paste this into your browser:</p>
    <p style="margin:6px 0 0 0; font-size:13px; word-break:break-all;">${safeUrl}</p>
  </div>
  `.trim();

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { ok: true as const };
}
