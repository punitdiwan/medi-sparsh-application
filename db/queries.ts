import { db } from "./index";
import {
  patients,
  staff,
  doctors,
  appointments,
  prescriptions,
  organization,
  user,
  member,
  specializations,
  services,
  transactions,
  floors,
  bedsTypes,
  bedGroups,
  beds,
  units,
  charges,
  taxCategories,
  modules,
  chargeTypes,
  chargeCategories,
  organizationRole,
  ipdCharges,
  pathologyCategories,
  pathologyUnits,
  pathologyParameters,
  pathologyTests,
  pathologyOrders,
  pathologyOrderTests,
  pathologyBills,
  pathologyPayments,
  radiologyCategories,
  radiologyUnits,
  radiologyTests,
  radiologyParameters,
  ambulance,
  ambulanceBooking,
  masterModules,
} from "@/drizzle/schema";
import { eq, and, desc, sql, ne, or } from "drizzle-orm";
import type {
  NewPatient,
  NewStaff,
  NewDoctor,
  NewAppointment,
  NewPrescription,
  NewAmbulance,
  NewAmbulanceBooking,
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

export async function getPatientsByHospital(hospitalId: string, is_IPD_Patient?: boolean) {
  if (is_IPD_Patient) {
    return await db
      .select()
      .from(patients)
      .where(and(eq(patients.hospitalId, hospitalId), eq(patients.isDeleted, false), eq(patients.isAdmitted, false)))
      .orderBy(desc(patients.createdAt));
  }
  return await db
    .select()
    .from(patients)
    .where(and(eq(patients.hospitalId, hospitalId)))
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

export async function restorePatient(patientId: string) {
  const result = await db
    .update(patients)
    .set({ isDeleted: false, updatedAt: new Date().toISOString() })
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

export async function createSpecialization(data: { name: string; description?: string }) {
  const result = await db.insert(specializations).values(data).returning();
  return result[0];
}

export async function updateSpecialization(id: number, data: { name?: string; description?: string }) {
  const result = await db
    .update(specializations)
    .set(data)
    .where(eq(specializations.id, id))
    .returning();
  return result[0];
}

export async function deleteSpecialization(id: number) {
  const result = await db.delete(specializations).where(eq(specializations.id, id)).returning();
  return result[0];
}

export async function getStaffWithDoctorDetails(hospitalId: string) {
  const staffList = await db
    .select()
    .from(staff)
    .innerJoin(member, eq(staff.userId, member.userId))
    .innerJoin(user, eq(member.userId, user.id))
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
    doctorName: item.user.name,
    patientName: item.patients.name,
    contact: item.patients.mobileNumber,
    email: item.patients.email,
    gender: item.patients.gender,
    dob: item.patients.dob,
    purpose: item.appointments.reason || "General Consultation",
    notes: item.appointments.notes,
    services: item.appointments.services,
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
    doctorName: item.user.name,
    patientName: item.patients.name,
    contact: item.patients.mobileNumber,
    email: item.patients.email,
    gender: item.patients.gender,
    dob: item.patients.dob,
    purpose: item.appointments.reason || "General Consultation",
    notes: item.appointments.notes,
    services: item.appointments.services,
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

export async function getAppointmentByIdWithDetails(appointmentId: string) {
  const result = await db
    .select({
      appointment: appointments,
      patient: patients,
      doctor: doctors,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(staff, eq(appointments.doctorUserId, staff.userId))
    .innerJoin(doctors, eq(staff.id, doctors.staffId))
    .where(eq(appointments.id, appointmentId))
    .limit(1);
  return result[0] || null;
}

export async function updateAppointment(appointmentId: string, data: Partial<typeof appointments.$inferInsert>) {
  const result = await db
    .update(appointments)
    .set({ ...data, updatedAt: new Date().toISOString() })
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

export async function getPrescriptionsByHospital(hospitalId: string, doctor_id: string) {
  const prescriptionsList = await db
    .select()
    .from(prescriptions)
    .innerJoin(patients, eq(prescriptions.patientId, patients.id))
    .innerJoin(user, eq(prescriptions.doctorUserId, user.id))
    .where(and(eq(prescriptions.hospitalId, hospitalId), eq(prescriptions.doctorUserId, doctor_id)))
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

// ============================================
// Service Queries
// =============================================
export async function getServicesByHospital(hospitalId: string) {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.hospitalId, hospitalId));

  return result || null;
}

export async function createService(data: {
  hospitalId: string;
  name: string;
  amount: string;
  description?: string;
}) {
  const result = await db
    .insert(services)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      amount: data.amount,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updateService(id: string, data: {
  name?: string;
  amount?: string;
  description?: string;
  isDeleted?: boolean;
}) {
  const result = await db
    .update(services)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.amount && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isDeleted !== undefined && { isDeleted: data.isDeleted }),
    })
    .where(eq(services.id, id))
    .returning();

  return result[0];
}

export async function deleteService(id: string) {
  const result = await db
    .update(services)
    .set({ isDeleted: true })
    .where(eq(services.id, id))
    .returning();

  return result[0];
}

// ===================================================
// transaction query
// ===================================================

export async function createTransaction(data: {
  hospitalId: string;
  patientId: string;
  appointmentsId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  notes?: string;
}) {
  const result = await db
    .insert(transactions)
    .values({
      hospitalId: data.hospitalId,
      patientId: data.patientId,
      appointmentId: data.appointmentsId,
      amount: data.amount,
      status: data.status,
      paymentMethod: data.paymentMethod,
      notes: data.notes ?? null,
    })
    .returning();

  return result[0];
}

export async function getTransactionsByHospital(hospitalId: string) {
  const result = await db
    .select({
      transactionId: transactions.id,
      hospitalId: transactions.hospitalId,
      patientId: transactions.patientId,
      appointmentId: transactions.appointmentId,
      amount: transactions.amount,
      status: transactions.status,
      paymentMethod: transactions.paymentMethod,
      createdAt: transactions.createdAt,
      patientName: patients.name,
      patientPhone: patients.mobileNumber,
      patientGender: patients.gender,
      appointmentStatus: appointments.status,
      appointmentDate: appointments.appointmentDate,
      appointmentTime: appointments.appointmentTime,
      orgName: organization.name,
      orgLogo: organization.logo,
      orgMetaData: organization.metadata,
      doctorName: user.name,
      doctorQualification: doctors.qualification,
      doctorExperience: doctors.experience,
      doctorSpecialization: doctors.specialization,
    })
    .from(transactions)
    .leftJoin(patients, eq(patients.id, transactions.patientId))
    .leftJoin(appointments, eq(appointments.id, transactions.appointmentId))
    .leftJoin(staff, eq(staff.userId, appointments.doctorUserId))
    .leftJoin(doctors, eq(doctors.staffId, staff.id))
    .leftJoin(user, eq(user.id, staff.userId))
    .leftJoin(organization, eq(organization.id, transactions.hospitalId))
    .where(eq(transactions.hospitalId, hospitalId))
    .orderBy(sql`${transactions.createdAt} DESC`);

  return result;
}

// ===================================================
// Floor Queries
// ===================================================

export async function getFloorsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(floors)
    .where(and(eq(floors.hospitalId, hospitalId), eq(floors.isDeleted, false)))
    .orderBy(desc(floors.createdAt));
}

export async function getDeletedFloorsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(floors)
    .where(and(eq(floors.hospitalId, hospitalId), eq(floors.isDeleted, true)))
    .orderBy(desc(floors.updatedAt));
}

export async function getFloorById(floorId: string) {
  const result = await db
    .select()
    .from(floors)
    .where(and(eq(floors.id, floorId), eq(floors.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function createFloor(data: {
  hospitalId: string;
  name: string;
  description?: string;
}) {
  const result = await db
    .insert(floors)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updateFloor(floorId: string, data: {
  name?: string;
  description?: string;
}) {
  const result = await db
    .update(floors)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(floors.id, floorId))
    .returning();

  return result[0];
}

export async function deleteFloor(floorId: string) {
  const result = await db
    .update(floors)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(floors.id, floorId))
    .returning();

  return result[0];
}

export async function permanentlyDeleteFloor(floorId: string) {
  const result = await db
    .delete(floors)
    .where(eq(floors.id, floorId))
    .returning();

  return result[0];
}

export async function restoreFloor(floorId: string) {
  const result = await db
    .update(floors)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(floors.id, floorId))
    .returning();

  return result[0];
}

// ===================================================
// Bed Type Queries
// ===================================================

export async function getBedTypesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(bedsTypes)
    .where(and(eq(bedsTypes.hospitalId, hospitalId), eq(bedsTypes.isDeleted, false)))
    .orderBy(desc(bedsTypes.createdAt));
}

export async function getDeletedBedTypesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(bedsTypes)
    .where(and(eq(bedsTypes.hospitalId, hospitalId), eq(bedsTypes.isDeleted, true)))
    .orderBy(desc(bedsTypes.updatedAt));
}

export async function getBedTypeById(bedTypeId: string) {
  const result = await db
    .select()
    .from(bedsTypes)
    .where(and(eq(bedsTypes.id, bedTypeId), eq(bedsTypes.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function createBedType(data: {
  hospitalId: string;
  name: string;
  description?: string;
}) {
  const result = await db
    .insert(bedsTypes)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updateBedType(bedTypeId: string, data: {
  name?: string;
  description?: string;
}) {
  const result = await db
    .update(bedsTypes)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(bedsTypes.id, bedTypeId))
    .returning();

  return result[0];
}

export async function deleteBedType(bedTypeId: string) {
  const result = await db
    .update(bedsTypes)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(bedsTypes.id, bedTypeId))
    .returning();

  return result[0];
}

export async function permanentlyDeleteBedType(bedTypeId: string) {
  const result = await db
    .delete(bedsTypes)
    .where(eq(bedsTypes.id, bedTypeId))
    .returning();

  return result[0];
}

// Check if beds exist for a bed type
export async function getBedCountByBedType(bedTypeId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(beds)
    .where(and(eq(beds.bedTypeId, bedTypeId), eq(beds.isDeleted, false)))
    .limit(1);

  return result[0]?.count || 0;
}

// ===================================================
// Bed Group Queries
// ===================================================

export async function getBedGroupsByHospital(hospitalId: string) {
  return await db
    .select({
      id: bedGroups.id,
      name: bedGroups.name,
      description: bedGroups.description,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: bedGroups.hospitalId,
      isDeleted: bedGroups.isDeleted,
      createdAt: bedGroups.createdAt,
      updatedAt: bedGroups.updatedAt,
    })
    .from(bedGroups)
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(bedGroups.hospitalId, hospitalId), eq(bedGroups.isDeleted, false)))
    .orderBy(desc(bedGroups.createdAt));
}

export async function getDeletedBedGroupsByHospital(hospitalId: string) {
  return await db
    .select({
      id: bedGroups.id,
      name: bedGroups.name,
      description: bedGroups.description,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: bedGroups.hospitalId,
      isDeleted: bedGroups.isDeleted,
      createdAt: bedGroups.createdAt,
      updatedAt: bedGroups.updatedAt,
    })
    .from(bedGroups)
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(bedGroups.hospitalId, hospitalId), eq(bedGroups.isDeleted, true)))
    .orderBy(desc(bedGroups.updatedAt));
}

export async function getBedGroupById(bedGroupId: string) {
  const result = await db
    .select({
      id: bedGroups.id,
      name: bedGroups.name,
      description: bedGroups.description,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: bedGroups.hospitalId,
      isDeleted: bedGroups.isDeleted,
      createdAt: bedGroups.createdAt,
      updatedAt: bedGroups.updatedAt,
    })
    .from(bedGroups)
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(bedGroups.id, bedGroupId), eq(bedGroups.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function createBedGroup(data: {
  hospitalId: string;
  name: string;
  floorId: string;
  description?: string;
}) {
  const result = await db
    .insert(bedGroups)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      floorId: data.floorId,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updateBedGroup(bedGroupId: string, data: {
  name?: string;
  floorId?: string;
  description?: string;
}) {
  const result = await db
    .update(bedGroups)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.floorId && { floorId: data.floorId }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(bedGroups.id, bedGroupId))
    .returning();

  return result[0];
}

export async function deleteBedGroup(bedGroupId: string) {
  const result = await db
    .update(bedGroups)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(bedGroups.id, bedGroupId))
    .returning();

  return result[0];
}

export async function permanentlyDeleteBedGroup(bedGroupId: string) {
  const result = await db
    .delete(bedGroups)
    .where(eq(bedGroups.id, bedGroupId))
    .returning();

  return result[0];
}

export async function restoreBedGroup(bedGroupId: string) {
  const result = await db
    .update(bedGroups)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(bedGroups.id, bedGroupId))
    .returning();

  return result[0];
}

// Check if bed groups exist for a floor
export async function getBedGroupCountByFloor(floorId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(bedGroups)
    .where(and(eq(bedGroups.floorId, floorId), eq(bedGroups.isDeleted, false)))
    .limit(1);

  return result[0]?.count || 0;
}

// ===================================================
// Bed Queries
// ===================================================

export async function getBedsByHospital(hospitalId: string) {
  return await db
    .select({
      id: beds.id,
      name: beds.name,
      bedTypeId: beds.bedTypeId,
      bedGroupId: beds.bedGroupId,
      bedTypeName: bedsTypes.name,
      bedGroupName: bedGroups.name,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: beds.hospitalId,
      isDeleted: beds.isDeleted,
      status: beds.status,
      isOccupied: beds.isOccupied,
      createdAt: beds.createdAt,
      updatedAt: beds.updatedAt,
    })
    .from(beds)
    .leftJoin(bedsTypes, eq(beds.bedTypeId, bedsTypes.id))
    .leftJoin(bedGroups, eq(beds.bedGroupId, bedGroups.id))
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(beds.hospitalId, hospitalId), eq(beds.isDeleted, false)))
    .orderBy(desc(beds.createdAt));
}

