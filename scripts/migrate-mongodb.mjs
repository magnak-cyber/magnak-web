import { MongoClient } from 'mongodb';

function getDbNameFromUri(uri, fallback) {
  try {
    const parsed = new URL(uri);
    const name = parsed.pathname.replace(/^\//, '').trim();
    return name || fallback;
  } catch {
    return fallback;
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

async function main() {
  const sourceUri = requireEnv('MONGODB2_URI');
  const targetUri = requireEnv('MONGODB_URI');
  const sourceDbName = process.env.MONGODB2_DB_NAME || getDbNameFromUri(sourceUri, 'remont_web');
  const targetDbName = process.env.MONGODB_DB_NAME || getDbNameFromUri(targetUri, 'remont_web');

  const sourceClient = new MongoClient(sourceUri);
  const targetClient = new MongoClient(targetUri);

  await sourceClient.connect();
  await targetClient.connect();

  const sourceDb = sourceClient.db(sourceDbName);
  const targetDb = targetClient.db(targetDbName);

  const collections = await sourceDb.listCollections({}, { nameOnly: true }).toArray();

  if (!collections.length) {
    console.log(`No collections found in source database "${sourceDbName}".`);
    await sourceClient.close();
    await targetClient.close();
    return;
  }

  console.log(`Copying ${collections.length} collections from "${sourceDbName}" to "${targetDbName}"...`);

  for (const collectionInfo of collections) {
    const collectionName = collectionInfo.name;
    if (!collectionName || collectionName.startsWith('system.')) {
      continue;
    }

    const sourceCollection = sourceDb.collection(collectionName);
    const targetCollection = targetDb.collection(collectionName);
    const documents = await sourceCollection.find({}).toArray();

    await targetCollection.deleteMany({});

    if (documents.length) {
      await targetCollection.insertMany(documents);
    }

    console.log(`Copied ${documents.length} documents in "${collectionName}".`);
  }

  await sourceClient.close();
  await targetClient.close();
  console.log('Migration complete.');
}

main().catch(async (error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
