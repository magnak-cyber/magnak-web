import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/adminAuth';
import { createProjectImage, listProjectImages } from '@/lib/projectImagesStore';

export const runtime = 'nodejs';

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return unauthorized();
    }

    const images = await listProjectImages();
    return NextResponse.json({ images });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load project images.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    const session = verifySessionToken(token);

    if (!session) {
      return unauthorized();
    }

    const formData = await req.formData();
    const files = formData.getAll('files').filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json({ message: 'No image files were provided.' }, { status: 400 });
    }

    const images = [];
    for (const file of files) {
      images.push(await createProjectImage(file));
    }

    return NextResponse.json({ images }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload project images.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
