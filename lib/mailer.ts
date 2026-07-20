// SERVER-ONLY: Do NOT import from Client Components or browser code.

import nodemailer from "nodemailer";
import { getAppUrl, hasUsableSmtpConfig } from "./server-env";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const verificationUrl = `${getAppUrl()}/auth/verify?token=${token}`;

  if (!hasUsableSmtpConfig()) {
    console.info("[Dev Email] Verification URL:", verificationUrl);
    return;
  }

  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Verifikasi Email VaultMind",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1>Verifikasi Email VaultMind</h1>
        <p>Klik link berikut untuk memverifikasi email kamu:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Link aktif selama 24 jam.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${token}`;

  if (!hasUsableSmtpConfig()) {
    console.info("[Dev Email] Password reset URL:", resetUrl);
    return;
  }

  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Reset Password VaultMind",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1>Reset Password VaultMind</h1>
        <p>Klik link berikut untuk mereset password akun kamu:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Link aktif selama 1 jam. Jika bukan kamu yang meminta, abaikan email ini.</p>
      </div>
    `,
  });
}
