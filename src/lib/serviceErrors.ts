import { formatMailerError } from '@/lib/mailer';

export function formatServiceError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('mongodb_uri is invalid') ||
    lowerMessage.includes('mongoserverselectionerror') ||
    lowerMessage.includes('server selection timed out') ||
    lowerMessage.includes('querysrv') ||
    lowerMessage.includes('ssl3_read_bytes') ||
    lowerMessage.includes('tlsv1 alert') ||
    lowerMessage.includes('unable to verify the first certificate')
  ) {
    return 'Blad polaczenia z MongoDB. Sprawdz MONGODB_URI, MONGODB_DB_NAME oraz dostep sieciowy w Mongo Atlas.';
  }

  return formatMailerError(error);
}
