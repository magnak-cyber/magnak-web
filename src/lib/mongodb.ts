import { Db, MongoClient } from 'mongodb';
import { normalizeEnvValue } from '@/lib/env';

function getMongoUri() {
  return normalizeEnvValue(process.env.MONGODB_URI);
}

const uri = getMongoUri();

function resolveDbName() {
  const explicitDbName = normalizeEnvValue(process.env.MONGODB_DB_NAME);

  if (explicitDbName) {
    return explicitDbName;
  }

  try {
    const parsed = new URL(uri || 'mongodb://localhost/remont_web');
    const fromPath = parsed.pathname.replace('/', '').trim();
    return fromPath || 'remont_web';
  } catch {
    return 'remont_web';
  }
}

const dbName = resolveDbName();

type GlobalMongo = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as GlobalMongo;

function getClientPromise() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (mongoUri.includes('MONGODB_DB_NAME=')) {
    throw new Error('MONGODB_URI is invalid. Keep MONGODB_DB_NAME as a separate environment variable.');
  }

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(mongoUri);
    globalForMongo._mongoClientPromise = client.connect();
  }

  return globalForMongo._mongoClientPromise;
}

export function hasMongoUri() {
  return Boolean(getMongoUri());
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
