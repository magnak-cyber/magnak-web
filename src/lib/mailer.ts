import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { normalizeEnvValue } from '@/lib/env';

type MailAttachment = {
  filename?: string | false;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  content_type?: string;
  contentId?: string;
  content_id?: string;
};

function parsePort(value: string) {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : 465;
}

function isTruthy(value: string) {
  return value === 'true' || value === '1' || value === 'yes';
}

function isGmailHost(host: string) {
  return host.toLowerCase().includes('gmail');
}

export function getMailerConfig() {
  const port = parsePort(normalizeEnvValue(process.env.EMAIL_PORT) || '465');
  const host = normalizeEnvValue(process.env.EMAIL_HOST) || 'smtp.gmail.com';
  const secureEnv = normalizeEnvValue(process.env.EMAIL_SECURE).toLowerCase();
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const secure =
    isGmailHost(host) && port === 587
      ? false
      : isGmailHost(host) && port === 465
        ? true
        : secureEnv
          ? isTruthy(secureEnv)
          : port === 465;

  return {
    host,
    port,
    secure,
    user,
    pass: normalizeEnvValue(process.env.EMAIL_PASS),
    from: normalizeEnvValue(process.env.EMAIL_FROM) || user,
    to: normalizeEnvValue(process.env.EMAIL_RECEIVER),
  };
}

function buildTransportConfig(config: ReturnType<typeof getMailerConfig>) {
  return {
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      servername: config.host,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  } satisfies SMTPTransport.Options;
}

function shouldRetryWithGmailStartTls(
  error: unknown,
  config: ReturnType<typeof getMailerConfig>
) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  return (
    isGmailHost(config.host) &&
    config.secure &&
    config.port === 465 &&
    (
      lowerMessage.includes('unexpected socket close') ||
      lowerMessage.includes('ssl3_read_bytes') ||
      lowerMessage.includes('tlsv1 alert') ||
      lowerMessage.includes('esocket') ||
      lowerMessage.includes('wrong version number')
    )
  );
}

function toMailAttachments(attachments: MailAttachment[] | undefined) {
  if (!attachments?.length) {
    return undefined;
  }

  return attachments.map((attachment) => ({
    filename: attachment.filename,
    content: attachment.content,
    path: attachment.path,
    contentType: attachment.contentType || attachment.content_type,
    contentId: attachment.contentId || attachment.content_id,
  }));
}

export async function sendMail(mailOptions: {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: MailAttachment[];
  replyTo?: string | string[];
}) {
  const config = getMailerConfig();
  const payload = {
    from: normalizeEnvValue(mailOptions.from) || config.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    ...(mailOptions.html ? { html: mailOptions.html } : {}),
    ...(mailOptions.text ? { text: mailOptions.text } : {}),
    ...(mailOptions.replyTo ? { replyTo: mailOptions.replyTo } : {}),
    ...(mailOptions.attachments?.length
      ? { attachments: toMailAttachments(mailOptions.attachments) }
      : {}),
  };

  try {
    const transporter = nodemailer.createTransport(buildTransportConfig(config));
    return await transporter.sendMail(payload);
  } catch (error) {
    if (!shouldRetryWithGmailStartTls(error, config)) {
      throw error;
    }

    const fallbackConfig = {
      ...config,
      port: 587,
      secure: false,
    };

    const transporter = nodemailer.createTransport(buildTransportConfig(fallbackConfig));
    return transporter.sendMail(payload);
  }
}

export function getMailerSetupError() {
  const config = getMailerConfig();
  const missing: string[] = [];

  if (!config.host) {
    missing.push('EMAIL_HOST');
  }

  if (!config.port) {
    missing.push('EMAIL_PORT');
  }

  if (!config.user) {
    missing.push('EMAIL_USER');
  }

  if (!config.pass) {
    missing.push('EMAIL_PASS');
  }

  if (!config.from) {
    missing.push('EMAIL_FROM');
  }

  if (!config.to) {
    missing.push('EMAIL_RECEIVER');
  }

  if (!missing.length) {
    return null;
  }

  return `Brakuje konfiguracji SMTP: ${missing.join(', ')}.`;
}

export function formatMailerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('missing credentials')) {
    return 'Brakuje danych logowania SMTP. Ustaw EMAIL_USER i EMAIL_PASS w Vercel.';
  }

  if (
    lowerMessage.includes('invalid login') ||
    lowerMessage.includes('badcredentials') ||
    lowerMessage.includes('username and password not accepted')
  ) {
    return 'Gmail odrzucil logowanie SMTP. Sprawdz EMAIL_USER i haslo aplikacji w EMAIL_PASS.';
  }

  if (
    lowerMessage.includes('ssl3_read_bytes') ||
    lowerMessage.includes('tlsv1 alert') ||
    lowerMessage.includes('unexpected socket close') ||
    lowerMessage.includes('connection closed unexpectedly') ||
    lowerMessage.includes('esocket') ||
    lowerMessage.includes('wrong version number')
  ) {
    return 'Blad polaczenia SMTP z Gmail. Ustaw EMAIL_HOST=smtp.gmail.com, EMAIL_PORT=587, EMAIL_SECURE=false oraz poprawne haslo aplikacji Gmail.';
  }

  if (lowerMessage.includes('certificate') || lowerMessage.includes('self signed')) {
    return 'Blad certyfikatu podczas polaczenia SMTP. Sprawdz ustawienia Gmail SMTP oraz bezpieczne polaczenie TLS.';
  }

  return message;
}
