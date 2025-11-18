import { db } from "./index";
import {
  patients,
  staff,
  doctors,
  appointments,
  prescriptions,
  organizationInAuth as organization,
  userInAuth as user,
  memberInAuth as member,
  specializations,
} from "./migrations/schema";
import { eq, and, desc } from "drizzle-orm";
import type {
  NewPatient,
  NewStaff,
  NewDoctor,
  NewAppointment,
  NewPrescription,
} from "./types";

// ============================================
// Organization Queries (Hospital)
// ============================================

export async function getOrganizationBySlug(slug: string) {
  const result = await db.select().from(organization).where(eq(organization.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getOrganizationById(organizationId: string) {
  const result = await db.select().from(organization).where(eq(organization.id, organizationId)).limit(1);
  return result[0] || null;
}

// ============================================
// Patient Queries
// ============================================

export async function getPatientById(patientId: string) {
  const result = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  return result[0] || null;
}

export async function getPatientsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(patients)
    .where(and(eq(patients.hospitalId, hospitalId), eq(patients.isDeleted, false)))
    .orderBy(desc(patients.createdAt));
}

export async function createPatient(data: NewPatient) {
  const result = await db.insert(patients).values(data).returning();
  return result[0];
}

export async function updatePatient(patientId: string, data: Partial<NewPatient>) {
  const result = await db
    .update(patients)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(patients.id, patientId))
    .returning();
  return result[0];
}

export async function deletePatient(patientId: string) {
  const result = await db
    .update(patients)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(patients.id, patientId))
    .returning();
  return result[0];
}

// ============================================
// Staff & Doctor Queries
// ============================================

export async function getStaffByUserId(userId: string, hospitalId: string) {
  const result = await db
    .select()
    .from(staff)
    .where(and(eq(staff.userId, userId), eq(staff.hospitalId, hospitalId), eq(staff.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function getStaffByHospital(hospitalId: string) {
  return await db
    .select()
    .from(staff)
    .where(and(eq(staff.hospitalId, hospitalId), eq(staff.isDeleted, false)))
    .orderBy(desc(staff.createdAt));
}

export async function getDoctorByStaffId(staffId: string, hospitalId: string) {
  const result = await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.staffId, staffId), eq(doctors.hospitalId, hospitalId), eq(doctors.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function getDoctorsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.hospitalId, hospitalId), eq(doctors.isDeleted, false)))
    .orderBy(desc(doctors.createdAt));
}

export async function createStaff(data: NewStaff) {
  const result = await db.insert(staff).values(data).returning();
  return result[0];
}

export async function createDoctor(data: NewDoctor) {
  const result = await db.insert(doctors).values(data).returning();
  return result[0];
}

export async function updateStaff(staffId: string, data: Partial<NewStaff>) {
  const result = await db
    .update(staff)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(staff.id, staffId))
    .returning();
  return result[0];
}

export async function updateDoctor(doctorId: string, data: Partial<NewDoctor>) {
  const result = await db
    .update(doctors)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(doctors.id, doctorId))
    .returning();
  return result[0];
}

export async function deleteStaff(staffId: string) {
  const result = await db
    .update(staff)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(staff.id, staffId))
    .returning();
  return result[0];
}

export async function deleteDoctor(doctorId: string) {
  const result = await db
    .update(doctors)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(doctors.id, doctorId))
    .returning();
  return result[0];
}

// ============================================
// Specialization Queries
// ============================================

export async function getAllSpecializations() {
  return await db
    .select()
    .from(specializations)
    .orderBy(specializations.name);
}

export async function getSpecializationById(id: number) {
  const result = await db
    .select()
    .from(specializations)
    .where(eq(specializations.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getStaffWithDoctorDetails(hospitalId: string) {
  const staffList = await db
    .select()
    .from(staff)
    .innerJoin(member,eq(staff.userId,member.userId))
    .innerJoin(user,eq(member.userId,user.id))
    .where(and(eq(staff.hospitalId, hospitalId), eq(staff.isDeleted, false)))
    .orderBy(desc(staff.createdAt));

  const staffWithDoctors = await Promise.all(
    staffList.map(async (staffMember) => {
      const doctorDetails = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.staffId, staffMember.staff.id), eq(doctors.hospitalId, hospitalId)))
        .limit(1);
      
      return {
        ...staffMember,
        doctorData: doctorDetails[0] || null,
      };
    })
  );

  return staffWithDoctors;
}

export async function getStaffByIdWithDetails(staffId: string, hospitalId: string) {
  const staffResult = await db
    .select()
    .from(staff)
    .innerJoin(member, eq(staff.userId, member.userId))
    .innerJoin(user, eq(member.userId, user.id))
    .where(and(eq(staff.id, staffId), eq(staff.hospitalId, hospitalId)))
    .limit(1);

  if (staffResult.length === 0) {
    return null;
  }

  const staffMember = staffResult[0];

  const doctorDetails = await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.staffId, staffId), eq(doctors.hospitalId, hospitalId)))
    .limit(1);

  return {
    ...staffMember,
    doctorData: doctorDetails[0] || null,
  };
}

