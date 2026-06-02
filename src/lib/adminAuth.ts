import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Collection } from 'mongodb';
import { getDb } from '@/lib/mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUTH_STORE_PATH = path.join(DATA_DIR, 'admin-auth.json');
const OTP_COLLECTION_NAME = 'admin_otps';
const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

interface PendingOtp {
  email: string;
  codeHash: string;
  expiresAt: number;
  attemptsLeft: number;
}

interface AuthStore {
  pendingOtp: PendingOtp | null;
}

type GlobalAdminAuth = typeof globalThis & {
  _adminAuthMemoryStore?: AuthStore;
};

const globalForAdminAuth = globalThis as GlobalAdminAuth;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.EMAIL_PASS || 'change-this-session-secret';
}

export function getAdminEmail() {
  return (
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.EMAIL_RECEIVER?.trim().toLowerCase() ||
    process.env.EMAIL_USER?.trim().toLowerCase() ||
    'wykonczenia.nbgroup@gmail.com'
  );
}

function parseAdminEmails(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[,\n;]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  const configuredEmails = parseAdminEmails(process.env.ADMIN_EMAILS);

  if (configuredEmails.length) {
    return configuredEmails;
  }

  return [getAdminEmail()];
}

export function validateAdminEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return getAdminEmails().includes(normalizedEmail);
}

function hashCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOtpCode() {
  const value = crypto.randomInt(0, 1_000_000);
  return value.toString().padStart(6, '0');
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function encodePayload(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<string, unknown>;
}

function shouldUseMongoOtpStore() {
  return Boolean(process.env.MONGODB_URI);
}

function shouldUseMemoryOtpStore() {
  return !shouldUseMongoOtpStore() && process.env.VERCEL === '1';
}

function getMemoryAuthStore(): AuthStore {
  if (!globalForAdminAuth._adminAuthMemoryStore) {
    globalForAdminAuth._adminAuthMemoryStore = { pendingOtp: null };
  }

  return globalForAdminAuth._adminAuthMemoryStore;
}

async function getOtpCollection(): Promise<Collection<PendingOtp>> {
  const db = await getDb();
  return db.collection<PendingOtp>(OTP_COLLECTION_NAME);
}

async function ensureAuthStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(AUTH_STORE_PATH);
  } catch {
    const initial: AuthStore = { pendingOtp: null };
    await fs.writeFile(AUTH_STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

async function readAuthStore(): Promise<AuthStore> {
  await ensureAuthStore();
  const raw = await fs.readFile(AUTH_STORE_PATH, 'utf8');
  return JSON.parse(raw) as AuthStore;
}

async function writeAuthStore(store: AuthStore) {
  await ensureAuthStore();
  await fs.writeFile(AUTH_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

async function persistFallbackAuthStore(store: AuthStore) {
  if (shouldUseMemoryOtpStore()) {
    globalForAdminAuth._adminAuthMemoryStore = store;
    return;
  }

  await writeAuthStore(store);
}

export async function createEmailOtp(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  const code = generateOtpCode();
  const nextOtp: PendingOtp = {
    email: normalizedEmail,
    codeHash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attemptsLeft: MAX_OTP_ATTEMPTS,
  };

  if (shouldUseMongoOtpStore()) {
    const collection = await getOtpCollection();
    await collection.updateOne(
      { email: normalizedEmail },
      { $set: nextOtp },
      { upsert: true }
    );
    return code;
  }

  if (shouldUseMemoryOtpStore()) {
    const store = getMemoryAuthStore();
    store.pendingOtp = nextOtp;
    return code;
  }

  const store = await readAuthStore();
  store.pendingOtp = nextOtp;
  await writeAuthStore(store);
  return code;
}

export async function verifyEmailOtp(email: string, code: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();

  if (shouldUseMongoOtpStore()) {
    const collection = await getOtpCollection();
    const pending = await collection.findOne({ email: normalizedEmail });

    if (!pending) {
      return false;
    }

    if (Date.now() > pending.expiresAt) {
      await collection.deleteOne({ email: normalizedEmail });
      return false;
    }

    if (pending.attemptsLeft <= 0) {
      await collection.deleteOne({ email: normalizedEmail });
      return false;
    }

    const isValid = hashCode(normalizedCode) === pending.codeHash;

    if (!isValid) {
      const nextAttemptsLeft = pending.attemptsLeft - 1;

      if (nextAttemptsLeft <= 0) {
        await collection.deleteOne({ email: normalizedEmail });
      } else {
        await collection.updateOne(
          { email: normalizedEmail },
          { $set: { attemptsLeft: nextAttemptsLeft } }
        );
      }

      return false;
    }

    await collection.deleteOne({ email: normalizedEmail });
    return true;
  }

  const store = shouldUseMemoryOtpStore() ? getMemoryAuthStore() : await readAuthStore();
  const pending = store.pendingOtp;

  if (!pending) {
    return false;
  }

  if (pending.email !== normalizedEmail || Date.now() > pending.expiresAt) {
    store.pendingOtp = null;
    await persistFallbackAuthStore(store);
    return false;
  }

  if (pending.attemptsLeft <= 0) {
    store.pendingOtp = null;
    await persistFallbackAuthStore(store);
    return false;
  }

  const isValid = hashCode(normalizedCode) === pending.codeHash;

  if (!isValid) {
    pending.attemptsLeft -= 1;
    if (pending.attemptsLeft <= 0) {
      store.pendingOtp = null;
    } else {
      store.pendingOtp = pending;
    }
    await persistFallbackAuthStore(store);
    return false;
  }

  store.pendingOtp = null;
  await persistFallbackAuthStore(store);
  return true;
}

export function createSessionToken(email: string) {
  const payload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const encoded = encodePayload(payload);
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  if (expected !== signature) {
    return null;
  }

  const payload = decodePayload(encoded);
  const email = typeof payload.email === 'string' ? payload.email : '';
  const exp = typeof payload.exp === 'number' ? payload.exp : 0;

  if (!email || !exp || Date.now() > exp) {
    return null;
  }

  return { email };
}
