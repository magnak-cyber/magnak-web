import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { Collection } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import {
  AdminSiteSettings,
  BrandingAssetDocument,
  DEFAULT_COMPANY_NAME,
  DEFAULT_FAVICON_PATH,
  DEFAULT_LOGO_PATH,
  DEFAULT_NOTIFICATION_EMAIL,
  DEFAULT_PUBLIC_EMAIL,
  DEFAULT_PUBLIC_PHONE,
  PublicSiteSettings,
  SiteSettingsDocument,
} from '@/types/site-settings';

const SETTINGS_COLLECTION = 'site_settings';
const BRANDING_COLLECTION = 'branding_assets';
const SETTINGS_ID = 'default';
const COMPANY_LOGO_ID = 'company-logo';
const COMPANY_FAVICON_ID = 'company-favicon';
const LOGO_PUBLIC_FILE = path.join(process.cwd(), 'public', 'img', 'logo', 'LogoStronaPrzezroczyste.png');
const FAVICON_PUBLIC_FILE = path.join(process.cwd(), 'public', 'img', 'logo', 'LogoFav.png');
const MAX_LOGO_WIDTH = 1200;
const MAX_LOGO_HEIGHT = 1200;
const MAX_FAVICON_SIZE = 256;

function canUseMongo() {
  return Boolean(process.env.MONGODB_URI);
}

