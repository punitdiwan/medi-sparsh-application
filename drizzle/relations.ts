import { relations } from "drizzle-orm/relations";
import { organization, appointmentPriorities, user, account, session, doctors, staff, doctorShifts, shifts, invitation, member, medicineCategories, modules, patients, appointments, charges, doctorSlots, prescriptions, floors, bedGroups, bedsTypes, beds, chargeTypes, chargeCategories, taxCategories, units, medicineCompanies, medicineGroups, medicineSuppliers, medicineUnits, medicines, roles, services, team, teamMember, transactions, vitals } from "./schema";

export const appointmentPrioritiesRelations = relations(appointmentPriorities, ({one}) => ({
	organization: one(organization, {
		fields: [appointmentPriorities.hospitalId],
		references: [organization.id]
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	appointmentPriorities: many(appointmentPriorities),
	doctors: many(doctors),
	doctorShifts: many(doctorShifts),
	shifts: many(shifts),
	staff: many(staff),
	invitations: many(invitation),
	members: many(member),
	medicineCategories: many(medicineCategories),
	modules: many(modules),
	patients: many(patients),
	appointments: many(appointments),
	doctorSlots: many(doctorSlots),
	prescriptions: many(prescriptions),
	floors: many(floors),
	bedGroups: many(bedGroups),
	bedsTypes: many(bedsTypes),
	beds: many(beds),
	chargeTypes: many(chargeTypes),
	chargeCategories: many(chargeCategories),
	charges: many(charges),
	taxCategories: many(taxCategories),
	medicineCompanies: many(medicineCompanies),
	medicineGroups: many(medicineGroups),
	medicineSuppliers: many(medicineSuppliers),
	medicineUnits: many(medicineUnits),
	medicines: many(medicines),
	roles: many(roles),
	services: many(services),
	teams: many(team),
	transactions: many(transactions),
	vitals: many(vitals),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	invitations: many(invitation),
	members: many(member),
	teamMembers: many(teamMember),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	organization: one(organization, {
		fields: [doctors.hospitalId],
		references: [organization.id]
	}),
	staff: one(staff, {
		fields: [doctors.staffId],
		references: [staff.id]
	}),
	doctorShifts: many(doctorShifts),
	doctorSlots: many(doctorSlots),
}));

export const staffRelations = relations(staff, ({one, many}) => ({
	doctors: many(doctors),
	organization: one(organization, {
		fields: [staff.hospitalId],
		references: [organization.id]
	}),
}));

export const doctorShiftsRelations = relations(doctorShifts, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorShifts.doctorUserId],
		references: [doctors.id]
	}),
	organization: one(organization, {
		fields: [doctorShifts.hospitalId],
		references: [organization.id]
	}),
	shift: one(shifts, {
		fields: [doctorShifts.shiftId],
		references: [shifts.id]
	}),
}));

