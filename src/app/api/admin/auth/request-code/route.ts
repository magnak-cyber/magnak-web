import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createEmailOtp, validateAdminEmail } from '@/lib/adminAuth';
import { buildAdminCodeEmail } from '@/lib/emailTemplates';
import { getAbsoluteStableLogoUrl, getPublicSiteSettings } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: safeEmail,
      subject: `Kod logowania | ${settings.companyName}`,
      html: buildAdminCodeEmail({ settings, logoUrl, code }),
    });

    return NextResponse.json({ message: 'Code sent to admin email.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send code.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
