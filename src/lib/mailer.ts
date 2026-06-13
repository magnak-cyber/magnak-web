import { Resend } from 'resend';

type MailAttachment = {
  filename?: string | false;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  content_type?: string;
  contentId?: string;
  content_id?: string;
};

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

function getResendClient() {
  const apiKey = normalizeEnvValue(process.env.RESEND_API_KEY);

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export function getMailerConfig() {
  return {
    apiKey: normalizeEnvValue(process.env.RESEND_API_KEY),
    from: normalizeEnvValue(process.env.EMAIL_FROM) || 'onboarding@resend.dev',
    to: normalizeEnvValue(process.env.EMAIL_RECEIVER),
  };
}

function toResendAttachments(attachments: MailAttachment[] | undefined) {
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
  const resend = getResendClient();

  if (!resend) {
    throw new Error('Brakuje konfiguracji Resend: RESEND_API_KEY.');
  }

  const from = normalizeEnvValue(mailOptions.from) || getMailerConfig().from;

  const payload = {
    from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    ...(mailOptions.html ? { html: mailOptions.html } : {}),
    ...(mailOptions.text ? { text: mailOptions.text } : {}),
    ...(mailOptions.replyTo ? { replyTo: mailOptions.replyTo } : {}),
    ...(mailOptions.attachments?.length
      ? { attachments: toResendAttachments(mailOptions.attachments) }
      : {}),
  };

  const result = await resend.emails.send(payload as Parameters<typeof resend.emails.send>[0]);

  if (result.error) {
    throw new Error(result.error.message || 'Resend wyslal blad.');
  }

  return result.data;
}

export function getMailerSetupError() {
  const config = getMailerConfig();
  const missing: string[] = [];

  if (!config.apiKey) {
    missing.push('RESEND_API_KEY');
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

  return `Brakuje konfiguracji Resend: ${missing.join(', ')}.`;
}

export function formatMailerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('missing api key')) {
    return 'Brakuje RESEND_API_KEY w Vercel.';
  }

  if (lowerMessage.includes('invalid_from_address') || lowerMessage.includes('from')) {
    return 'EMAIL_FROM musi byc zweryfikowanym adresem w Resend albo onboarding@resend.dev do testow.';
  }

  if (lowerMessage.includes('monthly_quota_exceeded') || lowerMessage.includes('daily_quota_exceeded')) {
    return 'Przekroczono limit wysylki Resend.';
  }

  return message;
}
