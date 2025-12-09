import { relations } from "drizzle-orm/relations";
import { organization, member, user, floors, bedGroups, bedsTypes, beds, chargeTypes, chargeCategories, charges, units, taxCategories, medicineCategories, modules, appointmentPriorities, shifts, doctors, doctorShifts, patients, staff, team, invitation, account, session, appointments, prescriptions, doctorSlots, medicineGroups, medicines, medicineCompanies, medicineUnits, teamMember, vitals, roles, services, transactions, medicineSuppliers } from "./schema";

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

export const organizationRelations = relations(organization, ({many}) => ({
	members: many(member),
	bedGroups: many(bedGroups),
	floors: many(floors),
	beds: many(beds),
	bedsTypes: many(bedsTypes),
	chargeTypes: many(chargeTypes),
	chargeCategories: many(chargeCategories),
	charges: many(charges),
	taxCategories: many(taxCategories),
	medicineCategories: many(medicineCategories),
	modules: many(modules),
	appointmentPriorities: many(appointmentPriorities),
	shifts: many(shifts),
	doctorShifts: many(doctorShifts),
	patients: many(patients),
	staff: many(staff),
	doctors: many(doctors),
	invitations: many(invitation),
	sessions: many(session),
	prescriptions: many(prescriptions),
	appointments: many(appointments),
	doctorSlots: many(doctorSlots),
	medicines: many(medicines),
	teams: many(team),
	vitals: many(vitals),
	medicineUnits: many(medicineUnits),
	medicineCompanies: many(medicineCompanies),
	roles: many(roles),
	services: many(services),
	transactions: many(transactions),
	medicineGroups: many(medicineGroups),
	medicineSuppliers: many(medicineSuppliers),
}));