export async function getDeletedBedsByHospital(hospitalId: string) {
  return await db
    .select({
      id: beds.id,
      name: beds.name,
      bedTypeId: beds.bedTypeId,
      bedGroupId: beds.bedGroupId,
      bedTypeName: bedsTypes.name,
      bedGroupName: bedGroups.name,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: beds.hospitalId,
      isDeleted: beds.isDeleted,
      status: beds.status,
      isOccupied: beds.isOccupied,
      createdAt: beds.createdAt,
      updatedAt: beds.updatedAt,
    })
    .from(beds)
    .leftJoin(bedsTypes, eq(beds.bedTypeId, bedsTypes.id))
    .leftJoin(bedGroups, eq(beds.bedGroupId, bedGroups.id))
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(beds.hospitalId, hospitalId), eq(beds.isDeleted, true)))
    .orderBy(desc(beds.updatedAt));
}

export async function getBedById(bedId: string) {
  const result = await db
    .select({
      id: beds.id,
      name: beds.name,
      bedTypeId: beds.bedTypeId,
      bedGroupId: beds.bedGroupId,
      bedTypeName: bedsTypes.name,
      bedGroupName: bedGroups.name,
      floorId: bedGroups.floorId,
      floorName: floors.name,
      hospitalId: beds.hospitalId,
      isDeleted: beds.isDeleted,
      status: beds.status,
      isOccupied: beds.isOccupied,
      createdAt: beds.createdAt,
      updatedAt: beds.updatedAt,
    })
    .from(beds)
    .leftJoin(bedsTypes, eq(beds.bedTypeId, bedsTypes.id))
    .leftJoin(bedGroups, eq(beds.bedGroupId, bedGroups.id))
    .leftJoin(floors, eq(bedGroups.floorId, floors.id))
    .where(and(eq(beds.id, bedId), eq(beds.isDeleted, false)))
    .limit(1);
  return result[0] || null;
}

