import { Db, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';

function resolveDbName() {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
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
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    globalForMongo._mongoClientPromise = client.connect();
  }

  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
