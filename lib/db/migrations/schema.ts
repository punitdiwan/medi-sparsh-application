import { pgTable, pgSchema, decimal, check, text, timestamp, unique, serial, boolean, foreignKey, date, jsonb, primaryKey, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");

const useUUIDv7 = process.env.UUID_V7_NATIVE_SUPPORT
  ? sql`useUUIDv7`
  : sql`uuid_generate_v7()`;

export const verificationInAuth = auth.table("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const specializations = pgTable("specializations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("specializations_name_unique").on(table.name),
]);

export const userInAuth = auth.table("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	
]);

export const accountInAuth = auth.table("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userInAuth.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),

]);

export const organizationInAuth = auth.table("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	metadata: text(),
}, (table) => [
	unique("organization_slug_unique").on(table.slug)

]);

export const invitationInAuth = auth.table("invitation", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	email: text().notNull(),
	role: text(),
	status: text().default('pending').notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	inviterId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizationInAuth.id],
			name: "invitation_organizationId_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [userInAuth.id],
			name: "invitation_inviterId_user_id_fk"
		}).onDelete("cascade")
]);

export const memberInAuth = auth.table("member", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text().notNull(),
	role: text().default('admin').notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organizationInAuth.id],
			name: "member_organizationId_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userInAuth.id],
			name: "member_userId_user_id_fk"
		}).onDelete("cascade")
]);

export const sessionInAuth = auth.table("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	activeOrganizationId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [userInAuth.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.activeOrganizationId],
			foreignColumns: [organizationInAuth.id],
			name: "session_activeOrganizationId_organization_id_fk"
		}),
	unique("session_token_unique").on(table.token)

]);

export const patients = pgTable("patients", {
	id: text().default(useUUIDv7).primaryKey().notNull(),
	userId: text("user_id"),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	gender: text().notNull(),
	dob: date(),
	email: text(),
	isEmailVerified: boolean("is_email_verified").default(false),
	mobileNumber: text("mobile_number").notNull(),
	isMobileVerified: boolean("is_mobile_verified").default(false),
	address: text(),
	city: text(),
	state: text(),
	areaOrPin: text("area_or_pin"),
	bloodGroup: text("blood_group"),
	referredByDr: text("referred_by_dr"),
	scheduledBy: text("scheduled_by"),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [organizationInAuth.id],
			name: "patients_hospital_id_organization_id_fk"
		}).onDelete("cascade")
]);

export const staff = pgTable("staff", {
	id: text().default(useUUIDv7).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	hospitalId: text("hospital_id").notNull(),
	mobileNumber: text("mobile_number"),
	gender: text().notNull(),
	dob: date(),
	department: text(),
	joiningDate: date("joining_date"),
	address: text(),
	createdBy: text("created_by"),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [organizationInAuth.id],
			name: "staff_hospital_id_organization_id_fk"
		}).onDelete("cascade")
]);

export const doctors = pgTable("doctors", {
	id: text().default(useUUIDv7).primaryKey().notNull(),
	staffId: text("staff_id").notNull(),
	hospitalId: text("hospital_id").notNull(),
	specialization: jsonb().notNull(),
	qualification: text().notNull(),
	experience: text().notNull(),
	consultationFee: text("consultation_fee").notNull(),
	availability: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.staffId],
			foreignColumns: [staff.id],
			name: "doctors_staff_id_staff_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [organizationInAuth.id],
			name: "doctors_hospital_id_organization_id_fk"
		}).onDelete("cascade")
]);

export const appointments = pgTable("appointments", {
	id: text().default(useUUIDv7).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	patientId: text("patient_id").notNull(),
	doctorUserId: text("doctor_user_id").notNull(),
	appointmentDate: date("appointment_date").notNull(),
	appointmentTime: text("appointment_time").notNull(),
	status: text().default('scheduled').notNull(),
	reason: text(),
	notes: text(),
	isFollowUp: boolean("is_follow_up").default(false),
	previousAppointmentId: text("previous_appointment_id"),
	scheduledBy: text("scheduled_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [organizationInAuth.id],
			name: "appointments_hospital_id_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "appointments_patient_id_patients_id_fk"
		}).onDelete("cascade")
	
]);

export const prescriptions = pgTable("prescriptions", {
	id: text().default(useUUIDv7).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	appointmentId: text("appointment_id").notNull(),
	patientId: text("patient_id").notNull(),
	doctorUserId: text("doctor_user_id").notNull(),
	diagnosis: text().notNull(),
	symptoms: text(),
	medicines: jsonb().notNull(),
	labTests: jsonb("lab_tests"),
	followUpRequired: boolean("follow_up_required").default(false),
	followUpDate: date("follow_up_date"),
	followUpNotes: text("follow_up_notes"),
	additionalNotes: text("additional_notes"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	vitals: jsonb(),
}, (table) => [
	foreignKey({
			columns: [table.hospitalId],
			foreignColumns: [organizationInAuth.id],
			name: "prescriptions_hospital_id_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "prescriptions_appointment_id_appointments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "prescriptions_patient_id_patients_id_fk"
		}).onDelete("cascade")
	
]);

export const settings = pgTable("settings", {
	organizationId: varchar("organization_id", { length: 256 }).notNull(),
	key: varchar({ length: 256 }).notNull(),
	value: varchar({ length: 256 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	primaryKey({ columns: [table.organizationId, table.key], name: "settings_key_unique"})
	
]);

// Patients table - services can belong to each hospital
export const services = pgTable("services", {
  id: text("id").default(useUUIDv7).primaryKey(),
  hospitalId: text("hospital_id")
	.notNull()
	.references(() => organizationInAuth.id, { onDelete: "cascade" }),
  
  name: text("name").notNull(),
  amount: decimal("amount").notNull(),
  description: text("description"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});


// Transactions table
export const transactions = pgTable("transactions", {
  id: text("id").default(useUUIDv7).primaryKey(),
  hospitalId: text("hospital_id")
	.notNull()
	.references(() => organizationInAuth.id, { onDelete: "cascade" }),
  
  patientId: text("patient_id")
	.notNull()
	.references(() => patients.id, { onDelete: "cascade" }),
	appointmentsId: text("appointment_id")
	.notNull()
	.references(() => appointments.id, { onDelete: "cascade" }),
  amount: serial("amount").notNull(),
  status: text("status").notNull(), // e.g., 'pending', 'completed', 'failed'
  paymentMethod: text("payment_method").notNull(), // e.g., 'credit_card', 'cash', 'insurance'
  transactionDate: timestamp("transaction_date", { withTimezone: true }).defaultNow().notNull(),
  notes: text("notes"),  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
