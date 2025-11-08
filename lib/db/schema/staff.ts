import { pgTable, text, timestamp, serial, boolean, date, jsonb, uuid } from "drizzle-orm/pg-core";
import { organization } from "./auth-schema";
import { sql } from "drizzle-orm";

const useUUIDv7 = process.env.UUID_V7_NATIVE_SUPPORT
  ? sql`uuidv7()`
  : sql`uuid_generate_v7()`;

// Staff table - doctors, receptionists, admins
export const staff = pgTable("staff", {
  id: text("id").default(useUUIDv7).primaryKey(),
  userId: text("user_id").notNull(), // References auth.user.id
  hospitalId: text("hospital_id")
    .notNull().references(() => organization.id, { onDelete: "cascade" }),
  mobileNumber: text("mobile_number"),
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  dob: date("dob"),
  department: text("department"),
  joiningDate: date("joining_date"),
  address: text("address"),
  createdBy: text("created_by"), // User ID of creator
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Specializations table
export const specializations = pgTable("specializations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Doctors table - extends staff with doctor-specific info
export const doctors = pgTable("doctors", {
  id: text("id").default(useUUIDv7).primaryKey(), 
  staffId: text("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),
  hospitalId: text("hospital_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  
  specialization: jsonb("specialization").notNull(), // [{ name, description }]
  qualification: text("qualification").notNull(),
  experience: text("experience").notNull(),
  consultationFee: text("consultation_fee").notNull(),
  availability: text("availability"),
  
  isDeleted: boolean("is_deleted").default(false),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
