import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./migrations/schema";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
//const connectionString = "postgres://peppermint:peppermint@localhost:5432/medi";
//const connectionString = "postgres://peppermint:peppermint@localhost:5432/medisparsh"
// Create a singleton connection
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;
export const db = drizzle(conn, { schema });
