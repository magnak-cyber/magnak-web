import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, validateAdminEmail, verifyEmailOtp } from '@/lib/adminAuth';

export const runtime = 'nodejs';

function isValidCode(code: string) {
  return /^\d{6}$/.test(code);
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = (await req.json()) as { email?: string; code?: string };
    const safeEmail = email?.trim().toLowerCase() || '';
    const safeCode = code?.trim() || '';

    if (!(await validateAdminEmail(safeEmail))) {
      return NextResponse.json({ message: 'Access denied for this email.' }, { status: 403 });
    }

    if (!isValidCode(safeCode)) {
      return NextResponse.json({ message: 'Invalid code format.' }, { status: 400 });
    }

    const verified = await verifyEmailOtp(safeEmail, safeCode);
    if (!verified) {
      return NextResponse.json({ message: 'Wrong or expired code.' }, { status: 401 });
    }

    const token = createSessionToken(safeEmail);
    const response = NextResponse.json({ message: 'Authenticated.' });
    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch {
    return NextResponse.json({ message: 'Failed to verify code.' }, { status: 500 });
  }
}