export const shiftsRelations = relations(shifts, ({one, many}) => ({
	doctorShifts: many(doctorShifts),
	organization: one(organization, {
		fields: [shifts.hospitalId],
		references: [organization.id]
	}),
	doctorSlots: many(doctorSlots),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const medicineCategoriesRelations = relations(medicineCategories, ({one, many}) => ({
	organization: one(organization, {
		fields: [medicineCategories.hospitalId],
		references: [organization.id]
	}),
	medicines: many(medicines),
}));

export const modulesRelations = relations(modules, ({one}) => ({
	organization: one(organization, {
		fields: [modules.hospitalId],
		references: [organization.id]
	}),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	organization: one(organization, {
		fields: [patients.hospitalId],
		references: [organization.id]
	}),
	appointments: many(appointments),
	prescriptions: many(prescriptions),
	transactions: many(transactions),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	organization: one(organization, {
		fields: [appointments.hospitalId],
		references: [organization.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	prescriptions: many(prescriptions),
	transactions: many(transactions),
}));

export const doctorSlotsRelations = relations(doctorSlots, ({one}) => ({
	charge: one(charges, {
		fields: [doctorSlots.chargeId],
		references: [charges.id]
	}),
	doctor: one(doctors, {
		fields: [doctorSlots.doctorId],
		references: [doctors.id]
	}),
	organization: one(organization, {
		fields: [doctorSlots.hospitalId],
		references: [organization.id]
	}),
	shift: one(shifts, {
		fields: [doctorSlots.shiftId],
		references: [shifts.id]
	}),
}));

export const chargesRelations = relations(charges, ({one, many}) => ({
	doctorSlots: many(doctorSlots),
	chargeCategory: one(chargeCategories, {
		fields: [charges.chargeCategoryId],
		references: [chargeCategories.id]
	}),
	chargeType: one(chargeTypes, {
		fields: [charges.chargeTypeId],
		references: [chargeTypes.id]
	}),
	organization: one(organization, {
		fields: [charges.hospitalId],
		references: [organization.id]
	}),
	taxCategory: one(taxCategories, {
		fields: [charges.taxCategoryId],
		references: [taxCategories.id]
	}),
	unit: one(units, {
		fields: [charges.unitId],
		references: [units.id]
	}),
}));

export const prescriptionsRelations = relations(prescriptions, ({one}) => ({
	appointment: one(appointments, {
		fields: [prescriptions.appointmentId],
		references: [appointments.id]
	}),
	organization: one(organization, {
		fields: [prescriptions.hospitalId],
		references: [organization.id]
	}),
	patient: one(patients, {
		fields: [prescriptions.patientId],
		references: [patients.id]
	}),
}));

export const floorsRelations = relations(floors, ({one, many}) => ({
	organization: one(organization, {
		fields: [floors.hospitalId],
		references: [organization.id]
	}),
	bedGroups: many(bedGroups),
}));

export const bedGroupsRelations = relations(bedGroups, ({one, many}) => ({
	floor: one(floors, {
		fields: [bedGroups.floorId],
		references: [floors.id]
	}),
	organization: one(organization, {
		fields: [bedGroups.hospitalId],
		references: [organization.id]
	}),
	beds: many(beds),
}));

export const bedsTypesRelations = relations(bedsTypes, ({one, many}) => ({
	organization: one(organization, {
		fields: [bedsTypes.hospitalId],
		references: [organization.id]
	}),
	beds: many(beds),
}));

export const bedsRelations = relations(beds, ({one}) => ({
	bedGroup: one(bedGroups, {
		fields: [beds.bedGroupId],
		references: [bedGroups.id]
	}),
	bedsType: one(bedsTypes, {
		fields: [beds.bedTypeId],
		references: [bedsTypes.id]
	}),
	organization: one(organization, {
		fields: [beds.hospitalId],
		references: [organization.id]
	}),
}));

export const chargeTypesRelations = relations(chargeTypes, ({one, many}) => ({
	organization: one(organization, {
		fields: [chargeTypes.hospitalId],
		references: [organization.id]
	}),
	chargeCategories: many(chargeCategories),
	charges: many(charges),
}));

export const chargeCategoriesRelations = relations(chargeCategories, ({one, many}) => ({
	chargeType: one(chargeTypes, {
		fields: [chargeCategories.chargeTypeId],
		references: [chargeTypes.id]
	}),
	organization: one(organization, {
		fields: [chargeCategories.hospitalId],
		references: [organization.id]
	}),
	charges: many(charges),
}));

export const taxCategoriesRelations = relations(taxCategories, ({one, many}) => ({
	charges: many(charges),
	organization: one(organization, {
		fields: [taxCategories.hospitalId],
		references: [organization.id]
	}),
}));

export const unitsRelations = relations(units, ({many}) => ({
	charges: many(charges),
}));

export const medicineCompaniesRelations = relations(medicineCompanies, ({one, many}) => ({
	organization: one(organization, {
		fields: [medicineCompanies.hospitalId],
		references: [organization.id]
	}),
	medicines: many(medicines),
}));

export const medicineGroupsRelations = relations(medicineGroups, ({one, many}) => ({
	organization: one(organization, {
		fields: [medicineGroups.hospitalId],
		references: [organization.id]
	}),
	medicines: many(medicines),
}));

export const medicineSuppliersRelations = relations(medicineSuppliers, ({one}) => ({
	organization: one(organization, {
		fields: [medicineSuppliers.hospitalId],
		references: [organization.id]
	}),
}));

export const medicineUnitsRelations = relations(medicineUnits, ({one, many}) => ({
	organization: one(organization, {
		fields: [medicineUnits.hospitalId],
		references: [organization.id]
	}),
	medicines: many(medicines),
}));

export const medicinesRelations = relations(medicines, ({one}) => ({
	medicineCategory: one(medicineCategories, {
		fields: [medicines.categoryId],
		references: [medicineCategories.id]
	}),
	medicineCompany: one(medicineCompanies, {
		fields: [medicines.companyName],
		references: [medicineCompanies.id]
	}),
	medicineGroup: one(medicineGroups, {
		fields: [medicines.groupId],
		references: [medicineGroups.id]
	}),
	organization: one(organization, {
		fields: [medicines.hospitalId],
		references: [organization.id]
	}),
	medicineUnit: one(medicineUnits, {
		fields: [medicines.unitId],
		references: [medicineUnits.id]
	}),
}));

export const rolesRelations = relations(roles, ({one}) => ({
	organization: one(organization, {
		fields: [roles.hospitalId],
		references: [organization.id]
	}),
}));

export const servicesRelations = relations(services, ({one}) => ({
	organization: one(organization, {
		fields: [services.hospitalId],
		references: [organization.id]
	}),
}));

export const teamRelations = relations(team, ({one, many}) => ({
	organization: one(organization, {
		fields: [team.organizationId],
		references: [organization.id]
	}),
	teamMembers: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({one}) => ({
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one}) => ({
	appointment: one(appointments, {
		fields: [transactions.appointmentId],
		references: [appointments.id]
	}),
	organization: one(organization, {
		fields: [transactions.hospitalId],
		references: [organization.id]
	}),
	patient: one(patients, {
		fields: [transactions.patientId],
		references: [patients.id]
	}),
}));

export const vitalsRelations = relations(vitals, ({one}) => ({
	organization: one(organization, {
		fields: [vitals.hospitalId],
		references: [organization.id]
	}),
}));