const PLACEHOLDER_PREFIXES = ["GANTI_DENGAN_", "CHANGE_ME_", "TODO_"];

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PREFIXES.some((prefix) => value.startsWith(prefix));
}

export function getRequiredServerEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value || isPlaceholder(value)) {
    throw new Error(`Missing or unsafe server env: ${name}`);
  }

  return value;
}

export function getAppUrl(): string {
  return getRequiredServerEnv("APP_URL").replace(/\/$/, "");
}

export function getDatabaseUrl(): string {
  return getRequiredServerEnv("DATABASE_URL");
}

export function getJwtAccessSecret(): string {
  return getRequiredServerEnv("JWT_ACCESS_SECRET");
}

export function hasUsableSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM &&
      process.env.SMTP_USER !== "email@kamu.com" &&
      process.env.SMTP_PASS !== "app_password_gmail",
  );
}
