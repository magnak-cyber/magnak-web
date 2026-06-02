import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Collection } from 'mongodb';
import sharp from 'sharp';
import { getDb } from '@/lib/mongodb';
import { ProjectImageDocument, ProjectImageListItem } from '@/types/project-images';

const COLLECTION_NAME = 'project_images';
const PROJECTS_DIR = path.join(process.cwd(), 'public', 'img', 'Projects');
const MAX_IMAGE_WIDTH = 1400;
const MAX_IMAGE_HEIGHT = 1400;

async function getProjectImagesCollection(): Promise<Collection<ProjectImageDocument>> {
  const db = await getDb();
  return db.collection<ProjectImageDocument>(COLLECTION_NAME);
}

function compareProjectFilenames(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
}

async function decodeImageToPixels(buffer: Buffer) {
  const decoded = await sharp(buffer)
    .resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    width: decoded.info.width,
    height: decoded.info.height,
    pixelDataBase64: decoded.data.toString('base64'),
  };
}

function getImageVersion(image: Pick<ProjectImageDocument, 'createdAt' | 'updatedAt'>) {
  return image.updatedAt || image.createdAt;
}

function getRawImageBuffer(image: ProjectImageDocument) {
  return image.pixelDataBase64
    ? Buffer.from(image.pixelDataBase64, 'base64')
    : Buffer.from(image.pixels || []);
}

function toListItem(image: ProjectImageDocument): ProjectImageListItem {
  const version = encodeURIComponent(getImageVersion(image));

  return {
    id: image.id,
    filename: image.filename,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt,
    updatedAt: image.updatedAt,
    src: `/api/projects/images/${image.id}?v=${version}`,
    thumbnailSrc: `/api/projects/images/${image.id}?v=${version}`,
  };
}

async function seedProjectImagesIfEmpty() {
  const collection = await getProjectImagesCollection();
  const count = await collection.countDocuments();

  if (count > 0) {
    return;
  }

  let filenames: string[] = [];
  try {
    filenames = await fs.readdir(PROJECTS_DIR);
  } catch {
    return;
  }

  const imageFiles = filenames
    .filter((filename) => /\.(png|jpg|jpeg)$/i.test(filename))
    .sort(compareProjectFilenames);

  if (!imageFiles.length) {
    return;
  }

  const now = Date.now();
  const docs: ProjectImageDocument[] = [];

  for (let index = 0; index < imageFiles.length; index += 1) {
    const filename = imageFiles[index];
    const absolutePath = path.join(PROJECTS_DIR, filename);
    const buffer = await fs.readFile(absolutePath);
    const decoded = await decodeImageToPixels(buffer);

    docs.push({
      id: crypto.randomUUID(),
      filename,
      width: decoded.width,
      height: decoded.height,
      pixelDataBase64: decoded.pixelDataBase64,
      createdAt: new Date(now + index).toISOString(),
      updatedAt: new Date(now + index).toISOString(),
    });
  }

  await collection.insertMany(docs);
}

export async function importProjectImagesFromPublicFolder(): Promise<ProjectImageListItem[]> {
  const collection = await getProjectImagesCollection();

  let filenames: string[] = [];
  try {
    filenames = await fs.readdir(PROJECTS_DIR);
  } catch {
    return [];
  }

  const imageFiles = filenames
    .filter((filename) => /\.(png|jpg|jpeg)$/i.test(filename))
    .sort(compareProjectFilenames);

  if (!imageFiles.length) {
    return [];
  }

  const existing = await collection
    .find({}, { projection: { filename: 1, _id: 0 } })
    .toArray();
  const existingNames = new Set(existing.map((item) => item.filename));
  const inserted: ProjectImageDocument[] = [];

  for (const filename of imageFiles) {
    if (existingNames.has(filename)) {
      continue;
    }

    const absolutePath = path.join(PROJECTS_DIR, filename);
    const buffer = await fs.readFile(absolutePath);
    const decoded = await decodeImageToPixels(buffer);

    const document: ProjectImageDocument = {
      id: crypto.randomUUID(),
      filename,
      width: decoded.width,
      height: decoded.height,
      pixelDataBase64: decoded.pixelDataBase64,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await collection.insertOne(document);
    inserted.push(document);
  }

  return inserted.map(toListItem);
}

export async function listProjectImages(): Promise<ProjectImageListItem[]> {
  await seedProjectImagesIfEmpty();
  const collection = await getProjectImagesCollection();
  const images = await collection
    .find(
      {},
      {
        projection: {
          _id: 0,
          id: 1,
          filename: 1,
          width: 1,
          height: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      }
    )
    .sort({ createdAt: 1 })
    .toArray();

  return images.map((image) =>
    toListItem({
      ...image,
      pixelDataBase64: '',
    } as ProjectImageDocument)
  );
}

export async function getProjectImageById(id: string): Promise<ProjectImageDocument | null> {
  await seedProjectImagesIfEmpty();
  const collection = await getProjectImagesCollection();
  return collection.findOne({ id });
}

export async function createProjectImage(file: File): Promise<ProjectImageListItem> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const decoded = await decodeImageToPixels(buffer);
  const document: ProjectImageDocument = {
    id: crypto.randomUUID(),
    filename: file.name,
    width: decoded.width,
    height: decoded.height,
    pixelDataBase64: decoded.pixelDataBase64,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const collection = await getProjectImagesCollection();
  await collection.insertOne(document);
  return toListItem(document);
}

export async function deleteProjectImage(id: string): Promise<boolean> {
  const collection = await getProjectImagesCollection();
  const result = await collection.deleteOne({ id });
  return result.deletedCount === 1;
}

export async function rotateProjectImage(id: string): Promise<ProjectImageListItem | null> {
  const collection = await getProjectImagesCollection();
  const image = await collection.findOne({ id });

  if (!image) {
    return null;
  }

  const rotated = await sharp(getRawImageBuffer(image), {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4,
    },
  })
    .rotate(90)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const updatedAt = new Date().toISOString();
  const nextDocument: ProjectImageDocument = {
    ...image,
    width: rotated.info.width,
    height: rotated.info.height,
    pixelDataBase64: rotated.data.toString('base64'),
    updatedAt,
  };

  await collection.updateOne(
    { id },
    {
      $set: {
        width: nextDocument.width,
        height: nextDocument.height,
        pixelDataBase64: nextDocument.pixelDataBase64,
        updatedAt: nextDocument.updatedAt,
      },
      $unset: {
        pixels: '',
      },
    }
  );

  return toListItem(nextDocument);
}

export async function encodeProjectImageToPng(image: ProjectImageDocument): Promise<Buffer> {
  const rawData = getRawImageBuffer(image);

  return sharp(rawData, {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}
