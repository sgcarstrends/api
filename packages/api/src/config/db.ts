import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Resource } from "sst";

const sql = neon(Resource.DATABASE_URL.value);
const db = drizzle(sql);

export default db;
