import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getBrandingLogoAsset } from '@/lib/siteSettingsStore';

export const runtime = 'nodejs';

const FALLBACK_LOGO_PATH = path.join(process.cwd(), 'public', 'img', 'logo', 'LogoStronaPrzezroczyste.png');

export async function GET() {
  try {
    const asset = await getBrandingLogoAsset();

    if (!asset) {
      const fallback = await fs.readFile(FALLBACK_LOGO_PATH);
      return new NextResponse(fallback, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }

    const buffer = Buffer.from(asset.dataBase64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': asset.contentType,
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to render logo.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
