import { pgTable, unique, serial, text, timestamp, foreignKey, boolean, index, jsonb, date, integer, numeric, primaryKey, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const useUUIDv4 = sql`uuid_generate_v4()`;

export const specializations = pgTable("specializations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("specializations_name_unique").on(table.name),
]);

export const appointmentPriorities = pgTable("appointment_priorities", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	priority: text().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "appointment_priorities_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
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

export const account = pgTable("account", {
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
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "account_user_id_user_id_fk"
	}).onDelete("cascade"),
]);

export const session = pgTable("session", {
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
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "session_user_id_user_id_fk"
	}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const doctors = pgTable("doctors", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
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
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctors_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.staffId],
		foreignColumns: [staff.id],
		name: "doctors_staff_id_staff_id_fk"
	}).onDelete("cascade"),
]);

export const doctorShifts = pgTable("doctor_shifts", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	doctorUserId: text("doctor_user_id").notNull(),
	shiftId: text("shift_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.doctorUserId],
		foreignColumns: [doctors.id],
		name: "doctor_shifts_doctor_user_id_doctors_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctor_shifts_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.shiftId],
		foreignColumns: [shifts.id],
		name: "doctor_shifts_shift_id_shifts_id_fk"
	}).onDelete("cascade"),
	unique("doctor_shift_unique").on(table.doctorUserId, table.shiftId),
]);

export const shifts = pgTable("shifts", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "shifts_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const staff = pgTable("staff", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
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
		foreignColumns: [organization.id],
		name: "staff_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	metadata: text(),
}, (table) => [
	unique("organization_slug_unique").on(table.slug),
]);

export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	email: text().notNull(),
	role: text(),
	status: text().default('pending').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	inviterId: text("inviter_id").notNull(),
}, (table) => [
	index("invitation_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("invitation_organizationId_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.inviterId],
		foreignColumns: [user.id],
		name: "invitation_inviter_id_user_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organization.id],
		name: "invitation_organization_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text().notNull(),
	role: text().default('member').notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("member_organizationId_idx").using("btree", table.organizationId.asc().nullsLast().op("text_ops")),
	index("member_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organization.id],
		name: "member_organization_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "member_user_id_user_id_fk"
	}).onDelete("cascade"),
]);

export const medicineCategories = pgTable("medicine_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_categories_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const modules = pgTable("modules", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	hospitalId: text("hospital_id").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "modules_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const patients = pgTable("patients", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
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
		foreignColumns: [organization.id],
		name: "patients_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const appointments = pgTable("appointments", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
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
	services: jsonb(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "appointments_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "appointments_patient_id_patients_id_fk"
	}).onDelete("cascade"),
]);

export const doctorSlots = pgTable("doctor_slots", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	doctorId: text("doctor_id").notNull(),
	shiftId: text("shift_id").notNull(),
	day: text().notNull(),
	timeFrom: text("time_from").notNull(),
	timeTo: text("time_to").notNull(),
	durationMins: integer("duration_mins").notNull(),
	chargeId: text("charge_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.chargeId],
		foreignColumns: [charges.id],
		name: "doctor_slots_charge_id_charges_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.doctorId],
		foreignColumns: [doctors.id],
		name: "doctor_slots_doctor_id_doctors_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctor_slots_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.shiftId],
		foreignColumns: [shifts.id],
		name: "doctor_slots_shift_id_shifts_id_fk"
	}).onDelete("cascade"),
]);

export const prescriptions = pgTable("prescriptions", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
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
		columns: [table.appointmentId],
		foreignColumns: [appointments.id],
		name: "prescriptions_appointment_id_appointments_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "prescriptions_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "prescriptions_patient_id_patients_id_fk"
	}).onDelete("cascade"),
]);