export async function createBed(data: {
  hospitalId: string;
  name: string;
  bedTypeId: string;
  bedGroupId: string;
}) {
  const result = await db
    .insert(beds)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      bedTypeId: data.bedTypeId,
      bedGroupId: data.bedGroupId,
    })
    .returning();

  return result[0];
}

export async function updateBed(bedId: string, data: {
  name?: string;
  bedTypeId?: string;
  bedGroupId?: string;
  status?: string;
}) {
  const statusValue = data.status?.toLowerCase();
  const nextIsOccupied =
    statusValue !== undefined ? statusValue === "occupied" : undefined;

  const result = await db
    .update(beds)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.bedTypeId && { bedTypeId: data.bedTypeId }),
      ...(data.bedGroupId && { bedGroupId: data.bedGroupId }),
      ...(statusValue && { status: statusValue }),
      ...(nextIsOccupied !== undefined && { isOccupied: nextIsOccupied }),
      updatedAt: new Date(),
    })
    .where(eq(beds.id, bedId))
    .returning();

  return result[0];
}

export async function deleteBed(bedId: string) {
  const result = await db
    .update(beds)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(beds.id, bedId))
    .returning();

  return result[0];
}

export async function permanentlyDeleteBed(bedId: string) {
  const result = await db
    .delete(beds)
    .where(eq(beds.id, bedId))
    .returning();

  return result[0];
}

export async function restoreBed(bedId: string) {
  const result = await db
    .update(beds)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(beds.id, bedId))
    .returning();

  return result[0];
}

// ===================================================
// Unit Queries
// ===================================================

export async function getUnits() {
  return await db
    .select()
    .from(units)
    .orderBy(desc(units.name));
}

export async function getUnitById(unitId: string) {
  const result = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);
  return result[0] || null;
}

export async function createUnit(data: { name: string }) {
  const result = await db
    .insert(units)
    .values({
      name: data.name,
    })
    .returning();

  return result[0];
}

export async function updateUnit(unitId: string, data: { name: string }) {
  const result = await db
    .update(units)
    .set({
      name: data.name,
    })
    .where(eq(units.id, unitId))
    .returning();

  return result[0];
}

export async function deleteUnit(unitId: string) {
  const result = await db
    .delete(units)
    .where(eq(units.id, unitId))
    .returning();

  return result[0];
}

// Check if charges exist for a unit
export async function getChargeCountByUnit(unitId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(charges)
    .where(eq(charges.unitId, unitId))
    .limit(1);

  return result[0]?.count || 0;
}

// ===================================================
// Tax Category Queries
// ===================================================

export async function getTaxCategoriesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(taxCategories)
    .where(and(eq(taxCategories.hospitalId, hospitalId), eq(taxCategories.isDeleted, false)))
    .orderBy(desc(taxCategories.createdAt));
}

export async function getDeletedTaxCategoriesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(taxCategories)
    .where(and(eq(taxCategories.hospitalId, hospitalId), eq(taxCategories.isDeleted, true)))
    .orderBy(desc(taxCategories.updatedAt));
}

export async function getTaxCategoryById(id: string) {
  const result = await db
    .select()
    .from(taxCategories)
    .where(eq(taxCategories.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createTaxCategory(data: {
  hospitalId: string;
  name: string;
  percent: string;
}) {
  const result = await db
    .insert(taxCategories)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      percent: data.percent,
    })
    .returning();

  return result[0];
}

export async function updateTaxCategory(id: string, data: {
  name?: string;
  percent?: string;
}) {
  const result = await db
    .update(taxCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.percent && { percent: data.percent }),
      updatedAt: new Date(),
    })
    .where(eq(taxCategories.id, id))
    .returning();

  return result[0];
}

export async function softDeleteTaxCategory(id: string) {
  const result = await db
    .update(taxCategories)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(taxCategories.id, id))
    .returning();

  return result[0];
}

export async function restoreTaxCategory(id: string) {
  const result = await db
    .update(taxCategories)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(taxCategories.id, id))
    .returning();

  return result[0];
}

export async function permanentlyDeleteTaxCategory(id: string) {
  const result = await db
    .delete(taxCategories)
    .where(eq(taxCategories.id, id))
    .returning();

  return result[0];
}

// Check if charges exist for a tax category
export async function getChargeCountByTaxCategory(taxCategoryId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(charges)
    .where(eq(charges.taxCategoryId, taxCategoryId))
    .limit(1);

  return result[0]?.count || 0;
}

// ===================================================
// Module Queries
// ===================================================

export async function getModulesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(modules)
    .where(and(eq(modules.hospitalId, hospitalId), eq(modules.isDeleted, false)))
    .orderBy(desc(modules.createdAt));
}

// ===================================================
// Charge Type Queries
// ===================================================

export async function getChargeTypesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(chargeTypes)
    .where(and(eq(chargeTypes.hospitalId, hospitalId)))
    .orderBy(desc(chargeTypes.createdAt));
}

export async function createChargeType(data: {
  hospitalId: string;
  name: string;
  modules: any;
}) {
  const result = await db
    .insert(chargeTypes)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      modules: data.modules,
    })
    .returning();

  return result[0];
}

export async function updateChargeType(id: string, data: {
  name?: string;
  modules?: any;
}) {
  const result = await db
    .update(chargeTypes)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.modules && { modules: data.modules }),
      updatedAt: new Date(),
    })
    .where(eq(chargeTypes.id, id))
    .returning();

  return result[0];
}

export async function deleteChargeType(id: string) {
  const result = await db
    .delete(chargeTypes)
    .where(eq(chargeTypes.id, id))
    .returning();

  return result[0];
}



// ===================================================
// Charge Category Queries
// ===================================================

export async function getChargeCategoriesByHospital(
  hospitalId: string,
  moduleCode?: string
) {
  let hospitalModuleId: string | null = null;

  if (moduleCode?.trim()) {
    // Step 1: Get master module id
    const master = await db
      .select({ id: masterModules.id })
      .from(masterModules)
      .where(eq(masterModules.code, moduleCode.trim()))
      .limit(1);

    if (!master.length) return [];

    // Step 2: Get hospital module id
    const hospitalModule = await db
      .select({ id: modules.id })
      .from(modules)
      .where(
        and(
          eq(modules.moduleId, master[0].id),
          eq(modules.hospitalId, hospitalId),
          eq(modules.isDeleted, false)
        )
      )
      .limit(1);

    hospitalModuleId = hospitalModule[0]?.id ?? null;

    if (!hospitalModuleId) return [];
  }

  const conditions = [
    eq(chargeCategories.hospitalId, hospitalId),
    eq(chargeCategories.isDeleted, false),
    eq(chargeTypes.hospitalId, hospitalId),
    eq(chargeTypes.isDeleted, false),
  ];

  if (hospitalModuleId) {
    conditions.push(
      sql`${chargeTypes.modules} ? ${hospitalModuleId}`
    );
  }

  return await db
    .select({
      id: chargeCategories.id,
      name: chargeCategories.name,
      description: chargeCategories.description,
      chargeTypeId: chargeCategories.chargeTypeId,
      categoryType: chargeTypes.name,
      createdAt: chargeCategories.createdAt,
      updatedAt: chargeCategories.updatedAt,
    })
    .from(chargeCategories)
    .leftJoin(
      chargeTypes,
      eq(chargeCategories.chargeTypeId, chargeTypes.id)
    )
    .where(and(...conditions))
    .orderBy(desc(chargeCategories.createdAt));
}

