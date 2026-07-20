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

export function getMailketingConfig(): {
  apiToken: string;
  fromEmail: string;
  fromName: string;
} {
  return {
    apiToken: getRequiredServerEnv("MAILKETING_API_TOKEN"),
    fromEmail: getRequiredServerEnv("MAILKETING_FROM_EMAIL"),
    fromName: process.env.MAILKETING_FROM_NAME?.trim() || "VaultMind",
  };
}

export function hasUsableSmtpConfig(): boolean {
  // Mailketing always used in production — this stays for backward compat
  return Boolean(process.env.MAILKETING_API_TOKEN);
}