export const floors = pgTable("floors", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	description: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "floors_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const bedGroups = pgTable("bed_groups", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	description: text(),
	floorId: text("floor_id").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.floorId],
		foreignColumns: [floors.id],
		name: "bed_groups_floor_id_floors_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "bed_groups_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const bedsTypes = pgTable("beds_types", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	description: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "beds_types_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const beds = pgTable("beds", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	bedTypeId: text("bed_type_id").notNull(),
	bedGroupId: text("bed_group_id").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.bedGroupId],
		foreignColumns: [bedGroups.id],
		name: "beds_bed_group_id_bed_groups_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.bedTypeId],
		foreignColumns: [bedsTypes.id],
		name: "beds_bed_type_id_beds_types_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "beds_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const chargeTypes = pgTable("charge_types", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	hospitalId: text("hospital_id").notNull(),
	modules: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charge_types_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const chargeCategories = pgTable("charge_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	description: text(),
	chargeTypeId: text("charge_type_id").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.chargeTypeId],
		foreignColumns: [chargeTypes.id],
		name: "charge_categories_charge_type_id_charge_types_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charge_categories_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const charges = pgTable("charges", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	description: text(),
	chargeCategoryId: text("charge_category_id").notNull(),
	chargeTypeId: text("charge_type_id").notNull(),
	unitId: text("unit_id").notNull(),
	taxCategoryId: text("tax_category_id").notNull(),
	amount: numeric().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.chargeCategoryId],
		foreignColumns: [chargeCategories.id],
		name: "charges_charge_category_id_charge_categories_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.chargeTypeId],
		foreignColumns: [chargeTypes.id],
		name: "charges_charge_type_id_charge_types_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charges_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.taxCategoryId],
		foreignColumns: [taxCategories.id],
		name: "charges_tax_category_id_tax_categories_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.unitId],
		foreignColumns: [units.id],
		name: "charges_unit_id_units_id_fk"
	}).onDelete("cascade"),
]);

export const units = pgTable("units", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
});

export const taxCategories = pgTable("tax_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	hospitalId: text("hospital_id").notNull(),
	percent: numeric().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "tax_categories_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const medicineCompanies = pgTable("medicine_companies", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_companies_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const medicineGroups = pgTable("medicine_groups", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_groups_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const medicineSuppliers = pgTable("medicine_suppliers", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	supplierName: text("supplier_name").notNull(),
	contactNumber: text("contact_number").notNull(),
	address: text().notNull(),
	contactPerson: text("contact_person").notNull(),
	contactPersonNumber: text("contact_person_number").notNull(),
	drugLicenseNumber: text("drug_license_number").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_suppliers_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const medicineUnits = pgTable("medicine_units", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_units_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const medicines = pgTable("medicines", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	categoryId: text("category_id").notNull(),
	companyName: text("company_name").notNull(),
	unitId: text("unit_id").notNull(),
	notes: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	groupId: text("group_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [medicineCategories.id],
		name: "medicines_category_id_medicine_categories_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.companyName],
		foreignColumns: [medicineCompanies.id],
		name: "medicines_company_name_medicine_companies_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.groupId],
		foreignColumns: [medicineGroups.id],
		name: "medicines_group_id_medicine_groups_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicines_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.unitId],
		foreignColumns: [medicineUnits.id],
		name: "medicines_unit_id_medicine_units_id_fk"
	}).onDelete("cascade"),
]);

export const roles = pgTable("roles", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	hospitalId: text("hospital_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "roles_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const services = pgTable("services", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	amount: numeric().notNull(),
	description: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "services_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const team = pgTable("team", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	organizationId: text("organization_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organization.id],
		name: "team_organization_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const teamMember = pgTable("team_member", {
	id: text().primaryKey().notNull(),
	teamId: text("team_id").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
		columns: [table.teamId],
		foreignColumns: [team.id],
		name: "team_member_team_id_team_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "team_member_user_id_user_id_fk"
	}).onDelete("cascade"),
]);

export const transactions = pgTable("transactions", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	patientId: text("patient_id").notNull(),
	appointmentId: text("appointment_id").notNull(),
	amount: serial().notNull(),
	status: text().notNull(),
	paymentMethod: text("payment_method").notNull(),
	transactionDate: timestamp("transaction_date", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.appointmentId],
		foreignColumns: [appointments.id],
		name: "transactions_appointment_id_appointments_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "transactions_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "transactions_patient_id_patients_id_fk"
	}).onDelete("cascade"),
]);

export const vitals = pgTable("vitals", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	vitalsUnit: text("vitals_unit").notNull(),
	from: text().notNull(),
	to: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "vitals_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
]);

export const settings = pgTable("settings", {
	organizationId: varchar("organization_id", { length: 256 }).notNull(),
	key: varchar({ length: 256 }).notNull(),
	value: varchar({ length: 256 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	primaryKey({ columns: [table.organizationId, table.key], name: "settings_key_unique" }),
]);


export const organizationRole = pgTable(
  "organization_role",
  {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
	  .notNull()
	  .references(() => organization.id, { onDelete: "cascade" }),
	role: text("role").notNull(),
	permission: text("permission").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").$onUpdate(
	  () => /* @__PURE__ */ new Date(),
	),
  },
  (table) => [
	index("organizationRole_organizationId_idx").on(table.organizationId),
	index("organizationRole_role_idx").on(table.role),
  ],
);