export async function getDeletedChargeCategoriesByHospital(hospitalId: string) {
  return await db
    .select({
      id: chargeCategories.id,
      name: chargeCategories.name,
      description: chargeCategories.description,
      chargeTypeId: chargeCategories.chargeTypeId,
      categoryType: chargeTypes.name,
      isDeleted: chargeCategories.isDeleted,
      createdAt: chargeCategories.createdAt,
      updatedAt: chargeCategories.updatedAt,
    })
    .from(chargeCategories)
    .leftJoin(chargeTypes, eq(chargeCategories.chargeTypeId, chargeTypes.id))
    .where(and(eq(chargeCategories.hospitalId, hospitalId), eq(chargeCategories.isDeleted, true)))
    .orderBy(desc(chargeCategories.updatedAt));
}

export async function createChargeCategory(data: {
  hospitalId: string;
  name: string;
  description?: string;
  chargeTypeId: string;
}) {
  const result = await db
    .insert(chargeCategories)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description,
      chargeTypeId: data.chargeTypeId,
    })
    .returning();

  return result[0];
}

export async function updateChargeCategory(id: string, data: {
  name?: string;
  description?: string;
  chargeTypeId?: string;
}) {
  const result = await db
    .update(chargeCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.chargeTypeId && { chargeTypeId: data.chargeTypeId }),
      updatedAt: new Date(),
    })
    .where(eq(chargeCategories.id, id))
    .returning();

  return result[0];
}

export async function softDeleteChargeCategory(id: string) {
  const result = await db
    .update(chargeCategories)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(chargeCategories.id, id))
    .returning();

  return result[0];
}

export async function restoreChargeCategory(id: string) {
  const result = await db
    .update(chargeCategories)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(chargeCategories.id, id))
    .returning();

  return result[0];
}

export async function permanentlyDeleteChargeCategory(id: string) {
  const result = await db
    .delete(chargeCategories)
    .where(eq(chargeCategories.id, id))
    .returning();

  return result[0];
}

// Check if charges exist for a charge category
export async function getChargeCountByChargeCategory(chargeCategoryId: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(charges)
    .where(eq(charges.chargeCategoryId, chargeCategoryId))
    .limit(1);

  return result[0]?.count || 0;
}

// ===================================================
// Charges Queries
// ===================================================

export async function getChargesByHospital(hospitalId: string) {
  return await db
    .select({
      id: charges.id,
      name: charges.name,
      description: charges.description,
      amount: charges.amount,
      chargeCategoryId: charges.chargeCategoryId,
      chargeCategoryName: chargeCategories.name,
      chargeTypeId: charges.chargeTypeId,
      chargeTypeName: chargeTypes.name,
      taxCategoryId: charges.taxCategoryId,
      taxCategoryName: taxCategories.name,
      taxPercent: taxCategories.percent,
      unitId: charges.unitId,
      unitName: units.name,
      isDeleted: charges.isDeleted,
      createdAt: charges.createdAt,
      updatedAt: charges.updatedAt,
    })
    .from(charges)
    .leftJoin(chargeCategories, eq(charges.chargeCategoryId, chargeCategories.id))
    .leftJoin(chargeTypes, eq(charges.chargeTypeId, chargeTypes.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .leftJoin(units, eq(charges.unitId, units.id))
    .where(and(eq(charges.hospitalId, hospitalId), eq(charges.isDeleted, false)))
    .orderBy(desc(charges.createdAt));
}

export async function getDeletedChargesByHospital(hospitalId: string) {
  return await db
    .select({
      id: charges.id,
      name: charges.name,
      description: charges.description,
      amount: charges.amount,
      chargeCategoryId: charges.chargeCategoryId,
      chargeCategoryName: chargeCategories.name,
      chargeTypeId: charges.chargeTypeId,
      chargeTypeName: chargeTypes.name,
      taxCategoryId: charges.taxCategoryId,
      taxCategoryName: taxCategories.name,
      taxPercent: taxCategories.percent,
      unitId: charges.unitId,
      unitName: units.name,
      isDeleted: charges.isDeleted,
      createdAt: charges.createdAt,
      updatedAt: charges.updatedAt,
    })
    .from(charges)
    .leftJoin(chargeCategories, eq(charges.chargeCategoryId, chargeCategories.id))
    .leftJoin(chargeTypes, eq(charges.chargeTypeId, chargeTypes.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .leftJoin(units, eq(charges.unitId, units.id))
    .where(and(eq(charges.hospitalId, hospitalId), eq(charges.isDeleted, true)))
    .orderBy(desc(charges.updatedAt));
}

export async function createCharge(data: {
  hospitalId: string;
  name: string;
  description?: string;
  amount: string;
  chargeCategoryId: string;
  chargeTypeId: string;
  taxCategoryId: string;
  unitId: string;
}) {
  const result = await db
    .insert(charges)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description,
      amount: data.amount,
      chargeCategoryId: data.chargeCategoryId,
      chargeTypeId: data.chargeTypeId,
      taxCategoryId: data.taxCategoryId,
      unitId: data.unitId,
    })
    .returning();

  return result[0];
}

export async function updateCharge(id: string, data: {
  name?: string;
  description?: string;
  amount?: string;
  chargeCategoryId?: string;
  chargeTypeId?: string;
  taxCategoryId?: string;
  unitId?: string;
}) {
  const result = await db
    .update(charges)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.amount && { amount: data.amount }),
      ...(data.chargeCategoryId && { chargeCategoryId: data.chargeCategoryId }),
      ...(data.chargeTypeId && { chargeTypeId: data.chargeTypeId }),
      ...(data.taxCategoryId && { taxCategoryId: data.taxCategoryId }),
      ...(data.unitId && { unitId: data.unitId }),
      updatedAt: new Date(),
    })
    .where(eq(charges.id, id))
    .returning();

  return result[0];
}

export async function softDeleteCharge(id: string) {
  const result = await db
    .update(charges)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(charges.id, id))
    .returning();

  return result[0];
}

export async function restoreCharge(id: string) {
  const result = await db
    .update(charges)
    .set({ isDeleted: false, updatedAt: new Date() })
    .where(eq(charges.id, id))
    .returning();

  return result[0];
}

export async function permanentlyDeleteCharge(id: string) {
  const result = await db
    .delete(charges)
    .where(eq(charges.id, id))
    .returning();

  return result[0];
}

// ============================================
// Organization Role Queries
// ============================================

export async function getOrganizationRoleById(roleId: string, organizationId: string) {
  const result = await db
    .select()
    .from(organizationRole)
    .where(and(eq(organizationRole.id, roleId), eq(organizationRole.organizationId, organizationId)))
    .limit(1);

  return result[0] || null;
}