export const userRelations = relations(user, ({many}) => ({
	members: many(member),
	invitations: many(invitation),
	accounts: many(account),
	sessions: many(session),
	teamMembers: many(teamMember),
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

export const floorsRelations = relations(floors, ({one, many}) => ({
	bedGroups: many(bedGroups),
	organization: one(organization, {
		fields: [floors.hospitalId],
		references: [organization.id]
	}),
}));

export const bedsRelations = relations(beds, ({one}) => ({
	bedsType: one(bedsTypes, {
		fields: [beds.bedTypeId],
		references: [bedsTypes.id]
	}),
	bedGroup: one(bedGroups, {
		fields: [beds.bedGroupId],
		references: [bedGroups.id]
	}),
	organization: one(organization, {
		fields: [beds.hospitalId],
		references: [organization.id]
	}),
}));

export const bedsTypesRelations = relations(bedsTypes, ({one, many}) => ({
	beds: many(beds),
	organization: one(organization, {
		fields: [bedsTypes.hospitalId],
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

export const chargesRelations = relations(charges, ({one, many}) => ({
	chargeCategory: one(chargeCategories, {
		fields: [charges.chargeCategoryId],
		references: [chargeCategories.id]
	}),
	chargeType: one(chargeTypes, {
		fields: [charges.chargeTypeId],
		references: [chargeTypes.id]
	}),
	unit: one(units, {
		fields: [charges.unitId],
		references: [units.id]
	}),
	taxCategory: one(taxCategories, {
		fields: [charges.taxCategoryId],
		references: [taxCategories.id]
	}),
	organization: one(organization, {
		fields: [charges.hospitalId],
		references: [organization.id]
	}),
	doctorSlots: many(doctorSlots),
}));

export const unitsRelations = relations(units, ({many}) => ({
	charges: many(charges),
}));

export const taxCategoriesRelations = relations(taxCategories, ({one, many}) => ({
	charges: many(charges),
	organization: one(organization, {
		fields: [taxCategories.hospitalId],
		references: [organization.id]
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

export const appointmentPrioritiesRelations = relations(appointmentPriorities, ({one}) => ({
	organization: one(organization, {
		fields: [appointmentPriorities.hospitalId],
		references: [organization.id]
	}),
}));

export const shiftsRelations = relations(shifts, ({one, many}) => ({
	organization: one(organization, {
		fields: [shifts.hospitalId],
		references: [organization.id]
	}),
	doctorShifts: many(doctorShifts),
	doctorSlots: many(doctorSlots),
}));

export const doctorShiftsRelations = relations(doctorShifts, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorShifts.doctorUserId],
		references: [doctors.id]
	}),
	shift: one(shifts, {
		fields: [doctorShifts.shiftId],
		references: [shifts.id]
	}),
	organization: one(organization, {
		fields: [doctorShifts.hospitalId],
		references: [organization.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	doctorShifts: many(doctorShifts),
	staff: one(staff, {
		fields: [doctors.staffId],
		references: [staff.id]
	}),
	organization: one(organization, {
		fields: [doctors.hospitalId],
		references: [organization.id]
	}),
	doctorSlots: many(doctorSlots),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	organization: one(organization, {
		fields: [patients.hospitalId],
		references: [organization.id]
	}),
	prescriptions: many(prescriptions),
	appointments: many(appointments),
	transactions: many(transactions),
}));

export const staffRelations = relations(staff, ({one, many}) => ({
	organization: one(organization, {
		fields: [staff.hospitalId],
		references: [organization.id]
	}),
	doctors: many(doctors),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	team: one(team, {
		fields: [invitation.teamId],
		references: [team.id]
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const teamRelations = relations(team, ({one, many}) => ({
	invitations: many(invitation),
	sessions: many(session),
	organization: one(organization, {
		fields: [team.organizationId],
		references: [organization.id]
	}),
	teamMembers: many(teamMember),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	team: one(team, {
		fields: [session.activeTeamId],
		references: [team.id]
	}),
	organization: one(organization, {
		fields: [session.activeOrganizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const prescriptionsRelations = relations(prescriptions, ({one}) => ({
	appointment: one(appointments, {
		fields: [prescriptions.appointmentId],
		references: [appointments.id]
	}),
	patient: one(patients, {
		fields: [prescriptions.patientId],
		references: [patients.id]
	}),
	organization: one(organization, {
		fields: [prescriptions.hospitalId],
		references: [organization.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	prescriptions: many(prescriptions),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	organization: one(organization, {
		fields: [appointments.hospitalId],
		references: [organization.id]
	}),
	transactions: many(transactions),
}));

export const doctorSlotsRelations = relations(doctorSlots, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorSlots.doctorId],
		references: [doctors.id]
	}),
	shift: one(shifts, {
		fields: [doctorSlots.shiftId],
		references: [shifts.id]
	}),
	charge: one(charges, {
		fields: [doctorSlots.chargeId],
		references: [charges.id]
	}),
	organization: one(organization, {
		fields: [doctorSlots.hospitalId],
		references: [organization.id]
	}),
}));

export const medicinesRelations = relations(medicines, ({one}) => ({
	medicineGroup: one(medicineGroups, {
		fields: [medicines.groupId],
		references: [medicineGroups.id]
	}),
	medicineCategory: one(medicineCategories, {
		fields: [medicines.categoryId],
		references: [medicineCategories.id]
	}),
	medicineCompany: one(medicineCompanies, {
		fields: [medicines.companyName],
		references: [medicineCompanies.id]
	}),
	medicineUnit: one(medicineUnits, {
		fields: [medicines.unitId],
		references: [medicineUnits.id]
	}),
	organization: one(organization, {
		fields: [medicines.hospitalId],
		references: [organization.id]
	}),
}));

export const medicineGroupsRelations = relations(medicineGroups, ({one, many}) => ({
	medicines: many(medicines),
	organization: one(organization, {
		fields: [medicineGroups.hospitalId],
		references: [organization.id]
	}),
}));

export const medicineCompaniesRelations = relations(medicineCompanies, ({one, many}) => ({
	medicines: many(medicines),
	organization: one(organization, {
		fields: [medicineCompanies.hospitalId],
		references: [organization.id]
	}),
}));

export const medicineUnitsRelations = relations(medicineUnits, ({one, many}) => ({
	medicines: many(medicines),
	organization: one(organization, {
		fields: [medicineUnits.hospitalId],
		references: [organization.id]
	}),
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

export const vitalsRelations = relations(vitals, ({one}) => ({
	organization: one(organization, {
		fields: [vitals.hospitalId],
		references: [organization.id]
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

export const transactionsRelations = relations(transactions, ({one}) => ({
	patient: one(patients, {
		fields: [transactions.patientId],
		references: [patients.id]
	}),
	appointment: one(appointments, {
		fields: [transactions.appointmentId],
		references: [appointments.id]
	}),
	organization: one(organization, {
		fields: [transactions.hospitalId],
		references: [organization.id]
	}),
}));

export const medicineSuppliersRelations = relations(medicineSuppliers, ({one}) => ({
	organization: one(organization, {
		fields: [medicineSuppliers.hospitalId],
		references: [organization.id]
	}),
}));