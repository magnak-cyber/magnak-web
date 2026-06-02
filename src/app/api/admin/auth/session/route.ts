import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
  });
}
