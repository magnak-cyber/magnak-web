import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createEmailOtp, validateAdminEmail } from '@/lib/adminAuth';

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

    if (!validateAdminEmail(safeEmail)) {
      return NextResponse.json({ message: 'Access denied for this email.' }, { status: 403 });
    }

    const code = await createEmailOtp(safeEmail);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: safeEmail,
      subject: 'Kod logowania do panelu admina',
      html: `
        <div style="font-family:Onest,Arial,sans-serif;padding:20px;background:#f6f6f6;color:#101010;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #eaeaea;">
            <h2 style="margin:0 0 16px;font-size:20px;">Kod potwierdzajacy logowanie</h2>
            <p style="margin:0 0 16px;font-size:14px;color:#444;">Uzyj ponizszego kodu aby wejsc do panelu administratora.</p>
            <div style="font-size:34px;font-weight:700;letter-spacing:6px;background:#101010;color:#fff;padding:12px 16px;border-radius:10px;display:inline-block;">
              ${code}
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:#666;">Kod jest wazny przez 10 minut.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Code sent to admin email.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send code.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
