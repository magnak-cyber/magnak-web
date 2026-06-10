import { NextRequest, NextResponse } from 'next/server';
import { createEmailOtp, validateAdminEmail } from '@/lib/adminAuth';
import { buildAdminCodeEmail } from '@/lib/emailTemplates';
import { createMailerTransport, formatMailerError, getMailerSetupError } from '@/lib/mailer';
import { getAbsoluteStableLogoUrl, getPublicSiteSettings } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const setupError = getMailerSetupError();
    if (setupError) {
      return NextResponse.json({ message: setupError }, { status: 500 });
    }

    const { email } = (await req.json()) as { email?: string };
    const safeEmail = email?.trim().toLowerCase() || '';

    if (!safeEmail || !isValidEmail(safeEmail)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    if (!(await validateAdminEmail(safeEmail))) {
      return NextResponse.json({ message: 'Access denied for this email.' }, { status: 403 });
    }

    const code = await createEmailOtp(safeEmail);
    const settings = await getPublicSiteSettings();
    const origin = `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`;
    const logoUrl = getAbsoluteStableLogoUrl(origin);
    const transporter = createMailerTransport();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: safeEmail,
      subject: `Kod logowania | ${settings.companyName}`,
      html: buildAdminCodeEmail({ settings, logoUrl, code }),
    });

    return NextResponse.json({ message: 'Code sent to admin email.' });
  } catch (error) {
    const message = formatMailerError(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