// Transaction-based employee creation
export async function createEmployeeTransaction(data: {
  staffData: NewStaff;
  doctorData: Omit<NewDoctor, 'id' | 'staffId'> | null;
}) {
  // Use Drizzle's transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // Create staff record
    const [newStaff] = await tx.insert(staff).values(data.staffData).returning();

    // Create doctor record if provided, linking it to the staff record
    let newDoctor = null;
    if (data.doctorData) {
      [newDoctor] = await tx.insert(doctors).values({
        ...data.doctorData,
        staffId: newStaff.id, // Link doctor to staff
      }).returning();
    }

    return {
      staff: newStaff,
      doctor: newDoctor,
    };
  });
}

// Delete auth user (for rollback purposes)
export async function deleteAuthUser(userId: string) {
  await db.delete(user).where(eq(user.id, userId));
}

// ============================================
// Appointment Queries
// ============================================

export async function getAppointmentById(appointmentId: string) {
  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);
  return result[0] || null;
}

export async function getAppointmentsByPatient(patientId: string, hospitalId: string) {
  return await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.patientId, patientId), eq(appointments.hospitalId, hospitalId)))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));
}

export async function getAppointmentsByDoctor(doctorUserId: string, hospitalId: string) {
  const appointmentsList = await db
    .select()
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(user, eq(appointments.doctorUserId, user.id))
    .where(and(eq(appointments.doctorUserId, doctorUserId), eq(appointments.hospitalId, hospitalId)))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

  return appointmentsList.map((item) => ({
    id: item.appointments.id,
    patient_id: item.appointments.patientId,
    doctor_id: item.appointments.doctorUserId,
    patientName: item.patients.name,
    contact: item.patients.mobileNumber,
    purpose: item.appointments.reason || "General Consultation",
    date: item.appointments.appointmentDate,
    time: item.appointments.appointmentTime,
    status: item.appointments.status,
  }));
}

export async function getAppointmentsByHospital(hospitalId: string) {
  const appointmentsList = await db
    .select()
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(user, eq(appointments.doctorUserId, user.id))
    .where(eq(appointments.hospitalId, hospitalId))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

  return appointmentsList.map((item) => ({
    id: item.appointments.id,
    patient_id: item.appointments.patientId,
    doctor_id: item.appointments.doctorUserId,
    patientName: item.patients.name,
    contact: item.patients.mobileNumber,
    purpose: item.appointments.reason || "General Consultation",
    date: item.appointments.appointmentDate,
    time: item.appointments.appointmentTime,
    status: item.appointments.status,
  }));
}

export async function createAppointment(data: NewAppointment) {
  const result = await db.insert(appointments).values(data).returning();
  return result[0];
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const result = await db
    .update(appointments)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(appointments.id, appointmentId))
    .returning();
  return result[0];
}

// ============================================
// Prescription Queries
// ============================================

export async function getPrescriptionById(prescriptionId: string) {
  const result = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.id, prescriptionId))
    .limit(1);
  return result[0] || null;
}

export async function getPrescriptionsByPatient(patientId: string, hospitalId: string) {
  return await db
    .select()
    .from(prescriptions)
    .where(and(eq(prescriptions.patientId, patientId), eq(prescriptions.hospitalId, hospitalId)))
    .orderBy(desc(prescriptions.createdAt));
}

export async function getPrescriptionByAppointment(appointmentId: string) {
  const result = await db
    .select()
    .from(prescriptions)
    .where(eq(prescriptions.appointmentId, appointmentId))
    .limit(1);
  return result[0] || null;
}

export async function getPrescriptionsByHospital(hospitalId: string,doctor_id :string) {
  const prescriptionsList = await db
    .select()
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patientId, patients.id))
    .innerJoin(user, eq(prescriptions.doctorUserId, user.id))
    .where(and(eq(prescriptions.hospitalId, hospitalId),eq(prescriptions.doctorUserId,doctor_id)))
    .orderBy(desc(prescriptions.createdAt));

  return prescriptionsList.map((item) => ({
    id: item.prescriptions.id,
    patientId: item.prescriptions.patientId,
    patientName: item.patients.name,
    doctorName: item.user.name,
    diagnosis: item.prescriptions.diagnosis,
    date: item.prescriptions.createdAt,
    followUpDate: item.prescriptions.followUpDate,
    followUpRequired: item.prescriptions.followUpRequired,
  }));
}

export async function createPrescription(data: NewPrescription) {
  const result = await db.insert(prescriptions).values(data).returning();
  return result[0];
}

// ============================================
// User-Organization Mapping Queries (Better Auth Members)
// ============================================

export async function getUserOrganizations(userId: string) {
  return await db.select().from(member).where(eq(member.userId, userId));
}

export async function getUserRole(userId: string, organizationId: string) {
  const result = await db
    .select()
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
    .limit(1);
  return result[0]?.role || null;
}

// ============================================
// Medical History Queries
// ============================================
// Note: Medical history table is currently commented out in schema
// Uncomment when needed
