import { relations } from "drizzle-orm/relations";
import { userInAuth, accountInAuth, organizationInAuth, invitationInAuth, memberInAuth, sessionInAuth, patients, staff, doctors, appointments, prescriptions } from "./schema";

export const accountInAuthRelations = relations(accountInAuth, ({one}) => ({
	userInAuth: one(userInAuth, {
		fields: [accountInAuth.userId],
		references: [userInAuth.id]
	}),
}));

export const userInAuthRelations = relations(userInAuth, ({many}) => ({
	accountInAuths: many(accountInAuth),
	invitationInAuths: many(invitationInAuth),
	memberInAuths: many(memberInAuth),
	sessionInAuths: many(sessionInAuth),
}));

export const invitationInAuthRelations = relations(invitationInAuth, ({one}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [invitationInAuth.organizationId],
		references: [organizationInAuth.id]
	}),
	userInAuth: one(userInAuth, {
		fields: [invitationInAuth.inviterId],
		references: [userInAuth.id]
	}),
}));

export const organizationInAuthRelations = relations(organizationInAuth, ({many}) => ({
	invitationInAuths: many(invitationInAuth),
	memberInAuths: many(memberInAuth),
	sessionInAuths: many(sessionInAuth),
	patients: many(patients),
	staff: many(staff),
	doctors: many(doctors),
	appointments: many(appointments),
	prescriptions: many(prescriptions),
}));

export const memberInAuthRelations = relations(memberInAuth, ({one}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [memberInAuth.organizationId],
		references: [organizationInAuth.id]
	}),
	userInAuth: one(userInAuth, {
		fields: [memberInAuth.userId],
		references: [userInAuth.id]
	}),
}));

export const sessionInAuthRelations = relations(sessionInAuth, ({one}) => ({
	userInAuth: one(userInAuth, {
		fields: [sessionInAuth.userId],
		references: [userInAuth.id]
	}),
	organizationInAuth: one(organizationInAuth, {
		fields: [sessionInAuth.activeOrganizationId],
		references: [organizationInAuth.id]
	}),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [patients.hospitalId],
		references: [organizationInAuth.id]
	}),
	appointments: many(appointments),
	prescriptions: many(prescriptions),
}));

export const staffRelations = relations(staff, ({one, many}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [staff.hospitalId],
		references: [organizationInAuth.id]
	}),
	doctors: many(doctors),
}));

export const doctorsRelations = relations(doctors, ({one}) => ({
	staff: one(staff, {
		fields: [doctors.staffId],
		references: [staff.id]
	}),
	organizationInAuth: one(organizationInAuth, {
		fields: [doctors.hospitalId],
		references: [organizationInAuth.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [appointments.hospitalId],
		references: [organizationInAuth.id]
	}),
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id]
	}),
	prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({one}) => ({
	organizationInAuth: one(organizationInAuth, {
		fields: [prescriptions.hospitalId],
		references: [organizationInAuth.id]
	}),
	appointment: one(appointments, {
		fields: [prescriptions.appointmentId],
		references: [appointments.id]
	}),
	patient: one(patients, {
		fields: [prescriptions.patientId],
		references: [patients.id]
	}),
}));