function parseEmailList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,\n;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function dedupeEmails(emails: string[]) {
  return Array.from(new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

function getDefaultAdminEmails() {
  const configured = dedupeEmails(parseEmailList(process.env.ADMIN_EMAILS));

  if (configured.length) {
    return configured;
  }

  return dedupeEmails([
    process.env.ADMIN_EMAIL?.trim().toLowerCase() || '',
    process.env.EMAIL_RECEIVER?.trim().toLowerCase() || '',
    process.env.EMAIL_USER?.trim().toLowerCase() || '',
    DEFAULT_PUBLIC_EMAIL,
  ]);
}

async function getSiteSettingsCollection(): Promise<Collection<SiteSettingsDocument>> {
  const db = await getDb();
  return db.collection<SiteSettingsDocument>(SETTINGS_COLLECTION);
}

async function getBrandingAssetsCollection(): Promise<Collection<BrandingAssetDocument>> {
  const db = await getDb();
  return db.collection<BrandingAssetDocument>(BRANDING_COLLECTION);
}

function getLogoUrl() {
  return DEFAULT_LOGO_PATH;
}

function getFaviconUrl() {
  return DEFAULT_FAVICON_PATH;
}

function toDefaultSettings(updatedAt = new Date().toISOString()): SiteSettingsDocument {
  return {
    id: SETTINGS_ID,
    companyName: DEFAULT_COMPANY_NAME,
    notificationEmail: DEFAULT_NOTIFICATION_EMAIL,
    publicEmail: DEFAULT_PUBLIC_EMAIL,
    publicPhone: DEFAULT_PUBLIC_PHONE,
    adminEmails: getDefaultAdminEmails(),
    updatedAt,
  };
}

async function normalizeImageBuffer(
  buffer: Buffer,
  options: {
    width: number;
    height: number;
  }
) {
  const converted = await sharp(buffer)
    .resize({
      width: options.width,
      height: options.height,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  return {
    contentType: 'image/png',
    dataBase64: converted.toString('base64'),
  };
}

async function upsertBrandingAsset(input: {
  assetId: string;
  buffer: Buffer;
  filename: string;
  updatedAt: string;
  width: number;
  height: number;
}) {
  const assets = await getBrandingAssetsCollection();
  const normalized = await normalizeImageBuffer(input.buffer, {
    width: input.width,
    height: input.height,
  });

  await assets.updateOne(
    { id: input.assetId },
    {
      $set: {
        id: input.assetId,
        folder: 'branding',
        filename: input.filename,
        contentType: normalized.contentType,
        dataBase64: normalized.dataBase64,
        updatedAt: input.updatedAt,
      },
    },
    { upsert: true }
  );

  return input.updatedAt;
}

async function upsertLogoAsset(buffer: Buffer, filename: string, updatedAt: string) {
  return upsertBrandingAsset({
    assetId: COMPANY_LOGO_ID,
    buffer,
    filename,
    updatedAt,
    width: MAX_LOGO_WIDTH,
    height: MAX_LOGO_HEIGHT,
  });
}

async function upsertFaviconAsset(buffer: Buffer, filename: string, updatedAt: string) {
  return upsertBrandingAsset({
    assetId: COMPANY_FAVICON_ID,
    buffer,
    filename,
    updatedAt,
    width: MAX_FAVICON_SIZE,
    height: MAX_FAVICON_SIZE,
  });
}

async function ensureDefaultLogo() {
  if (!canUseMongo()) {
    return new Date().toISOString();
  }

  try {
    const assets = await getBrandingAssetsCollection();
    const currentLogo = await assets.findOne({ id: COMPANY_LOGO_ID });

    if (currentLogo) {
      return currentLogo.updatedAt;
    }

    const fileBuffer = await fs.readFile(LOGO_PUBLIC_FILE);
    return upsertLogoAsset(fileBuffer, path.basename(LOGO_PUBLIC_FILE), new Date().toISOString());
  } catch {
    return new Date().toISOString();
  }
}

async function ensureDefaultFavicon() {
  if (!canUseMongo()) {
    return new Date().toISOString();
  }

  try {
    const assets = await getBrandingAssetsCollection();
    const currentFavicon = await assets.findOne({ id: COMPANY_FAVICON_ID });

    if (currentFavicon) {
      return currentFavicon.updatedAt;
    }

    const fileBuffer = await fs.readFile(FAVICON_PUBLIC_FILE);
    return upsertFaviconAsset(fileBuffer, path.basename(FAVICON_PUBLIC_FILE), new Date().toISOString());
  } catch {
    return new Date().toISOString();
  }
}

async function ensureDefaultSettings() {
  if (!canUseMongo()) {
    return toDefaultSettings();
  }

  try {
    const settingsCollection = await getSiteSettingsCollection();
    const existing = await settingsCollection.findOne({ id: SETTINGS_ID });
    const logoUpdatedAt = await ensureDefaultLogo();
    const faviconUpdatedAt = await ensureDefaultFavicon();

    if (existing) {
      return {
        ...existing,
        adminEmails:
          dedupeEmails(existing.adminEmails || []).length > 0
            ? dedupeEmails(existing.adminEmails || [])
            : getDefaultAdminEmails(),
        updatedAt: existing.updatedAt || logoUpdatedAt || faviconUpdatedAt,
      };
    }

    const defaultSettings = toDefaultSettings();
    await settingsCollection.insertOne(defaultSettings);
    return defaultSettings;
  } catch {
    return toDefaultSettings();
  }
}

function toPublicSettings(settings: SiteSettingsDocument): PublicSiteSettings {
  return {
    companyName: settings.companyName,
    publicEmail: settings.publicEmail,
    publicPhone: settings.publicPhone,
    logoUrl: getLogoUrl(),
    faviconUrl: getFaviconUrl(),
    updatedAt: settings.updatedAt,
  };
}

function toAdminSettings(settings: SiteSettingsDocument): AdminSiteSettings {
  return {
    ...toPublicSettings(settings),
    notificationEmail: settings.notificationEmail,
    adminEmails:
      dedupeEmails(settings.adminEmails || []).length > 0
        ? dedupeEmails(settings.adminEmails || [])
        : getDefaultAdminEmails(),
  };
}

export async function getBrandingLogoAsset() {
  if (!canUseMongo()) {
    return null;
  }

  try {
    await ensureDefaultSettings();
    const assets = await getBrandingAssetsCollection();
    return assets.findOne({ id: COMPANY_LOGO_ID });
  } catch {
    return null;
  }
}

export async function getBrandingFaviconAsset() {
  if (!canUseMongo()) {
    return null;
  }

  try {
    await ensureDefaultSettings();
    const assets = await getBrandingAssetsCollection();
    return assets.findOne({ id: COMPANY_FAVICON_ID });
  } catch {
    return null;
  }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const settings = await ensureDefaultSettings().catch(() => toDefaultSettings());
  return toPublicSettings(settings);
}

export async function getAdminSiteSettings(): Promise<AdminSiteSettings> {
  const settings = await ensureDefaultSettings().catch(() => toDefaultSettings());
  return toAdminSettings(settings);
}

export async function updateSiteSettings(input: {
  companyName: string;
  notificationEmail: string;
  publicEmail: string;
  publicPhone: string;
  adminEmails: string[];
  logoFile?: File | null;
  faviconFile?: File | null;
}) {
  if (!canUseMongo()) {
    throw new Error('MONGODB_URI is required to update site settings.');
  }

  const settingsCollection = await getSiteSettingsCollection();
  const current = await ensureDefaultSettings();
  const nextAdminEmails = dedupeEmails(input.adminEmails);

  if (!nextAdminEmails.length) {
    throw new Error('At least one admin email is required.');
  }

  const nextUpdatedAt = new Date().toISOString();
  let finalUpdatedAt = nextUpdatedAt;

  if (input.logoFile) {
    const fileBuffer = Buffer.from(await input.logoFile.arrayBuffer());
    finalUpdatedAt = await upsertLogoAsset(fileBuffer, input.logoFile.name || 'company-logo.png', nextUpdatedAt);
  }

  if (input.faviconFile) {
    const fileBuffer = Buffer.from(await input.faviconFile.arrayBuffer());
    finalUpdatedAt = await upsertFaviconAsset(fileBuffer, input.faviconFile.name || 'company-favicon.png', nextUpdatedAt);
  }

  const updated: SiteSettingsDocument = {
    ...current,
    companyName: input.companyName.trim() || DEFAULT_COMPANY_NAME,
    notificationEmail: input.notificationEmail.trim().toLowerCase() || DEFAULT_NOTIFICATION_EMAIL,
    publicEmail: input.publicEmail.trim().toLowerCase() || DEFAULT_PUBLIC_EMAIL,
    publicPhone: input.publicPhone.trim() || DEFAULT_PUBLIC_PHONE,
    adminEmails: nextAdminEmails,
    updatedAt: finalUpdatedAt,
  };

  await settingsCollection.updateOne(
    { id: SETTINGS_ID },
    { $set: updated },
    { upsert: true }
  );

  return toAdminSettings(updated);
}

export function getAbsoluteLogoUrl(origin: string, settings: PublicSiteSettings | AdminSiteSettings) {
  return new URL(settings.logoUrl || DEFAULT_LOGO_PATH, origin).toString();
}

export function getAbsoluteStableLogoUrl(origin: string) {
  return new URL(getLogoUrl(), origin).toString();
}

export function getAbsoluteStableFaviconUrl(origin: string) {
  return new URL(getFaviconUrl(), origin).toString();
}

export async function getAllowedAdminEmails() {
  try {
    const settings = await ensureDefaultSettings();
    const emails = dedupeEmails(settings.adminEmails || []);
    return emails.length ? emails : getDefaultAdminEmails();
  } catch {
    return getDefaultAdminEmails();
  }
}
