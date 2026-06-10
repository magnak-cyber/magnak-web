import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

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

function normalizePassword(value: string | undefined, host: string) {
  const normalized = normalizeEnvValue(value);

  if (!normalized) {
    return '';
  }

  if (host.includes('gmail')) {
    return normalized.replace(/\s+/g, '');
  }

  return normalized;
}

export function getMailerConfig() {
  const host = normalizeEnvValue(process.env.EMAIL_HOST) || 'smtp.gmail.com';
  const port = Number.parseInt(normalizeEnvValue(process.env.EMAIL_PORT) || '465', 10);
  const secure = parseSecureFlag(normalizeEnvValue(process.env.EMAIL_SECURE), port);
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const pass = normalizePassword(process.env.EMAIL_PASS, host);

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
}

function createConfiguredTransport() {
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

function createGmailStartTlsTransport() {
  const config = getMailerConfig();

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      minVersion: 'TLSv1.2',
      servername: 'smtp.gmail.com',
    },
  });
}

function createGmailServiceTransport() {
  const config = getMailerConfig();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

function shouldRetryWithGmailFallback(error: unknown) {
  const config = getMailerConfig();
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (!config.host.includes('gmail')) {
    return false;
  }

  return (
    lowerMessage.includes('tlsv1 alert internal error') ||
    lowerMessage.includes('ssl3_read_bytes') ||
    lowerMessage.includes('ssl alert number 80') ||
    lowerMessage.includes('esocket')
  );
}

export async function sendMail(mailOptions: Mail.Options) {
  try {
    return await createConfiguredTransport().sendMail(mailOptions);
  } catch (firstError) {
    if (!shouldRetryWithGmailFallback(firstError)) {
      throw firstError;
    }

    try {
      return await createGmailStartTlsTransport().sendMail(mailOptions);
    } catch (secondError) {
      try {
        return await createGmailServiceTransport().sendMail(mailOptions);
      } catch (thirdError) {
        const firstMessage = firstError instanceof Error ? firstError.message : String(firstError);
        const secondMessage = secondError instanceof Error ? secondError.message : String(secondError);
        const thirdMessage = thirdError instanceof Error ? thirdError.message : String(thirdError);

        throw new Error(
          `SMTP fallback failed. primary=${firstMessage}; starttls=${secondMessage}; gmail_service=${thirdMessage}`
        );
      }
    }
  }
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

  if (lowerMessage.includes('smtp fallback failed')) {
    return `Blad SMTP Gmail po wszystkich probach. Szczegoly: ${message}`;
  }

  if (lowerMessage.includes('tlsv1 alert internal error') || lowerMessage.includes('ssl3_read_bytes')) {
    return 'Blad polaczenia SMTP z Gmail. Ustaw w Vercel EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587, EMAIL_SECURE=false oraz poprawne haslo aplikacji Gmail.';
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
