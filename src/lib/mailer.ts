import nodemailer from 'nodemailer';

function normalizeEnvValue(value: string | undefined) {
  const trimmed = value?.trim() || '';

  if (!trimmed) {
    return '';
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseSecureFlag(value: string, port: number) {
  if (!value) {
    return port === 465;
  }

  return value.toLowerCase() === 'true';
}

export function getMailerConfig() {
  const host = normalizeEnvValue(process.env.EMAIL_HOST) || 'smtp.gmail.com';
  const port = Number.parseInt(normalizeEnvValue(process.env.EMAIL_PORT) || '465', 10);
  const secure = parseSecureFlag(normalizeEnvValue(process.env.EMAIL_SECURE), port);
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const pass = normalizeEnvValue(process.env.EMAIL_PASS);

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
}

export function createMailerTransport() {
  const config = getMailerConfig();

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      minVersion: 'TLSv1.2',
      servername: config.host,
    },
  });
}

export function getMailerSetupError() {
  const config = getMailerConfig();
  const missing: string[] = [];

  if (!config.user) {
    missing.push('EMAIL_USER');
  }

  if (!config.pass) {
    missing.push('EMAIL_PASS');
  }

  if (!config.host) {
    missing.push('EMAIL_HOST');
  }

  if (!config.port || Number.isNaN(config.port)) {
    missing.push('EMAIL_PORT');
  }

  if (!missing.length) {
    return null;
  }

  return `Brakuje konfiguracji SMTP: ${missing.join(', ')}.`;
}

export function formatMailerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('tlsv1 alert internal error') || lowerMessage.includes('ssl3_read_bytes')) {
    return 'Blad polaczenia SMTP. Sprawdz EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE oraz haslo aplikacji Gmail w Vercel.';
  }

  if (
    lowerMessage.includes('invalid login') ||
    lowerMessage.includes('invalid credentials') ||
    lowerMessage.includes('authentication failed') ||
    lowerMessage.includes('username and password not accepted')
  ) {
    return 'Blad logowania do skrzynki SMTP. Sprawdz EMAIL_USER i EMAIL_PASS.';
  }

  if (lowerMessage.includes('certificate')) {
    return 'Blad certyfikatu SMTP. Sprawdz konfiguracje TLS dla skrzynki pocztowej.';
  }

  return message;
}
