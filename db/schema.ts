import { Description } from "@radix-ui/react-alert-dialog";
import { batched } from "better-auth/react";
import { create } from "domain";
import { desc, relations, sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, foreignKey, jsonb, numeric, serial, unique, date, integer, varchar, primaryKey, pgEnum } from "drizzle-orm/pg-core";

const useUUIDv4 = sql`uuid_generate_v4()`;

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		activeOrganizationId: text("active_organization_id"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organization = pgTable("organization", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
});

export const member = pgTable(
	"member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [
		index("member_organizationId_idx").on(table.organizationId),
		index("member_userId_idx").on(table.userId),
	],
);

export const invitation = pgTable(
	"invitation",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role"),
		status: text("status").default("pending").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		inviterId: text("inviter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("invitation_organizationId_idx").on(table.organizationId),
		index("invitation_email_idx").on(table.email),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	members: many(member),
	invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	organizationRoles: many(organizationRole),
	members: many(member),
	invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}));

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
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "bed_groups_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
]);

export const beds = pgTable("beds", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	bedTypeId: text("bed_type_id").notNull(),
	bedGroupId: text("bed_group_id").notNull(),
	status: text("status").default("active").notNull(),
	isOccupied: boolean("is_occupied").default(false),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.bedTypeId],
		foreignColumns: [bedsTypes.id],
		name: "beds_bed_type_id_beds_types_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.bedGroupId],
		foreignColumns: [bedGroups.id],
		name: "beds_bed_group_id_bed_groups_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "beds_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
]);

export const chargeTypes = pgTable("charge_types", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	hospitalId: text("hospital_id").notNull(),
	modules: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charge_types_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charge_categories_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.chargeTypeId],
		foreignColumns: [chargeTypes.id],
		name: "charges_charge_type_id_charge_types_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.unitId],
		foreignColumns: [units.id],
		name: "charges_unit_id_units_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.taxCategoryId],
		foreignColumns: [taxCategories.id],
		name: "charges_tax_category_id_tax_categories_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "charges_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
]);

export const medicineCategories = pgTable("medicine_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_categories_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const modules = pgTable("modules", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	hospitalId: text("hospital_id").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "modules_hospital_id_organization_id_fk"
	}).onDelete("cascade"),
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
	}).onDelete("restrict"),
]);

