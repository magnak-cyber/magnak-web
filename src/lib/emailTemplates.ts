import { AdminSiteSettings, PublicSiteSettings } from '@/types/site-settings';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function emailHref(value: string) {
  return `mailto:${escapeHtml(value)}`;
}

function phoneHref(value: string) {
  return `tel:${escapeHtml(value.replace(/[^\d+]/g, ''))}`;
}

function renderShell({
  logoUrl: _logoUrl,
  companyName,
  title,
  subtitle,
  body,
  footer,
}: {
  logoUrl: string;
  companyName: string;
  title: string;
  subtitle: string;
  body: string;
  footer: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="pl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>
          :root { color-scheme: light dark; supported-color-schemes: light dark; }
          body {
            margin: 0;
            padding: 0;
            background: #eceff3;
            color: #16181d;
            font-family: Onest, Arial, sans-serif;
          }
          .wrapper {
            width: 100%;
            padding: 24px 12px;
            background:
              radial-gradient(circle at top, rgba(255, 255, 255, 0.45), transparent 30%),
              #eceff3;
          }
          .card {
            max-width: 640px;
            margin: 0 auto;
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid #d8dde5;
            background: #ffffff;
            box-shadow: 0 24px 70px rgba(17, 24, 39, 0.08);
          }
          .hero,
          .footer {
            background: #f3f5f8;
          }
          .hero {
            padding: 28px 28px 22px;
            text-align: center;
            border-bottom: 1px solid #dde3ea;
          }
          .company {
            margin: 0;
            color: #16181d;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.03em;
          }
          .subtitle {
            margin: 12px 0 0;
            color: #5f6875;
            font-size: 15px;
            line-height: 1.6;
          }
          .content {
            padding: 28px;
            color: #16181d;
          }
          .panel {
            border: 1px solid #dde3ea;
            border-radius: 16px;
            overflow: hidden;
            background: #fbfcfd;
          }
          .panel table {
            width: 100%;
            border-collapse: collapse;
          }
          .panel td {
            padding: 14px 16px;
            vertical-align: top;
            border-bottom: 1px solid #e8ecf1;
            font-size: 14px;
            line-height: 1.55;
          }
          .panel tr:last-child td {
            border-bottom: none;
          }
          .label {
            width: 34%;
            color: #66707d;
            font-weight: 600;
          }
          .value {
            color: #16181d;
          }
          .lead {
            margin: 0 0 18px;
            color: #303641;
            font-size: 15px;
            line-height: 1.7;
          }
          .footer {
            padding: 20px 28px 28px;
            color: #66707d;
            font-size: 13px;
            line-height: 1.6;
            border-top: 1px solid #dde3ea;
          }
          .accent,
          a,
          a:visited,
          a:hover,
          a:active {
            color: #c7a032;
            text-decoration: none;
          }
          @media (prefers-color-scheme: dark) {
            body {
              background: #0f1115 !important;
              color: #f3f4f6 !important;
            }
            .wrapper {
              background:
                radial-gradient(circle at top, rgba(255, 255, 255, 0.06), transparent 30%),
                #0f1115 !important;
            }
            .card {
              background: #14171c !important;
              border-color: #262b33 !important;
              box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35) !important;
            }
            .hero,
            .footer {
              background: #191d23 !important;
              border-color: #262b33 !important;
            }
            .company,
            .content,
            .lead,
            .value {
              color: #f3f4f6 !important;
            }
            .subtitle,
            .label,
            .footer {
              color: #9ca3af !important;
            }
            .panel {
              background: #12151a !important;
              border-color: #262b33 !important;
            }
            .panel td {
              border-bottom-color: #22262d !important;
            }
            .accent,
            a,
            a:visited,
            a:hover,
            a:active {
              color: #d7b04c !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="hero">
              <h1 class="company">${escapeHtml(companyName)}</h1>
              <p class="subtitle">${subtitle}</p>
            </div>
            <div class="content">
              <p class="lead"><strong>${title}</strong></p>
              ${body}
            </div>
            <div class="footer">${footer}</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderOrderDetails(details: Array<{ label: string; value: string }>) {
  return `
    <div class="panel">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        ${details
          .map(
            (detail) => `
          <tr>
            <td class="label">${escapeHtml(detail.label)}</td>
            <td class="value">${escapeHtml(detail.value)}</td>
          </tr>
        `
          )
          .join('')}
      </table>
    </div>
  `;
}

export function buildAdminOrderEmail(input: {
  settings: AdminSiteSettings;
  logoUrl: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  packageType: string;
  startDate: string;
  additionalInfo: string;
  attachmentLabel?: string | null;
}) {
  const details = [
    { label: 'Imie i nazwisko', value: input.name },
    { label: 'Telefon', value: input.phone },
    { label: 'Email', value: input.email },
    { label: 'Lokalizacja', value: input.location || 'N/A' },
    { label: 'Rodzaj remontu', value: input.packageType || 'N/A' },
    { label: 'Preferowana data startu', value: input.startDate || 'N/A' },
    { label: 'Dodatkowe informacje', value: input.additionalInfo || 'N/A' },
  ];

  if (input.attachmentLabel) {
    details.push({ label: 'Zalaczony plik', value: input.attachmentLabel });
  }

  return renderShell({
    logoUrl: input.logoUrl,
    companyName: input.settings.companyName,
    title: 'Nowe zgloszenie z formularza kontaktowego',
    subtitle: 'Masz nowe zapytanie z kompletem danych klienta.',
    body: renderOrderDetails(details),
    footer: `Powiadomienie zostalo wyslane na adres <a class="accent" href="${emailHref(input.settings.notificationEmail)}">${escapeHtml(input.settings.notificationEmail)}</a>.`,
  });
}

export function buildCustomerOrderEmail(input: {
  settings: PublicSiteSettings;
  logoUrl: string;
  name: string;
}) {
  return renderShell({
    logoUrl: input.logoUrl,
    companyName: input.settings.companyName,
    title: `Dziekujemy za kontakt, ${escapeHtml(input.name)}.`,
    subtitle: 'Potwierdzamy przyjecie Twojego zgloszenia.',
    body: `
      <p class="lead">
        Otrzymalismy Twoja wiadomosc i dziekujemy za zainteresowanie uslugami ${escapeHtml(input.settings.companyName)}.
      </p>
      <p class="lead">
        Skontaktujemy sie z Toba mozliwie szybko, aby omowic szczegoly projektu i kolejne kroki.
      </p>
      <p class="lead">
        W razie dodatkowych pytan mozesz odpowiedziec na te wiadomosc albo napisac na
        <a class="accent" href="${emailHref(input.settings.publicEmail)}">${escapeHtml(input.settings.publicEmail)}</a>.
      </p>
    `,
    footer: `Kontakt: <a class="accent" href="${emailHref(input.settings.publicEmail)}">${escapeHtml(input.settings.publicEmail)}</a> | <a class="accent" href="${phoneHref(input.settings.publicPhone)}">${escapeHtml(input.settings.publicPhone)}</a>`,
  });
}

export function buildAdminCodeEmail(input: {
  settings: PublicSiteSettings;
  logoUrl: string;
  code: string;
}) {
  return renderShell({
    logoUrl: input.logoUrl,
    companyName: input.settings.companyName,
    title: 'Kod potwierdzajacy logowanie do panelu administratora',
    subtitle: 'Uzyj ponizszego kodu, aby bezpiecznie zalogowac sie do panelu.',
    body: `
      <div class="panel" style="text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 22px 16px; text-align:center;">
              <div style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #16181d;">
                ${escapeHtml(input.code)}
              </div>
              <div style="margin-top: 10px; color: #66707d; font-size: 13px;">
                Kod jest wazny przez 10 minut.
              </div>
            </td>
          </tr>
        </table>
      </div>
    `,
    footer: `Jesli to nie Ty probujesz sie zalogowac, zignoruj te wiadomosc lub skontaktuj sie z nami: <a class="accent" href="${emailHref(input.settings.publicEmail)}">${escapeHtml(input.settings.publicEmail)}</a>.`,
  });
}
