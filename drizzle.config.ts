import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
      url: process.env.DATABASE_URL!,
    //url: "postgres://peppermint:peppermint@localhost:5432/medi"
  },
  schemaFilter: ["auth", "public"],
  
    
});