export const shifts = pgTable("shifts", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	startTime: text("start_time").notNull(),
	endTime: text("end_time").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "shifts_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const specializations = pgTable("specializations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	unique("specializations_name_unique").on(table.name),
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
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.shiftId],
		foreignColumns: [shifts.id],
		name: "doctor_shifts_shift_id_shifts_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctor_shifts_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
	unique("doctor_shift_unique").on(table.doctorUserId, table.shiftId),
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
	isAdmitted: boolean("is_admitted").default(false),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "patients_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	}).onDelete("restrict"),
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
		columns: [table.staffId],
		foreignColumns: [staff.id],
		name: "doctors_staff_id_staff_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctors_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	vitals: jsonb(),
}, (table) => [
	foreignKey({
		columns: [table.appointmentId],
		foreignColumns: [appointments.id],
		name: "prescriptions_appointment_id_appointments_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "prescriptions_patient_id_patients_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "prescriptions_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "appointments_patient_id_patients_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "appointments_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.doctorId],
		foreignColumns: [doctors.id],
		name: "doctor_slots_doctor_id_doctors_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.shiftId],
		foreignColumns: [shifts.id],
		name: "doctor_slots_shift_id_shifts_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.chargeId],
		foreignColumns: [charges.id],
		name: "doctor_slots_charge_id_charges_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "doctor_slots_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);
export const medicineGroups = pgTable("medicine_groups", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_groups_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_suppliers_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const medicines = pgTable("medicines", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	categoryId: text("category_id").notNull(),
	companyName: text("company_name").notNull(),
	groupId: text("group_id").notNull(),
	unitId: text("unit_id").notNull(),
	notes: text(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.groupId],
		foreignColumns: [medicineGroups.id],
		name: "medicines_group_id_medicine_groups_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [medicineCategories.id],
		name: "medicines_category_id_medicine_categories_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.companyName],
		foreignColumns: [medicineCompanies.id],
		name: "medicines_company_name_medicine_companies_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.unitId],
		foreignColumns: [medicineUnits.id],
		name: "medicines_unit_id_medicine_units_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicines_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const team = pgTable("team", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	organizationId: text("organization_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
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
	createdAt: timestamp("created_at", { mode: 'date' }),
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

export const vitals = pgTable("vitals", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	vitalsUnit: text("vitals_unit").notNull(),
	from: text().notNull(),
	to: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "vitals_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const medicineUnits = pgTable("medicine_units", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_units_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const medicineCompanies = pgTable("medicine_companies", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "medicine_companies_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const roles = pgTable("roles", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	hospitalId: text("hospital_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
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
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "services_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const transactions = pgTable("transactions", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	patientId: text("patient_id").notNull(),
	appointmentId: text("appointment_id").notNull(),
	amount: serial().notNull(),
	status: text().notNull(),
	paymentMethod: text("payment_method").notNull(),
	transactionDate: timestamp("transaction_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.patientId],
		foreignColumns: [patients.id],
		name: "transactions_patient_id_patients_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.appointmentId],
		foreignColumns: [appointments.id],
		name: "transactions_appointment_id_appointments_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.hospitalId],
		foreignColumns: [organization.id],
		name: "transactions_hospital_id_organization_id_fk"
	}).onDelete("restrict"),
]);

export const settings = pgTable("settings", {
	organizationId: varchar("organization_id", { length: 256 }).notNull(),
	key: varchar({ length: 256 }).notNull(),
	value: varchar({ length: 256 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	primaryKey({ columns: [table.key, table.organizationId], name: "settings_key_unique" }),
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


export const organizationRoleRelations = relations(
	organizationRole,
	({ one }) => ({
		organization: one(organization, {
			fields: [organizationRole.organizationId],
			references: [organization.id],
		}),
	}),
);

// pharmacy medicines
export const pharmacyMedicines = pgTable("pharmacy_medicines", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text().notNull(),
	categoryId: text("category_id").notNull()
		.references(() => medicineCategories.id, { onDelete: "restrict" }),
	companyId: text("company_id").notNull()
		.references(() => medicineCompanies.id, { onDelete: "restrict" }),
	groupId: text("group_id").notNull()
		.references(() => medicineGroups.id, { onDelete: "restrict" }),
	unitId: text("unit_id").notNull()
		.references(() => medicineUnits.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pharmacy stock table
export const pharmacyStock = pgTable("pharmacy_stock", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	medicineId: text("medicine_id")
		.notNull()
		.references(() => pharmacyMedicines.id, { onDelete: "restrict" }),
	batchNumber: text("batch_number").notNull(),
	quantity: numeric("quantity").default("0").notNull(),
	lowStockAlert: integer("low_stock_alert").notNull().default(10),
	costPrice: numeric("cost_price").notNull(),
	mrp: numeric("mrp").notNull(),
	sellingPrice: numeric("selling_price").default("0").notNull(),
	expiryDate: date("expiry_date").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// medicine purchase table
export const pharmacyPurchase = pgTable("pharmacy_purchase", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	supplierId: text("supplier_id")
		.notNull()
		.references(() => medicineSuppliers.id, { onDelete: "restrict" }),
	billNumber: text("bill_number").notNull(),
	discount: numeric("discount"),
	gstPercent: numeric("gst_percent"),
	purchaseDate: timestamp("purchase_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	purchaseAmount: numeric("purchase_amount").notNull(),
});

// purchase item table
export const pharmacyPurchaseItem = pgTable("pharmacy_purchase_item", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	purchaseId: text("purchase_id")
		.notNull()
		.references(() => pharmacyPurchase.id, { onDelete: "restrict" }),
	medicineId: text("medicine_id")
		.notNull()
		.references(() => pharmacyMedicines.id, { onDelete: "restrict" }),
	batchNumber: text("batch_number").notNull(),
	quantity: numeric("quantity").notNull(),
	costPrice: numeric("cost_price").notNull(),
	sellingPrice: numeric("selling_price").default("0").notNull(),
	mrp: numeric("mrp").notNull(),
	amount: numeric("amount").notNull(),  // qty * cost - discount
	expiryDate: date("expiry_date").notNull(), // stored per batch
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Medicine sales Table
export const pharmacySales = pgTable("pharmacy_sales", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	billNumber: text("bill_number").notNull(),
	customerName: text("customer_name").notNull(),
	customerPhone: text("customer_phone").notNull(),
	totalAmount: numeric("total_amount").notNull(),
	discount: numeric("discount").notNull().default("0"),
	taxAmount: numeric("tax_amount").notNull().default("0"),
	netAmount: numeric("net_amount").notNull(),
	paymentMode: text("payment_mode").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// sales items Table
export const pharmacySalesItems = pgTable("pharmacy_sales_items", {
	id: text("id").default(useUUIDv4).primaryKey(),
	hospitalId: text("hospital_id")
		.notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	billId: text("bill_id")
		.notNull()
		.references(() => pharmacySales.id, { onDelete: "restrict" }),
	medicineId: text("medicine_id")
		.notNull()
		.references(() => pharmacyMedicines.id, { onDelete: "restrict" }),
	batchNumber: text("batch_number"),
	quantity: numeric("quantity").notNull(),
	unitPrice: numeric("unit_price").notNull(),
	totalAmount: numeric("total_amount").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


// Symptom Types Table
export const symptomTypes = pgTable("symptom_types", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
});

// Symptoms Table
export const symptoms = pgTable("symptoms", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	symptomTypeId: text("symptom_type_id").notNull()
		.references(() => symptomTypes.id, { onDelete: "restrict" }),
	name: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
});

// Operation Catgory Table
export const operationCategories = pgTable("operation_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull(),
	name: text().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// Operation Table
export const operations = pgTable("operations", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	operationCategoryId: text("operation_category_id").notNull()
		.references(() => operationCategories.id, { onDelete: "restrict" }),
	name: text().notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

// table ipd admission table
export const dischargeStatusEnum = pgEnum("discharge_status", ["pending", "normal", "referal", "death"]);

export const ipdAdmission = pgTable("ipd_admission", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	patientId: text("patient_id").notNull()
		.references(() => patients.id, { onDelete: "restrict" }),
	caseId: text("case_id"),
	caseDetails: text("case_details"),
	diagnosis: jsonb("diagnosis"),
	casuality: boolean("casuality").default(false),
	creditLimit: numeric("credit_limit").default("0").notNull(),
	refrenceFrom: text("refrence_from"),
	doctorId: text("doctor_id")
		.references(() => doctors.id, { onDelete: "restrict" }),
	bedGroupId: text("bed_group_id")
		.references(() => bedGroups.id, { onDelete: "restrict" }),
	bedId: text("bed_id")
		.references(() => beds.id, { onDelete: "restrict" }),
	notes: text("notes"),
	medicalHistory: text("medical_history"),
	admissionDate: timestamp("admission_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	dischargeDate: timestamp("discharge_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	dischargeStatus: dischargeStatusEnum("discharge_status").default("pending"),
	dischargeInfo: jsonb("discharge_info"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
});

// table ipd_consultation
export const ipdConsultation = pgTable("ipd_consultation", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	doctorId: text("doctor_id")
		.references(() => doctors.id, { onDelete: "restrict" }),
	appliedDate: timestamp("applied_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	consultationDate: timestamp("consultation_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	consultationTime: timestamp("consultation_time", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	consultationDetails: text("consultation_details"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
});


// IPD Operation Table	
export const ipdOperations = pgTable("ipd_operations", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	operationId: text("operation_id").notNull()
		.references(() => operations.id, { onDelete: "restrict" }),
	operationDate: timestamp("operation_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	doctors: jsonb("doctors").notNull(),
	operationTime: timestamp("operation_time", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	anaesthetist: jsonb("anaesthetist"),
	anaesthetiaType: text("anaesthetia_type"),
	operationDetails: text("operation_details"),
	supportStaff: jsonb("support_staff"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	isDeleted: boolean("is_deleted").default(false),
});

// IPD Vital Table
export const ipdVitals = pgTable("ipd_vitals", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	vitals: jsonb("vitals").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// IPD Charges Table
export const ipdCharges = pgTable("ipd_charges", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	chargeTypeId: text("charge_type_id").notNull()
		.references(() => chargeTypes.id, { onDelete: "restrict" }),
	chargeCategoryId: text("charge_category_id").notNull()
		.references(() => chargeCategories.id, { onDelete: "restrict" }),
	chargeId: text("charge_id").notNull()
		.references(() => charges.id, { onDelete: "restrict" }),
	qty: integer("qty").notNull(),
	standardCharge: numeric("standard_charge").notNull(),
	totalAmount: numeric("total_amount").notNull(),
	discountPercent: numeric("discount_percent").notNull(),
	taxPercent: numeric("tax_percent").notNull(),
	note: text("note"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// IPD Prescription Table
export const ipdPrescriptions = pgTable("ipd_prescriptions", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	symptoms: text(),
	note: text(),
	medicines: jsonb().notNull(),
	attachments: text(),
	prescribeBy: text()
		.references(() => doctors.id, { onDelete: "restrict" }),
	prescribeDate: timestamp("prescribe_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// IPD Payment Table
export const ipdPayments = pgTable("ipd_payments", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	paymentDate: timestamp("payment_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	paymentMode: text("payment_mode").notNull(),
	paymentAmount: numeric("payment_amount").notNull(),
	paymentNote: text("payment_note"),
	referenceId: text("reference_id"),
	toCredit: boolean("to_credit").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// IPD Medication Table
export const ipdMedications = pgTable("ipd_medications", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	ipdAdmissionId: text("ipd_admission_id").notNull()
		.references(() => ipdAdmission.id, { onDelete: "restrict" }),
	medicineId: text("medicine_id").notNull()
		.references(() => medicines.id, { onDelete: "restrict" }),
	dose: jsonb("dose").notNull(),
	date: date("date").notNull(),
	note: text("note"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Pathology Category Table
export const pathologyCategories = pgTable("pathology_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Pathology Unit Table
export const pathologyUnits = pgTable("pathology_units", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


// Pathology Test Table	
export const pathologyTests = pgTable("pathology_tests", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	testName: text("test_name").notNull(),
	shortName: text("short_name"),
	sampleType: text("sample_type").notNull(),
	description: text("description"),
	categoryId: text("category_id").notNull()
		.references(() => pathologyCategories.id, { onDelete: "restrict" }),
	subCategoryId: text("sub_category_id"),
	method: text("method"),
	reportHours: integer("report_hours").notNull(),
	chargeCategoryId: text("charge_category_id").notNull()
		.references(() => chargeCategories.id, { onDelete: "restrict" }),
	chargeId: text("charge_id").notNull()
		.references(() => charges.id, { onDelete: "restrict" }),
	chargeName: text("charge_name").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Pathology Parameter Table
export const pathologyParameters = pgTable("pathology_parameters", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	description: text("description"),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	paramName: text("param_name").notNull(),
	testId: text("test_id").notNull()
		.references(() => pathologyTests.id, { onDelete: "restrict" }),
	fromRange: text("from_range").notNull(),
	toRange: text("to_range").notNull(),
	unitId: text("unit_id").notNull()
		.references(() => pathologyUnits.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_orders table
export const pathologyOrders = pgTable("pathology_orders", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	patientId: text("patient_id").notNull()
		.references(() => patients.id, { onDelete: "restrict" }),
	doctorId: text("doctor_id"),
	doctorName: text("doctor_name"),
	isSampleAtHome: boolean("is_sample_at_home").default(false),
	sampleData: jsonb("sample_data"),
	orderDate: timestamp("order_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	remarks: text("remarks"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_order_tests table
export const pathologyOrderTests = pgTable("pathology_order_tests", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderId: text("order_id").notNull()
		.references(() => pathologyOrders.id, { onDelete: "restrict" }),
	testId: text("test_id").notNull()
		.references(() => pathologyTests.id, { onDelete: "restrict" }),
	price: numeric("price").notNull(),
	tax: numeric("tax").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_samples table
export const pathologySamples = pgTable("pathology_samples", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderTestID: text('order_test_id').notNull()
		.references(() => pathologyOrderTests.id, { onDelete: "restrict" }),
	sampleNumber: text("sample_number").notNull(),
	sampleType: text("sample_type").notNull(),
	sampleDate: timestamp("sample_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	sampleStatus: text("sample_status").notNull(),
	collectedBy: text("collected_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_results table
export const pathologyResults = pgTable("pathology_results", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderTestID: text('order_test_id').notNull()
		.references(() => pathologyOrderTests.id, { onDelete: "restrict" }),
	resultDate: timestamp("result_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	remarks: text("remarks").notNull(),
	approvedBy: text('approved_by'),
	approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_result_values table
export const pathologyResultValues = pgTable("pathology_result_values", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	resultID: text('result_id').notNull()
		.references(() => pathologyResults.id, { onDelete: "restrict" }),
	parameterID: text('parameter_id').notNull()
		.references(() => pathologyParameters.id, { onDelete: "restrict" }),
	resultValue: text('result_value').notNull(),
	unit: text('unit').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// pathology_bills_status_enum
export const pathologyBillsStatusEnum = pgEnum("pathology_bills_status", ["pending", "paid", "partially_paid", "refunded"]);


// pathology_bills table
export const pathologyBills = pgTable("pathology_bills", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderId: text('order_id').notNull()
		.references(() => pathologyOrders.id, { onDelete: "restrict" }),
	billDate: timestamp("bill_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	billDiscount: numeric("bill_discount").notNull(),
	billTotalAmount: numeric("bill_total_amount").notNull(),
	billNetAmount: numeric("bill_net_amount").notNull(),
	billStatus: pathologyBillsStatusEnum("bill_status").notNull().default("pending"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});



// pathology_payments table
export const pathologyPayments = pgTable("pathology_payments", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	billId: text('bill_id').notNull()
		.references(() => pathologyBills.id, { onDelete: "restrict" }),
	paymentDate: timestamp("payment_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	paymentAmount: numeric("payment_amount").notNull(),
	paymentMode: text("payment_mode").notNull(),
	referenceNo: text('reference_no'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


// Radiology Category Table
export const radiologyCategories = pgTable("radiology_categories", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// Radiology Unit Table
export const radiologyUnits = pgTable("radiology_units", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	name: text("name").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// Radiology Test Table	
export const radiologyTests = pgTable("radiology_tests", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	testName: text("test_name").notNull(),
	shortName: text("short_name"),
	testType: text("test_type"),
	description: text("description"),
	categoryId: text("category_id").notNull()
		.references(() => radiologyCategories.id, { onDelete: "restrict" }),
	subCategoryId: text("sub_category_id"),
	reportHours: integer("report_hours").notNull(),
	chargeCategoryId: text("charge_category_id").notNull()
		.references(() => chargeCategories.id, { onDelete: "restrict" }),
	chargeId: text("charge_id").notNull()
		.references(() => charges.id, { onDelete: "restrict" }),
	chargeName: text("charge_name").notNull(),
	isDeleted: boolean("is_deleted").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// Radiology Parameter Table
export const radiologyParameters = pgTable("radiology_parameters", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	description: text("description"),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	paramName: text("param_name").notNull(),
	testId: text("test_id").notNull()
		.references(() => radiologyTests.id, { onDelete: "restrict" }),
	fromRange: text("from_range").notNull(),
	toRange: text("to_range").notNull(),
	unitId: text("unit_id").notNull()
		.references(() => radiologyUnits.id, { onDelete: "restrict" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});


// radiology_orders table
export const radiologyOrders = pgTable("radiology_orders", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	patientId: text("patient_id").notNull()
		.references(() => patients.id, { onDelete: "restrict" }),
	doctorId: text("doctor_id"),
	doctorName: text("doctor_name"),
	orderDate: timestamp("order_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	remarks: text("remarks"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// radiology_order_tests table
export const radiologyOrderTests = pgTable("radiology_order_tests", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderId: text("order_id").notNull()
		.references(() => radiologyOrders.id, { onDelete: "restrict" }),
	testId: text("test_id").notNull()
		.references(() => radiologyTests.id, { onDelete: "restrict" }),
	price: numeric("price").notNull(),
	tax: numeric("tax").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// radiology_results table
export const radiologyResults = pgTable("radiology_results", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderTestID: text('order_test_id').notNull()
		.references(() => radiologyOrderTests.id, { onDelete: "restrict" }),
	resultDate: timestamp("result_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	remarks: text("remarks").notNull(),
	tecnnician_name: text('tecnnician_name'),
	approvedBy: text('approved_by'),
	approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// radiology_result_values table
export const radiologyResultValues = pgTable("radiology_result_values", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	resultID: text('result_id').notNull()
		.references(() => radiologyResults.id, { onDelete: "restrict" }),
	parameterID: text('parameter_id').notNull()
		.references(() => radiologyParameters.id, { onDelete: "restrict" }),
	resultValue: text('result_value').notNull(),
	unit: text('unit').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// radiology_bills_status_enum
export const radiologyBillsStatusEnum = pgEnum("radiology_bills_status", ["pending", "paid", "partially_paid", "refunded"]);


// radiology_bills table
export const radiologyBills = pgTable("radiology_bills", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	orderId: text('order_id').notNull()
		.references(() => radiologyOrders.id, { onDelete: "restrict" }),
	billDate: timestamp("bill_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	billDiscount: numeric("bill_discount").notNull(),
	billTotalAmount: numeric("bill_total_amount").notNull(),
	billNetAmount: numeric("bill_net_amount").notNull(),
	billStatus: radiologyBillsStatusEnum("bill_status").notNull().default("pending"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});



// radiology_payments table
export const radiologyPayments = pgTable("radiology_payments", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	billId: text('bill_id').notNull()
		.references(() => radiologyBills.id, { onDelete: "restrict" }),
	paymentDate: timestamp("payment_date", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	paymentAmount: numeric("payment_amount").notNull(),
	paymentMode: text("payment_mode").notNull(),
	referenceNo: text('reference_no'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});

// ambulance table
export const ambulanceStatusEnum = pgEnum("ambulance_status", ["active", "inactive", "maintenance"]);
export const ambulanceTypeEnum = pgEnum("ambulance_type", ["rented", "owned"]);

export const ambulance = pgTable("ambulance", {
	id: text().default(useUUIDv4).primaryKey().notNull(),
	hospitalId: text("hospital_id").notNull()
		.references(() => organization.id, { onDelete: "restrict" }),
	vehicleNumber: text("vehicle_number").notNull(),
	vehicleType: ambulanceTypeEnum("vehicle_type").notNull(),
	vehicleModel: text("vehicle_model").notNull(),
	vehicleYear: text("vehicle_year").notNull(),
	driverName: text("driver_name").notNull(),
	driverContactNo: text("driver_contact_no").notNull(),
	driverLicenseNo: text("driver_license_no").notNull(),
	status: ambulanceStatusEnum("status").notNull().default("active"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
});