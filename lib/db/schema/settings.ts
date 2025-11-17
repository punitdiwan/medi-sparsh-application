import { pgTable, serial, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./auth-schema";

export const settings = pgTable("settings", {
  organizationId : varchar("organization_id", {length:256}),
  key: varchar("key", { length: 256 }).notNull().unique(),
  value: varchar("value", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
