import { pgTable, pgSchema, check, text, timestamp, unique, serial, boolean, foreignKey, date, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auth = pgSchema("auth");


export const verificationInAuth = auth.table("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	check("verification_id_not_null", sql`NOT NULL id`),
	check("verification_identifier_not_null", sql`NOT NULL identifier`),
	check("verification_value_not_null", sql`NOT NULL value`),
	check("verification_expiresAt_not_null", sql`NOT NULL "expiresAt"`),
	check("verification_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("verification_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
]);

export const specializations = pgTable("specializations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("specializations_name_unique").on(table.name),
	check("specializations_id_not_null", sql`NOT NULL id`),
	check("specializations_name_not_null", sql`NOT NULL name`),
	check("specializations_created_at_not_null", sql`NOT NULL created_at`),
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
	check("user_id_not_null", sql`NOT NULL id`),
	check("user_name_not_null", sql`NOT NULL name`),
	check("user_email_not_null", sql`NOT NULL email`),
	check("user_emailVerified_not_null", sql`NOT NULL "emailVerified"`),
	check("user_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("user_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
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
	check("account_id_not_null", sql`NOT NULL id`),
	check("account_accountId_not_null", sql`NOT NULL "accountId"`),
	check("account_providerId_not_null", sql`NOT NULL "providerId"`),
	check("account_userId_not_null", sql`NOT NULL "userId"`),
	check("account_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("account_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
]);

export const organizationInAuth = auth.table("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	metadata: text(),
}, (table) => [
	unique("organization_slug_unique").on(table.slug),
	check("organization_id_not_null", sql`NOT NULL id`),
	check("organization_name_not_null", sql`NOT NULL name`),
	check("organization_slug_not_null", sql`NOT NULL slug`),
	check("organization_createdAt_not_null", sql`NOT NULL "createdAt"`),
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
		}).onDelete("cascade"),
	check("invitation_id_not_null", sql`NOT NULL id`),
	check("invitation_organizationId_not_null", sql`NOT NULL "organizationId"`),
	check("invitation_email_not_null", sql`NOT NULL email`),
	check("invitation_status_not_null", sql`NOT NULL status`),
	check("invitation_expiresAt_not_null", sql`NOT NULL "expiresAt"`),
	check("invitation_inviterId_not_null", sql`NOT NULL "inviterId"`),
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
		}).onDelete("cascade"),
	check("member_id_not_null", sql`NOT NULL id`),
	check("member_organizationId_not_null", sql`NOT NULL "organizationId"`),
	check("member_userId_not_null", sql`NOT NULL "userId"`),
	check("member_role_not_null", sql`NOT NULL role`),
	check("member_createdAt_not_null", sql`NOT NULL "createdAt"`),
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
	unique("session_token_unique").on(table.token),
	check("session_id_not_null", sql`NOT NULL id`),
	check("session_expiresAt_not_null", sql`NOT NULL "expiresAt"`),
	check("session_token_not_null", sql`NOT NULL token`),
	check("session_createdAt_not_null", sql`NOT NULL "createdAt"`),
	check("session_updatedAt_not_null", sql`NOT NULL "updatedAt"`),
	check("session_userId_not_null", sql`NOT NULL "userId"`),
]);

export const patients = pgTable("patients", {
	id: text().default(uuidv7()).primaryKey().notNull(),
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
		}).onDelete("cascade"),
	check("patients_id_not_null", sql`NOT NULL id`),
	check("patients_hospital_id_not_null", sql`NOT NULL hospital_id`),
	check("patients_name_not_null", sql`NOT NULL name`),
	check("patients_gender_not_null", sql`NOT NULL gender`),
	check("patients_mobile_number_not_null", sql`NOT NULL mobile_number`),
	check("patients_created_at_not_null", sql`NOT NULL created_at`),
	check("patients_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const staff = pgTable("staff", {
	id: text().default(uuidv7()).primaryKey().notNull(),
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
		}).onDelete("cascade"),
	check("staff_id_not_null", sql`NOT NULL id`),
	check("staff_user_id_not_null", sql`NOT NULL user_id`),
	check("staff_hospital_id_not_null", sql`NOT NULL hospital_id`),
	check("staff_gender_not_null", sql`NOT NULL gender`),
	check("staff_created_at_not_null", sql`NOT NULL created_at`),
	check("staff_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const doctors = pgTable("doctors", {
	id: text().default(uuidv7()).primaryKey().notNull(),
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
		}).onDelete("cascade"),
	check("doctors_id_not_null", sql`NOT NULL id`),
	check("doctors_staff_id_not_null", sql`NOT NULL staff_id`),
	check("doctors_hospital_id_not_null", sql`NOT NULL hospital_id`),
	check("doctors_specialization_not_null", sql`NOT NULL specialization`),
	check("doctors_qualification_not_null", sql`NOT NULL qualification`),
	check("doctors_experience_not_null", sql`NOT NULL experience`),
	check("doctors_consultation_fee_not_null", sql`NOT NULL consultation_fee`),
	check("doctors_created_at_not_null", sql`NOT NULL created_at`),
	check("doctors_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const appointments = pgTable("appointments", {
	id: text().default(uuidv7()).primaryKey().notNull(),
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
		}).onDelete("cascade"),
	check("appointments_id_not_null", sql`NOT NULL id`),
	check("appointments_hospital_id_not_null", sql`NOT NULL hospital_id`),
	check("appointments_patient_id_not_null", sql`NOT NULL patient_id`),
	check("appointments_doctor_user_id_not_null", sql`NOT NULL doctor_user_id`),
	check("appointments_appointment_date_not_null", sql`NOT NULL appointment_date`),
	check("appointments_appointment_time_not_null", sql`NOT NULL appointment_time`),
	check("appointments_status_not_null", sql`NOT NULL status`),
	check("appointments_created_at_not_null", sql`NOT NULL created_at`),
	check("appointments_updated_at_not_null", sql`NOT NULL updated_at`),
]);

export const prescriptions = pgTable("prescriptions", {
	id: text().default(uuidv7()).primaryKey().notNull(),
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
		}).onDelete("cascade"),
	check("prescriptions_id_not_null", sql`NOT NULL id`),
	check("prescriptions_hospital_id_not_null", sql`NOT NULL hospital_id`),
	check("prescriptions_appointment_id_not_null", sql`NOT NULL appointment_id`),
	check("prescriptions_patient_id_not_null", sql`NOT NULL patient_id`),
	check("prescriptions_doctor_user_id_not_null", sql`NOT NULL doctor_user_id`),
	check("prescriptions_diagnosis_not_null", sql`NOT NULL diagnosis`),
	check("prescriptions_medicines_not_null", sql`NOT NULL medicines`),
	check("prescriptions_created_at_not_null", sql`NOT NULL created_at`),
	check("prescriptions_updated_at_not_null", sql`NOT NULL updated_at`),
]);
