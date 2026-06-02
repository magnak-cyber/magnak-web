import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { deleteProjectImage, rotateProjectImage } from '@/lib/projectImagesStore';

export const runtime = 'nodejs';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const removed = await deleteProjectImage(id);

    if (!removed) {
      return NextResponse.json({ message: 'Project image not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Project image deleted.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete project image.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    if (body?.action !== 'rotate') {
      return NextResponse.json({ message: 'Unsupported project image action.' }, { status: 400 });
    }

    const image = await rotateProjectImage(id);

    if (!image) {
      return NextResponse.json({ message: 'Project image not found.' }, { status: 404 });
    }

    return NextResponse.json({ image });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project image.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
