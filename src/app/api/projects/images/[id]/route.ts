import { NextRequest, NextResponse } from 'next/server';
import { encodeProjectImageToPng, getProjectImageById } from '@/lib/projectImagesStore';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await getProjectImageById(id);

    if (!image) {
      return NextResponse.json({ message: 'Project image not found.' }, { status: 404 });
    }

    const png = await encodeProjectImageToPng(image);

    return new NextResponse(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to render project image.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