// ============================================
// IPD Charges Queries
// ============================================

export async function createIPDCharge(data: {
  hospitalId: string;
  ipdAdmissionId: string;
  chargeTypeId: string;
  chargeCategoryId: string;
  chargeId: string;
  qty: number;
  standardCharge: number;
  totalAmount: number;
  discountPercent: number;
  taxPercent: number;
  note?: string;
}) {
  const result = await db
    .insert(ipdCharges)
    .values({
      hospitalId: data.hospitalId,
      ipdAdmissionId: data.ipdAdmissionId,
      chargeTypeId: data.chargeTypeId,
      chargeCategoryId: data.chargeCategoryId,
      chargeId: data.chargeId,
      qty: data.qty,
      standardCharge: data.standardCharge.toString(),
      totalAmount: data.totalAmount.toString(),
      discountPercent: data.discountPercent.toString(),
      taxPercent: data.taxPercent.toString(),
      note: data.note,
    })
    .returning();

  return result[0];
}

export async function createIPDChargesBatch(data: {
  hospitalId: string;
  ipdAdmissionId: string;
  charges: Array<{
    chargeTypeId: string;
    chargeCategoryId: string;
    chargeId: string;
    qty: number;
    standardCharge: number;
    totalAmount: number;
    discountPercent: number;
    taxPercent: number;
    note?: string;
  }>;
}) {
  const values = data.charges.map((charge) => ({
    hospitalId: data.hospitalId,
    ipdAdmissionId: data.ipdAdmissionId,
    chargeTypeId: charge.chargeTypeId,
    chargeCategoryId: charge.chargeCategoryId,
    chargeId: charge.chargeId,
    qty: charge.qty,
    standardCharge: charge.standardCharge.toString(),
    totalAmount: charge.totalAmount.toString(),
    discountPercent: charge.discountPercent.toString(),
    taxPercent: charge.taxPercent.toString(),
    note: charge.note,
  }));

  const result = await db
    .insert(ipdCharges)
    .values(values)
    .returning();

  return result;
}

export async function getIPDChargesByAdmission(ipdAdmissionId: string, hospitalId: string) {
  return await db
    .select({
      id: ipdCharges.id,
      chargeTypeId: ipdCharges.chargeTypeId,
      chargeCategoryId: ipdCharges.chargeCategoryId,
      chargeId: ipdCharges.chargeId,
      chargeName: charges.name,
      chargeType: chargeTypes.name,
      chargeCategory: chargeCategories.name,
      qty: ipdCharges.qty,
      standardCharge: ipdCharges.standardCharge,
      totalAmount: ipdCharges.totalAmount,
      discountPercent: ipdCharges.discountPercent,
      taxPercent: ipdCharges.taxPercent,
      note: ipdCharges.note,
      createdAt: ipdCharges.createdAt,
    })
    .from(ipdCharges)
    .leftJoin(charges, eq(ipdCharges.chargeId, charges.id))
    .leftJoin(chargeTypes, eq(ipdCharges.chargeTypeId, chargeTypes.id))
    .leftJoin(chargeCategories, eq(ipdCharges.chargeCategoryId, chargeCategories.id))
    .where(
      and(
        eq(ipdCharges.ipdAdmissionId, ipdAdmissionId),
        eq(ipdCharges.hospitalId, hospitalId)
      )
    )
    .orderBy(desc(ipdCharges.createdAt));
}

// ===================================================
// Pathology Category Queries
// ===================================================

export async function getPathologyCategoriesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(pathologyCategories)
    .where(eq(pathologyCategories.hospitalId, hospitalId))
    .orderBy(desc(pathologyCategories.createdAt));
}

