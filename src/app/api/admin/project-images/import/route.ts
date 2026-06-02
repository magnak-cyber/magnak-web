import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { importProjectImagesFromPublicFolder } from '@/lib/projectImagesStore';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const images = await importProjectImagesFromPublicFolder();
    return NextResponse.json({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import project images.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
