import { pgTable, text, timestamp, uuid, boolean, date, integer, char } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { organization } from "./auth-schema";

const useUUIDv7 = process.env.UUID_V7_NATIVE_SUPPORT
  ? sql`uuidv7()`
  : sql`uuid_generate_v7()`;
  
// Patients table - patients can belong to multiple hospitals
export const patients = pgTable("patients", {
  id: text("id").default(useUUIDv7).primaryKey(),
  userId: text("user_id"), // References auth.user.id (null if not registered)
  hospitalId: text("hospital_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  dob: date("dob"),
  
  email: text("email"),
  isEmailVerified: boolean("is_email_verified").default(false),
  mobileNumber: text("mobile_number").notNull(),
  isMobileVerified: boolean("is_mobile_verified").default(false),
  
  address: text("address"),
  city: text("city"),
  state: text("state"),
  areaOrPin: text("area_or_pin"),
  
  bloodGroup: text("blood_group"), // 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  
  referredByDr: text("referred_by_dr"), // Doctor user_id
  scheduledBy: text("scheduled_by"), // Staff user_id
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