export async function getPathologyCategoryById(id: string) {
  const result = await db
    .select()
    .from(pathologyCategories)
    .where(eq(pathologyCategories.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createPathologyCategory(data: {
  hospitalId: string;
  name: string;
  description?: string;
}) {
  const result = await db
    .insert(pathologyCategories)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updatePathologyCategory(id: string, data: {
  name?: string;
  description?: string;
}) {
  const result = await db
    .update(pathologyCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(pathologyCategories.id, id))
    .returning();

  return result[0];
}

export async function deletePathologyCategory(id: string) {
  const result = await db
    .delete(pathologyCategories)
    .where(eq(pathologyCategories.id, id))
    .returning();

  return result[0];
}

// ===================================================
// Pathology Unit Queries
// ===================================================

export async function getPathologyUnitsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(pathologyUnits)
    .where(eq(pathologyUnits.hospitalId, hospitalId))
    .orderBy(desc(pathologyUnits.createdAt));
}

export async function getPathologyUnitById(id: string) {
  const result = await db
    .select()
    .from(pathologyUnits)
    .where(eq(pathologyUnits.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createPathologyUnit(data: {
  hospitalId: string;
  name: string;
}) {
  const result = await db
    .insert(pathologyUnits)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
    })
    .returning();

  return result[0];
}

export async function updatePathologyUnit(id: string, data: {
  name: string;
}) {
  const result = await db
    .update(pathologyUnits)
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(pathologyUnits.id, id))
    .returning();

  return result[0];
}

export async function deletePathologyUnit(id: string) {
  const result = await db
    .delete(pathologyUnits)
    .where(eq(pathologyUnits.id, id))
    .returning();

  return result[0];
}

// ===================================================
// Pathology Parameter Queries
// ===================================================

export async function getPathologyParametersByHospital(hospitalId: string) {
  return await db
    .select({
      id: pathologyParameters.id,
      paramName: pathologyParameters.paramName,
      fromRange: pathologyParameters.fromRange,
      toRange: pathologyParameters.toRange,
      unitId: pathologyParameters.unitId,
      testId: pathologyParameters.testId,
      unitName: pathologyUnits.name,
      description: pathologyParameters.description,
      hospitalId: pathologyParameters.hospitalId,
      createdAt: pathologyParameters.createdAt,
      updatedAt: pathologyParameters.updatedAt,
    })
    .from(pathologyParameters)
    .leftJoin(pathologyUnits, eq(pathologyParameters.unitId, pathologyUnits.id))
    .where(eq(pathologyParameters.hospitalId, hospitalId))
    .orderBy(desc(pathologyParameters.createdAt));
}

export async function getPathologyParameterById(id: string) {
  const result = await db
    .select({
      id: pathologyParameters.id,
      paramName: pathologyParameters.paramName,
      fromRange: pathologyParameters.fromRange,
      toRange: pathologyParameters.toRange,
      unitId: pathologyParameters.unitId,
      unitName: pathologyUnits.name,
      description: pathologyParameters.description,
      hospitalId: pathologyParameters.hospitalId,
      createdAt: pathologyParameters.createdAt,
      updatedAt: pathologyParameters.updatedAt,
    })
    .from(pathologyParameters)
    .leftJoin(pathologyUnits, eq(pathologyParameters.unitId, pathologyUnits.id))
    .where(eq(pathologyParameters.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createPathologyParameter(data: {
  hospitalId: string;
  testId: string;
  paramName: string;
  fromRange: string;
  toRange: string;
  unitId: string;
  description?: string;
}) {
  const result = await db
    .insert(pathologyParameters)
    .values({
      hospitalId: data.hospitalId,
      testId: data.testId,
      paramName: data.paramName,
      fromRange: data.fromRange,
      toRange: data.toRange,
      unitId: data.unitId,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updatePathologyParameter(id: string, data: {
  paramName?: string;
  fromRange?: string;
  toRange?: string;
  unitId?: string;
  description?: string;
}) {
  const result = await db
    .update(pathologyParameters)
    .set({
      ...(data.paramName && { paramName: data.paramName }),
      ...(data.fromRange && { fromRange: data.fromRange }),
      ...(data.toRange && { toRange: data.toRange }),
      ...(data.unitId && { unitId: data.unitId }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(pathologyParameters.id, id))
    .returning();

  return result[0];
}

export async function deletePathologyParameter(id: string) {
  const result = await db
    .delete(pathologyParameters)
    .where(eq(pathologyParameters.id, id))
    .returning();

  return result[0];
}

// ==================== Pathology Tests ====================

export async function getPathologyTestsByHospital(hospitalId: string) {
  const result = await db
    .select({
      id: pathologyTests.id,
      testName: pathologyTests.testName,
      shortName: pathologyTests.shortName,
      sampleType: pathologyTests.sampleType,
      description: pathologyTests.description,
      categoryId: pathologyTests.categoryId,
      categoryName: pathologyCategories.name,
      subCategoryId: pathologyTests.subCategoryId,
      method: pathologyTests.method,
      reportHours: pathologyTests.reportHours,
      chargeCategoryId: pathologyTests.chargeCategoryId,
      chargeId: pathologyTests.chargeId,
      chargeName: pathologyTests.chargeName,
      isDeleted: pathologyTests.isDeleted,
      createdAt: pathologyTests.createdAt,
      updatedAt: pathologyTests.updatedAt,
      amount: charges.amount,
      taxPercent: taxCategories.percent,
    })
    .from(pathologyTests)
    .leftJoin(
      pathologyCategories,
      eq(pathologyTests.categoryId, pathologyCategories.id)
    )
    .leftJoin(charges, eq(pathologyTests.chargeId, charges.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .where(eq(pathologyTests.hospitalId, hospitalId))
    .orderBy(desc(pathologyTests.createdAt));

  const testsWithParameters = await Promise.all(
    result.map(async (test) => {
      const parameters = await db
        .select({
          id: pathologyParameters.id,
          paramName: pathologyParameters.paramName,
          fromRange: pathologyParameters.fromRange,
          toRange: pathologyParameters.toRange,
          unitId: pathologyParameters.unitId,
          description: pathologyParameters.description,
          unitName: pathologyUnits.name,
        })
        .from(pathologyParameters)
        .leftJoin(pathologyUnits, eq(pathologyParameters.unitId, pathologyUnits.id))
        .where(eq(pathologyParameters.testId, test.id));
      return { ...test, parameters };
    })
  );

  return testsWithParameters;
}

export async function getPathologyTestById(id: string) {
  const result = await db
    .select({
      id: pathologyTests.id,
      testName: pathologyTests.testName,
      shortName: pathologyTests.shortName,
      sampleType: pathologyTests.sampleType,
      description: pathologyTests.description,
      categoryId: pathologyTests.categoryId,
      categoryName: pathologyCategories.name,
      subCategoryId: pathologyTests.subCategoryId,
      method: pathologyTests.method,
      reportHours: pathologyTests.reportHours,
      chargeCategoryId: pathologyTests.chargeCategoryId,
      chargeId: pathologyTests.chargeId,
      chargeName: pathologyTests.chargeName,
      isDeleted: pathologyTests.isDeleted,
      createdAt: pathologyTests.createdAt,
      updatedAt: pathologyTests.updatedAt,
      amount: charges.amount,
      taxPercent: taxCategories.percent,
    })
    .from(pathologyTests)
    .leftJoin(
      pathologyCategories,
      eq(pathologyTests.categoryId, pathologyCategories.id)
    )
    .leftJoin(charges, eq(pathologyTests.chargeId, charges.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .where(eq(pathologyTests.id, id));

  if (result.length === 0) return null;

  const test = result[0];
  const parameters = await db
    .select({
      id: pathologyParameters.id,
      paramName: pathologyParameters.paramName,
      fromRange: pathologyParameters.fromRange,
      toRange: pathologyParameters.toRange,
      unitId: pathologyParameters.unitId,
      description: pathologyParameters.description,
      unitName: pathologyUnits.name,
    })
    .from(pathologyParameters)
    .leftJoin(pathologyUnits, eq(pathologyParameters.unitId, pathologyUnits.id))
    .where(eq(pathologyParameters.testId, test.id));

  return { ...test, parameters };
}

export async function createPathologyTest(data: {
  hospitalId: string;
  testName: string;
  shortName?: string;
  sampleType: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  method?: string;
  reportHours: number;
  chargeCategoryId: string;
  chargeId: string;
  chargeName: string;
  parameters: {
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    description?: string;
  }[];
}) {
  return await db.transaction(async (tx) => {
    const [newTest] = await tx
      .insert(pathologyTests)
      .values({
        hospitalId: data.hospitalId,
        testName: data.testName,
        shortName: data.shortName,
        sampleType: data.sampleType,
        description: data.description,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        method: data.method,
        reportHours: data.reportHours,
        chargeCategoryId: data.chargeCategoryId,
        chargeId: data.chargeId,
        chargeName: data.chargeName,
      })
      .returning();

    if (data.parameters && data.parameters.length > 0) {
      await tx.insert(pathologyParameters).values(
        data.parameters.map((p) => ({
          ...p,
          hospitalId: data.hospitalId,
          testId: newTest.id,
        }))
      );
    }

    return newTest;
  });
}

export async function updatePathologyTest(
  id: string,
  data: {
    hospitalId: string;
    testName?: string;
    shortName?: string;
    sampleType?: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    method?: string;
    reportHours?: number;
    chargeCategoryId?: string;
    chargeId?: string;
    chargeName?: string;
    parameters?: {
      id?: string;
      paramName: string;
      fromRange: string;
      toRange: string;
      unitId: string;
      description?: string;
    }[];
  }
) {
  return await db.transaction(async (tx) => {
    const [updatedTest] = await tx
      .update(pathologyTests)
      .set({
        ...(data.testName && { testName: data.testName }),
        ...(data.shortName !== undefined && { shortName: data.shortName }),
        ...(data.sampleType && { sampleType: data.sampleType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.subCategoryId !== undefined && {
          subCategoryId: data.subCategoryId,
        }),
        ...(data.method !== undefined && { method: data.method }),
        ...(data.reportHours && { reportHours: data.reportHours }),
        ...(data.chargeCategoryId && { chargeCategoryId: data.chargeCategoryId }),
        ...(data.chargeId && { chargeId: data.chargeId }),
        ...(data.chargeName && { chargeName: data.chargeName }),
        updatedAt: new Date(),
      })
      .where(eq(pathologyTests.id, id))
      .returning();

    if (data.parameters) {
      // Simple sync: delete all and re-insert
      // Alternatively, we could do a more complex diffing update
      await tx
        .delete(pathologyParameters)
        .where(eq(pathologyParameters.testId, id));

      if (data.parameters.length > 0) {
        await tx.insert(pathologyParameters).values(
          data.parameters.map((p) => ({
            paramName: p.paramName,
            fromRange: p.fromRange,
            toRange: p.toRange,
            unitId: p.unitId,
            description: p.description,
            hospitalId: data.hospitalId,
            testId: id,
          }))
        );
      }
    }

    return updatedTest;
  });
}

export async function deletePathologyTest(id: string) {
  const result = await db
    .update(pathologyTests)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(pathologyTests.id, id))
    .returning();

  return result[0];
}

export async function restorePathologyTest(id: string) {
  const result = await db
    .update(pathologyTests)
    .set({
      isDeleted: false,
      updatedAt: new Date(),
    })
    .where(eq(pathologyTests.id, id))
    .returning();

  return result[0];
}

// ===================================================
// Radiology Category Queries
// ===================================================

export async function getRadiologyCategoriesByHospital(hospitalId: string) {
  return await db
    .select()
    .from(radiologyCategories)
    .where(eq(radiologyCategories.hospitalId, hospitalId))
    .orderBy(desc(radiologyCategories.createdAt));
}

export async function getRadiologyCategoryById(id: string) {
  const result = await db
    .select()
    .from(radiologyCategories)
    .where(eq(radiologyCategories.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createRadiologyCategory(data: {
  hospitalId: string;
  name: string;
  description?: string;
}) {
  const result = await db
    .insert(radiologyCategories)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
      description: data.description || null,
    })
    .returning();

  return result[0];
}

export async function updateRadiologyCategory(id: string, data: {
  name?: string;
  description?: string;
}) {
  const result = await db
    .update(radiologyCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      updatedAt: new Date(),
    })
    .where(eq(radiologyCategories.id, id))
    .returning();

  return result[0];
}

export async function deleteRadiologyCategory(id: string) {
  const result = await db
    .delete(radiologyCategories)
    .where(eq(radiologyCategories.id, id))
    .returning();

  return result[0];
}

// ===================================================
// Radiology Unit Queries
// ===================================================

export async function getRadiologyUnitsByHospital(hospitalId: string) {
  return await db
    .select()
    .from(radiologyUnits)
    .where(eq(radiologyUnits.hospitalId, hospitalId))
    .orderBy(desc(radiologyUnits.createdAt));
}

export async function getRadiologyUnitById(id: string) {
  const result = await db
    .select()
    .from(radiologyUnits)
    .where(eq(radiologyUnits.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createRadiologyUnit(data: {
  hospitalId: string;
  name: string;
}) {
  const result = await db
    .insert(radiologyUnits)
    .values({
      hospitalId: data.hospitalId,
      name: data.name,
    })
    .returning();

  return result[0];
}

export async function updateRadiologyUnit(id: string, data: {
  name: string;
}) {
  const result = await db
    .update(radiologyUnits)
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(radiologyUnits.id, id))
    .returning();

  return result[0];
}

export async function deleteRadiologyUnit(id: string) {
  const result = await db
    .delete(radiologyUnits)
    .where(eq(radiologyUnits.id, id))
    .returning();

  return result[0];
}

// ===================================================
// Radiology Test Queries
// ===================================================

export async function getRadiologyTestsByHospital(hospitalId: string) {
  const result = await db
    .select({
      id: radiologyTests.id,
      testName: radiologyTests.testName,
      shortName: radiologyTests.shortName,
      testType: radiologyTests.testType,
      description: radiologyTests.description,
      categoryId: radiologyTests.categoryId,
      categoryName: radiologyCategories.name,
      subCategoryId: radiologyTests.subCategoryId,
      reportHours: radiologyTests.reportHours,
      chargeCategoryId: radiologyTests.chargeCategoryId,
      chargeId: radiologyTests.chargeId,
      chargeName: radiologyTests.chargeName,
      isDeleted: radiologyTests.isDeleted,
      createdAt: radiologyTests.createdAt,
      updatedAt: radiologyTests.updatedAt,
      amount: charges.amount,
      taxPercent: taxCategories.percent,
    })
    .from(radiologyTests)
    .leftJoin(
      radiologyCategories,
      eq(radiologyTests.categoryId, radiologyCategories.id)
    )
    .leftJoin(charges, eq(radiologyTests.chargeId, charges.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .where(eq(radiologyTests.hospitalId, hospitalId))
    .orderBy(desc(radiologyTests.createdAt));

  const testsWithParameters = await Promise.all(
    result.map(async (test) => {
      const parameters = await db
        .select({
          id: radiologyParameters.id,
          paramName: radiologyParameters.paramName,
          fromRange: radiologyParameters.fromRange,
          toRange: radiologyParameters.toRange,
          unitId: radiologyParameters.unitId,
          description: radiologyParameters.description,
          unitName: radiologyUnits.name,
        })
        .from(radiologyParameters)
        .leftJoin(radiologyUnits, eq(radiologyParameters.unitId, radiologyUnits.id))
        .where(eq(radiologyParameters.testId, test.id));
      return { ...test, parameters };
    })
  );

  return testsWithParameters;
}

export async function getRadiologyTestById(id: string) {
  const result = await db
    .select({
      id: radiologyTests.id,
      testName: radiologyTests.testName,
      shortName: radiologyTests.shortName,
      testType: radiologyTests.testType,
      description: radiologyTests.description,
      categoryId: radiologyTests.categoryId,
      categoryName: radiologyCategories.name,
      subCategoryId: radiologyTests.subCategoryId,
      reportHours: radiologyTests.reportHours,
      chargeCategoryId: radiologyTests.chargeCategoryId,
      chargeId: radiologyTests.chargeId,
      chargeName: radiologyTests.chargeName,
      isDeleted: radiologyTests.isDeleted,
      createdAt: radiologyTests.createdAt,
      updatedAt: radiologyTests.updatedAt,
      amount: charges.amount,
      taxPercent: taxCategories.percent,
    })
    .from(radiologyTests)
    .leftJoin(
      radiologyCategories,
      eq(radiologyTests.categoryId, radiologyCategories.id)
    )
    .leftJoin(charges, eq(radiologyTests.chargeId, charges.id))
    .leftJoin(taxCategories, eq(charges.taxCategoryId, taxCategories.id))
    .where(eq(radiologyTests.id, id));

  if (result.length === 0) return null;

  const test = result[0];
  const parameters = await db
    .select({
      id: radiologyParameters.id,
      paramName: radiologyParameters.paramName,
      fromRange: radiologyParameters.fromRange,
      toRange: radiologyParameters.toRange,
      unitId: radiologyParameters.unitId,
      description: radiologyParameters.description,
      unitName: radiologyUnits.name,
    })
    .from(radiologyParameters)
    .leftJoin(radiologyUnits, eq(radiologyParameters.unitId, radiologyUnits.id))
    .where(eq(radiologyParameters.testId, test.id));

  return { ...test, parameters };
}

export async function createRadiologyTest(data: {
  hospitalId: string;
  testName: string;
  shortName?: string;
  testType?: string;
  description?: string;
  categoryId: string;
  subCategoryId?: string;
  reportHours: number;
  chargeCategoryId: string;
  chargeId: string;
  chargeName: string;
  parameters: {
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    description?: string;
  }[];
}) {
  return await db.transaction(async (tx) => {
    const [newTest] = await tx
      .insert(radiologyTests)
      .values({
        hospitalId: data.hospitalId,
        testName: data.testName,
        shortName: data.shortName,
        testType: data.testType,
        description: data.description,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        reportHours: data.reportHours,
        chargeCategoryId: data.chargeCategoryId,
        chargeId: data.chargeId,
        chargeName: data.chargeName,
      })
      .returning();

    if (data.parameters && data.parameters.length > 0) {
      await tx.insert(radiologyParameters).values(
        data.parameters.map((p) => ({
          ...p,
          hospitalId: data.hospitalId,
          testId: newTest.id,
        }))
      );
    }

    return newTest;
  });
}

export async function updateRadiologyTest(
  id: string,
  data: {
    hospitalId: string;
    testName?: string;
    shortName?: string;
    testType?: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    reportHours?: number;
    chargeCategoryId?: string;
    chargeId?: string;
    chargeName?: string;
    parameters?: {
      id?: string;
      paramName: string;
      fromRange: string;
      toRange: string;
      unitId: string;
      description?: string;
    }[];
  }
) {
  return await db.transaction(async (tx) => {
    const [updatedTest] = await tx
      .update(radiologyTests)
      .set({
        ...(data.testName && { testName: data.testName }),
        ...(data.shortName !== undefined && { shortName: data.shortName }),
        ...(data.testType !== undefined && { testType: data.testType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.subCategoryId !== undefined && {
          subCategoryId: data.subCategoryId,
        }),
        ...(data.reportHours && { reportHours: data.reportHours }),
        ...(data.chargeCategoryId && { chargeCategoryId: data.chargeCategoryId }),
        ...(data.chargeId && { chargeId: data.chargeId }),
        ...(data.chargeName && { chargeName: data.chargeName }),
        updatedAt: new Date(),
      })
      .where(eq(radiologyTests.id, id))
      .returning();

    if (data.parameters) {
      // Simple sync: delete all and re-insert
      await tx
        .delete(radiologyParameters)
        .where(eq(radiologyParameters.testId, id));

      if (data.parameters.length > 0) {
        await tx.insert(radiologyParameters).values(
          data.parameters.map((p) => ({
            paramName: p.paramName,
            fromRange: p.fromRange,
            toRange: p.toRange,
            unitId: p.unitId,
            description: p.description,
            hospitalId: data.hospitalId,
            testId: id,
          }))
        );
      }
    }

    return updatedTest;
  });
}

export async function deleteRadiologyTest(id: string) {
  const result = await db
    .update(radiologyTests)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(radiologyTests.id, id))
    .returning();

  return result[0];
}

export async function restoreRadiologyTest(id: string) {
  const result = await db
    .update(radiologyTests)
    .set({
      isDeleted: false,
      updatedAt: new Date(),
    })
    .where(eq(radiologyTests.id, id))
    .returning();

  return result[0];
}

// ============================================
// Ambulance Queries
// ============================================

export async function getAmbulancesByHospital(hospitalId: string, activeOnly = true) {
  if (activeOnly) {
    return await db
      .select()
      .from(ambulance)
      .where(and(
        eq(ambulance.hospitalId, hospitalId),
        eq(ambulance.status, 'active')
      ))
      .orderBy(desc(ambulance.createdAt));
  } else {
    // Show all non-active: maintenance, inactive (including deleted ones)
    return await db
      .select()
      .from(ambulance)
      .where(and(
        eq(ambulance.hospitalId, hospitalId),
        ne(ambulance.status, 'active')
      ))
      .orderBy(desc(ambulance.updatedAt));
  }
}

// Removing getDeletedAmbulancesByHospital as it's merged into the above

export async function createAmbulance(data: NewAmbulance) {
  const result = await db.insert(ambulance).values(data).returning();
  return result[0];
}


// Ambulance Booking Queries

export async function getAmbulanceBookingsByHospital(hospitalId: string) {
  return await db
    .select({
      id: ambulanceBooking.id,
      patientId: ambulanceBooking.patientId,
      patientName: patients.name,
      patientPhone: patients.mobileNumber, // Corrected from patients.phone
      ambulanceId: ambulanceBooking.ambulanceId,
      vehicleNumber: ambulance.vehicleNumber,
      driverName: ambulanceBooking.driverName,
      driverContactNo: ambulanceBooking.driverContactNo,
      pickupLocation: ambulanceBooking.pickupLocation,
      dropLocation: ambulanceBooking.dropLocation,
      standardCharge: ambulanceBooking.standardCharge,
      taxPercent: ambulanceBooking.taxPercent,
      discountAmt: ambulanceBooking.discountAmt,
      totalAmount: ambulanceBooking.totalAmount,
      paidAmount: ambulanceBooking.paidAmount,
      paymentMode: ambulanceBooking.paymentMode,
      paymentStatus: ambulanceBooking.paymentStatus,
      bookingStatus: ambulanceBooking.bookingStatus,
      referenceNo: ambulanceBooking.referenceNo,
      tripType: ambulanceBooking.tripType,
      bookingDate: ambulanceBooking.bookingDate,
      bookingTime: ambulanceBooking.bookingTime,
      createdAt: ambulanceBooking.createdAt,
      chargeCategory: chargeCategories.name,
      chargeName: charges.name,
    })
    .from(ambulanceBooking)
    .innerJoin(patients, eq(ambulanceBooking.patientId, patients.id))
    .innerJoin(ambulance, eq(ambulanceBooking.ambulanceId, ambulance.id))
    .innerJoin(charges, eq(ambulanceBooking.chargeId, charges.id))
    .innerJoin(chargeCategories, eq(ambulanceBooking.chargeCategory, chargeCategories.id))
    .where(eq(ambulanceBooking.hospitalId, hospitalId))
    .orderBy(desc(ambulanceBooking.createdAt));
}

export async function createAmbulanceBooking(data: NewAmbulanceBooking) {
  const result = await db.insert(ambulanceBooking).values(data).returning();
  return result[0];
}

export async function updateAmbulanceBooking(id: string, data: Partial<NewAmbulanceBooking>) {
  const result = await db
    .update(ambulanceBooking)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ambulanceBooking.id, id))
    .returning();
  return result[0];
}

export async function deleteAmbulanceBooking(id: string) {
  const result = await db
    .delete(ambulanceBooking)
    .where(eq(ambulanceBooking.id, id))
    .returning();
  return result[0];
}

export async function getAmbulanceBookingById(id: string) {
  const result = await db
    .select({
      id: ambulanceBooking.id,
      patientId: ambulanceBooking.patientId,
      patientName: patients.name,
      patientMobile: patients.mobileNumber,
      patientEmail: patients.email,
      ambulanceId: ambulanceBooking.ambulanceId,
      chargeCategory: ambulanceBooking.chargeCategory,
      chargeId: ambulanceBooking.chargeId,
      standardCharge: ambulanceBooking.standardCharge,
      taxPercent: ambulanceBooking.taxPercent,
      discountAmt: ambulanceBooking.discountAmt,
      totalAmount: ambulanceBooking.totalAmount,
      paidAmount: ambulanceBooking.paidAmount,
      paymentMode: ambulanceBooking.paymentMode,
      paymentStatus: ambulanceBooking.paymentStatus,
      bookingStatus: ambulanceBooking.bookingStatus,
      referenceNo: ambulanceBooking.referenceNo,
      pickupLocation: ambulanceBooking.pickupLocation,
      dropLocation: ambulanceBooking.dropLocation,
      bookingDate: ambulanceBooking.bookingDate,
      bookingTime: ambulanceBooking.bookingTime,
      driverName: ambulanceBooking.driverName,
      driverContactNo: ambulanceBooking.driverContactNo,
      tripType: ambulanceBooking.tripType,
      createdAt: ambulanceBooking.createdAt,
    })
    .from(ambulanceBooking)
    .innerJoin(patients, eq(ambulanceBooking.patientId, patients.id))
    .where(eq(ambulanceBooking.id, id))
    .limit(1);
  return result[0];
}

export async function updateAmbulance(id: string, data: Partial<NewAmbulance>) {
  const result = await db
    .update(ambulance)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(ambulance.id, id))
    .returning();
  return result[0];
}


export async function restoreAmbulance(id: string) {
  const result = await db
    .update(ambulance)
    .set({ updatedAt: new Date(), status: 'active' })
    .where(eq(ambulance.id, id))
    .returning();
  return result[0];
}