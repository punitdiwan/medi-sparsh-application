import { pgTable, text, timestamp, serial, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { patients } from "./patients";
import { doctors } from "./staff";
import { organization } from "./auth-schema";
import { sql } from "drizzle-orm";

const useUUIDv7 = process.env.UUID_V7_NATIVE_SUPPORT
  ? sql`uuidv7()`
  : sql`uuid_generate_v7()`;

// Appointments table
export const appointments = pgTable("appointments", {
  id: text("id").default(useUUIDv7).primaryKey(),
  hospitalId: text("hospital_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  
  patientId: text("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  doctorUserId: text("doctor_user_id").notNull(), // References doctors.user_id
  
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").notNull().default("scheduled"), // 'scheduled', 'completed', 'cancelled', 'rescheduled'
  
  reason: text("reason"),
  notes: text("notes"),
  
  isFollowUp: boolean("is_follow_up").default(false),
  previousAppointmentId: text("previous_appointment_id"), // Reference to previous appointment if follow-up
  
  scheduledBy: text("scheduled_by"), // Staff user_id who scheduled the appointment
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Prescriptions table - linked to appointments
export const prescriptions = pgTable("prescriptions", {
  id: text("id").default(useUUIDv7).primaryKey(),
  hospitalId: text("hospital_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  
  appointmentId: text("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  patientId: text("patient_id")
    .notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorUserId: text("doctor_user_id").notNull(), // References doctors.user_id
  diagnosis: text("diagnosis").notNull(),
  symptoms: text("symptoms"),
  medicines: jsonb("medicines").notNull(), // [{ name, dosage, frequency, duration, instructions }]
  labTests: jsonb("lab_tests"), // [{ name, description }]
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: date("follow_up_date"),
  followUpNotes: text("follow_up_notes"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  vitals:  jsonb("vitals"),
});

// Medical history table
// export const medicalHistory = pgTable("medical_history", {
//   id: serial("id").primaryKey(),
//   patientId: text("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),hospitalId: text("hospital_id").notNull().references(() => hospitals.hospitalId, { onDelete: "cascade" }),
//   allergies: jsonb("allergies"), // [{ name, severity, notes }]
//   chronicConditions: jsonb("chronic_conditions"), // [{ condition, diagnosedDate, notes }]
//   pastSurgeries: jsonb("past_surgeries"), // [{ surgery, date, hospital, notes }]
//   familyHistory: jsonb("family_history"), // [{ relation, condition, notes }]
//   currentMedications: jsonb("current_medications"), // [{ name, dosage, frequency, startDate }]
//   createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
//   updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
// });
