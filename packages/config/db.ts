import * as mongodb from "mongodb";
import { Config } from "sst/node/config";

const MongoClient = mongodb.MongoClient;

let cachedDb: mongodb.Db | null = null;

const connectToDatabase = async (): Promise<mongodb.Db> => {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(Config.MONGODB_URI);
  cachedDb = await client.db("main");

  return cachedDb;
};

const db = await connectToDatabase();

export default db;
