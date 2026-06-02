import { NextResponse } from 'next/server';
import { listProjectImages } from '@/lib/projectImagesStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const images = await listProjectImages();
    return NextResponse.json({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load project images.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
