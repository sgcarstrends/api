import * as mongodb from "mongodb";

const MongoClient = mongodb.MongoClient;

let cachedDb: mongodb.Db | null = null;

const connectToDatabase = async (): Promise<mongodb.Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI);
  cachedDb = client.db("main");

  return cachedDb;
};

const db = await connectToDatabase();

export default db;
