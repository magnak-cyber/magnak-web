import { NextResponse } from 'next/server';
import { getPublicSiteSettings } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load site settings.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

