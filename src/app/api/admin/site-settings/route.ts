import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { getAdminSiteSettings, updateSiteSettings } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return unauthorized();
    }

    const settings = await getAdminSiteSettings();
    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load site settings.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return unauthorized();
    }

    const formData = await req.formData();
    const companyName = (formData.get('companyName') as string | null)?.trim() || '';
    const notificationEmail = (formData.get('notificationEmail') as string | null)?.trim().toLowerCase() || '';
    const publicEmail = (formData.get('publicEmail') as string | null)?.trim().toLowerCase() || '';
    const publicPhone = (formData.get('publicPhone') as string | null)?.trim() || '';
    const adminEmails = formData
      .getAll('adminEmails')
      .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
      .filter(Boolean);
    const logoFile = formData.get('logoFile');
    const faviconFile = formData.get('faviconFile');

    if (!companyName) {
      return NextResponse.json({ message: 'Company name is required.' }, { status: 400 });
    }

    if (!isValidEmail(notificationEmail) || !isValidEmail(publicEmail)) {
      return NextResponse.json({ message: 'Both email fields must be valid.' }, { status: 400 });
    }

    if (!adminEmails.length || adminEmails.some((email) => !isValidEmail(email))) {
      return NextResponse.json({ message: 'Admin email list must contain valid email addresses.' }, { status: 400 });
    }

    const settings = await updateSiteSettings({
      companyName,
      notificationEmail,
      publicEmail,
      publicPhone,
      adminEmails,
      logoFile: logoFile instanceof File && logoFile.size > 0 ? logoFile : null,
      faviconFile: faviconFile instanceof File && faviconFile.size > 0 ? faviconFile : null,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update site settings.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
