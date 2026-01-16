// src/lib/email.ts
import { Resend } from "resend";

export type SendMagicLinkParams = {
  to: string;
  verifyUrl: string;
  mode: "trial" | "subscribe";
  trialDays?: number;
};

export async function sendMagicLinkEmail({
  to,
  verifyUrl,
  mode,
  trialDays,
}: SendMagicLinkParams) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_FROM = process.env.EMAIL_FROM;

  if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
  if (!EMAIL_FROM) throw new Error("Missing EMAIL_FROM");

  const resend = new Resend(RESEND_API_KEY);

  const isTrial = mode === "trial";
  const days = trialDays ?? 3;

  const subject = isTrial
    ? `Your magic link to start your ${days}-day free trial`
    : `Your magic link to subscribe`;

  const title = isTrial ? "Start your free trial" : "Continue to subscription";
  const subtitle = isTrial
    ? `Click the button below to start your ${days}-day trial. No card required.`
    : "Click the button below and you’ll be redirected to secure Stripe Checkout.";

  const buttonText = isTrial ? "Start free trial" : "Go to Checkout";

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#0b0b0c; padding:32px;">
    <div style="max-width:560px; margin:0 auto; background:#111113; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:28px;">
      <div style="color:#fff; font-size:22px; font-weight:700; margin-bottom:10px;">${title}</div>
      <div style="color:rgba(255,255,255,0.75); font-size:14px; line-height:1.6; margin-bottom:18px;">
        ${subtitle}
      </div>
      <a href="${verifyUrl}"
         style="display:inline-block; background:#f5c542; color:#111; padding:12px 16px; border-radius:14px; font-weight:700; text-decoration:none;">
        ${buttonText}
      </a>
      <div style="color:rgba(255,255,255,0.55); font-size:12px; line-height:1.6; margin-top:16px;">
        This link expires in 15 minutes. If you didn’t request this, you can ignore this email.
      </div>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
}
