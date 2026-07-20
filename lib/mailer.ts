// SERVER-ONLY: Do NOT import from Client Components or browser code.
// Mailketing API integration — same as FinePro
// Docs: https://mailketing.co.id/docs/send-email-via-api/

import { getAppUrl, getMailketingConfig } from "./server-env";

const MAILKETING_API_URL = "https://api.mailketing.co.id/api/v1/send";

function redactEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email ? "***" : "";
  return `${name.slice(0, 2)}***@${domain}`;
}

async function sendViaMailketing({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { apiToken, fromEmail, fromName } = getMailketingConfig();

  const body = new URLSearchParams({
    api_token: apiToken,
    from_name: fromName,
    from_email: fromEmail,
    recipient: to,
    subject,
    content: html,
  });

  const res = await fetch(MAILKETING_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const responseText = await res.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = null;
  }

  const status = String(data?.status ?? "").toLowerCase();

  if (!res.ok || status !== "success") {
    const reason = data?.response || responseText || res.statusText || `HTTP ${res.status}`;
    console.error("[mailer] Mailketing failed", {
      statusCode: res.status,
      to: redactEmail(to),
      subject,
      reason,
    });
    throw new Error(`Mailketing gagal: ${reason}`);
  }

  console.info("[mailer] Mailketing sent", {
    to: redactEmail(to),
    subject,
    response: data?.response || "Mail Sent",
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${getAppUrl()}/auth/verify?token=${token}`;

  await sendViaMailketing({
    to: email,
    subject: "Verifikasi Email VaultMind",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://vaultmind.my.id/logo-vaultmind.webp" alt="VaultMind" style="height: 48px;" />
        </div>
        <h1 style="font-size: 20px; color: #1e293b;">Verifikasi Email VaultMind</h1>
        <p style="font-size: 15px; color: #475569;">Klik tombol berikut untuk memverifikasi email akun VaultMind kamu:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #22d3ee); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 14px; font-weight: 700; font-size: 14px;">
            Verifikasi Email
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Link aktif selama 24 jam. Jika bukan kamu yang mendaftar, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">VaultMind — Zero-knowledge password manager</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`;

  await sendViaMailketing({
    to: email,
    subject: "Reset Password VaultMind",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="https://vaultmind.my.id/logo-vaultmind.webp" alt="VaultMind" style="height: 48px;" />
        </div>
        <h1 style="font-size: 20px; color: #1e293b;">Reset Password VaultMind</h1>
        <p style="font-size: 15px; color: #475569;">Klik tombol berikut untuk mereset password akun VaultMind kamu:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #f97316); color: #fff; text-decoration: none; padding: 14px 36px; border-radius: 14px; font-weight: 700; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Link aktif selama 1 jam. Jika bukan kamu yang meminta, abaikan email ini.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">VaultMind — Zero-knowledge password manager</p>
      </div>
    `,
  });
}
