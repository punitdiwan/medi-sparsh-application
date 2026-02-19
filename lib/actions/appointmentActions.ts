"use server";

import { db } from "@/db/index";
import {
    doctors,
    staff,
    user,
    doctorShifts,
    shifts,
    doctorSlots,
    charges,
    appointments,
    patients,
    transactions,
    slotBookings
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { z } from "zod";
import { getAppointmentByIdWithDetails } from "@/db/queries";
import { getCurrentUser } from "../utils/auth-helpers";

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string };
// ============================================
// VALIDATION SCHEMAS
// ============================================

const hospitalModeSchema = z.object({
    facilityType: z.literal("hospital"),
    patientId: z.string().min(1, "Patient is required"),
    doctorUserId: z.string().min(1, "Doctor is required"),
    appointmentDate: z.string().min(1, "Date is required"),
    shiftId: z.string().min(1, "Shift is required"),
    slotId: z.string().min(1, "Slot is required"),
    reason: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

const clinicModeSchema = z.object({
    facilityType: z.literal("clinic"),
    patientId: z.string().min(1, "Patient is required"),
    doctorUserId: z.string().min(1, "Doctor is required"),
    appointmentDate: z.string().min(1, "Date is required"),
    appointmentTime: z.string().min(1, "Time is required"),
    services: z.array(z.any()).min(1, "At least one service is required"),
    reason: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
});

// ============================================
// GET DOCTOR SHIFTS
// ============================================

export async function getDoctorShifts(userIdOrDoctorId: string): Promise<ApiResponse<any>> {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }

        // First, try to get doctor ID from user ID
        const doctorRecord = await db
            .select({
                doctorId: doctors.id,
            })
            .from(doctors)
            .innerJoin(staff, eq(doctors.staffId, staff.id))
            .where(
                and(
                    eq(staff.userId, userIdOrDoctorId),
                    eq(doctors.hospitalId, org.id),
                    eq(doctors.isDeleted, false)
                )
            )
            .limit(1);

        // If not found by user ID, assume it's a doctor ID
        const doctorId = doctorRecord.length > 0 ? doctorRecord[0].doctorId : userIdOrDoctorId;

        const data = await db
            .select({
                shiftId: doctorShifts.shiftId,
                shiftName: shifts.name,
                startTime: shifts.startTime,
                endTime: shifts.endTime,
            })
            .from(doctorShifts)
            .innerJoin(shifts, eq(doctorShifts.shiftId, shifts.id))
            .where(
                and(
                    eq(doctorShifts.doctorUserId, doctorId),
                    eq(doctorShifts.hospitalId, org.id)
                )
            );

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching doctor shifts:", error);
        return { success: false, error: "Failed to fetch doctor shifts" };
    }
}

// ============================================
// GET DOCTOR CONSULTATION FEE
// ============================================

export async function getDoctorConsultationFee(userIdOrDoctorId: string): Promise<ApiResponse<any>> {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }

        // Try to find doctor by user ID first
        const data = await db
            .select({
                consultationFee: doctors.consultationFee,
            })
            .from(doctors)
            .innerJoin(staff, eq(doctors.staffId, staff.id))
            .where(
                and(
                    eq(staff.userId, userIdOrDoctorId),
                    eq(doctors.hospitalId, org.id),
                    eq(doctors.isDeleted, false)
                )
            )
            .limit(1);

        if (!data || data.length === 0) {
            return { success: false, error: "Doctor not found" };
        }

        return { success: true, data: data[0] };
    } catch (error) {
        console.error("Error fetching doctor fee:", error);
        return { success: false, error: "Failed to fetch doctor fee" };
    }
}

// ============================================
// GET DOCTOR SLOTS
// ============================================

export async function getDoctorSlots(
    userIdOrDoctorId: string,
    date: string,
    shiftId: string
): Promise<ApiResponse<any>> {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }

        // First, try to get doctor ID from user ID
        const doctorRecord = await db
            .select({
                doctorId: doctors.id,
            })
            .from(doctors)
            .innerJoin(staff, eq(doctors.staffId, staff.id))
            .where(
                and(
                    eq(staff.userId, userIdOrDoctorId),
                    eq(doctors.hospitalId, org.id),
                    eq(doctors.isDeleted, false)
                )
            )
            .limit(1);

        // If not found by user ID, assume it's a doctor ID
        const doctorId = doctorRecord.length > 0 ? doctorRecord[0].doctorId : userIdOrDoctorId;

        // Get day of week from date
        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.toLocaleDateString("en-US", {
            weekday: "long",
        });

        // Get all slots for this doctor, shift, and day
        const allSlots = await db
            .select({
                slotId: doctorSlots.id,
                timeFrom: doctorSlots.timeFrom,
                timeTo: doctorSlots.timeTo,
                durationMins: doctorSlots.durationMins,
                chargeId: doctorSlots.chargeId,
                chargeAmount: charges.amount,
                chargeName: charges.name,
            })
            .from(doctorSlots)
            .innerJoin(charges, eq(doctorSlots.chargeId, charges.id))
            .where(
                and(
                    eq(doctorSlots.doctorId, doctorId),
                    eq(doctorSlots.shiftId, shiftId),
                    eq(doctorSlots.day, dayOfWeek),
                    eq(doctorSlots.hospitalId, org.id)
                )
            );

        // Get booked slots for this date
        // All slots are always available (multiple bookings per slot allowed)
        const availableSlots = allSlots.map((slot) => ({
            ...slot,
            isAvailable: true,
        }));

        return { success: true, data: availableSlots };
    } catch (error) {
        console.error("Error fetching doctor slots:", error);
        return { success: false, error: "Failed to fetch doctor slots" };
    }
}

// ============================================
// CHECK SLOT AVAILABILITY
// ============================================

export async function checkSlotAvailability(slotId: string, date: string): Promise<ApiResponse<{ isAvailable: boolean }>> {
    // Multiple bookings per slot are allowed — always return available
    return { success: true, data: { isAvailable: true } };
}

// ============================================
// CREATE APPOINTMENT
// ============================================

export async function createAppointment(data: any): Promise<ApiResponse<any>> {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }
        const user = await getCurrentUser();

        // Validate based on facility type
        let validatedData;
        if (data.facilityType === "hospital") {
            validatedData = hospitalModeSchema.parse(data);
        } else {
            validatedData = clinicModeSchema.parse(data);
        }

        // For hospital mode, create appointment (multiple bookings per slot allowed)
        if (validatedData.facilityType === "hospital") {
            // Get slot details for pricing
            const slotDetails = await db
                .select({
                    chargeAmount: charges.amount,
                    timeFrom: doctorSlots.timeFrom,
                })
                .from(doctorSlots)
                .innerJoin(charges, eq(doctorSlots.chargeId, charges.id))
                .where(eq(doctorSlots.id, validatedData.slotId))
                .limit(1);

            if (!slotDetails || slotDetails.length === 0) {
                return { success: false, error: "Slot not found" };
            }

            // Create appointment with hospital mode data
            const [appointment] = await db
                .insert(appointments)
                .values({
                    hospitalId: org.id,
                    patientId: validatedData.patientId,
                    doctorUserId: validatedData.doctorUserId,
                    appointmentDate: sql`${validatedData.appointmentDate}::date`,
                    appointmentTime: slotDetails[0].timeFrom,
                    status: "scheduled",
                    reason: validatedData.reason || "",
                    notes: validatedData.notes || "",
                    scheduledBy: user.id,
                    services: {
                        shiftId: validatedData.shiftId,
                        slotId: validatedData.slotId,
                        doctorFees: slotDetails[0].chargeAmount,
                    },
                })
                .returning();

            // Create slot booking
            await db.insert(slotBookings).values({
                hospitalId: org.id,
                slotId: validatedData.slotId,
                appointmentId: appointment.id,
                appointmentDate: sql`${validatedData.appointmentDate}::date`,
                status: "active",
            });

            return { success: true, data: appointment };
        } else {
            // Clinic mode - create appointment with services
            const [appointment] = await db
                .insert(appointments)
                .values({
                    hospitalId: org.id,
                    patientId: validatedData.patientId,
                    doctorUserId: validatedData.doctorUserId,
                    appointmentDate: sql`${validatedData.appointmentDate}::date`,
                    appointmentTime: validatedData.appointmentTime,
                    status: "scheduled",
                    reason: validatedData.reason || "",
                    notes: validatedData.notes || "",
                    services: validatedData.services,
                })
                .returning();

            return { success: true, data: appointment };
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error creating appointment:", error);
        return { success: false, error: "Failed to create appointment" };
    }
}

// ============================================
// UPDATE APPOINTMENT
// ============================================

export async function updateAppointment(appointmentId: string, data: any): Promise<ApiResponse<any>> {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate based on facility type
        let validatedData;
        if (data.facilityType === "hospital") {
            validatedData = hospitalModeSchema.parse(data);
        } else {
            validatedData = clinicModeSchema.parse(data);
        }

        // Get existing appointment
        const [existingAppointment] = await db
            .select()
            .from(appointments)
            .where(
                and(
                    eq(appointments.id, appointmentId),
                    eq(appointments.hospitalId, org.id)
                )
            )
            .limit(1);

        if (!existingAppointment) {
            return { success: false, error: "Appointment not found" };
        }

        if (validatedData.facilityType === "hospital") {
            // Check if slot changed
            const oldSlotId = (existingAppointment.services as any)?.slotId;
            const slotChanged = oldSlotId !== validatedData.slotId;

            if (slotChanged) {
                // Cancel old slot booking
                if (oldSlotId) {
                    await db
                        .update(slotBookings)
                        .set({ status: "cancelled" })
                        .where(
                            and(
                                eq(slotBookings.appointmentId, appointmentId),
                                eq(slotBookings.status, "active")
                            )
                        );
                }

                // Create new slot booking
                await db.insert(slotBookings).values({
                    hospitalId: org.id,
                    slotId: validatedData.slotId,
                    appointmentId: appointmentId,
                    appointmentDate: sql`${validatedData.appointmentDate}::date`,
                    status: "active",
                });
            }

            // Get slot details for pricing
            const slotDetails = await db
                .select({
                    chargeAmount: charges.amount,
                    timeFrom: doctorSlots.timeFrom,
                })
                .from(doctorSlots)
                .innerJoin(charges, eq(doctorSlots.chargeId, charges.id))
                .where(eq(doctorSlots.id, validatedData.slotId))
                .limit(1);

            return await db.transaction(async (tx) => {
                const [updatedAppointment] = await tx
                    .update(appointments)
                    .set({
                        patientId: validatedData.patientId,
                        doctorUserId: validatedData.doctorUserId,
                        appointmentDate: sql`${validatedData.appointmentDate}::date`,
                        appointmentTime: slotDetails[0].timeFrom,
                        reason: validatedData.reason || "",
                        notes: validatedData.notes || "",
                        status: validatedData.status || existingAppointment.status,
                        services: {
                            shiftId: validatedData.shiftId,
                            slotId: validatedData.slotId,
                            doctorFees: slotDetails[0].chargeAmount,
                        },
                    })
                    .where(eq(appointments.id, appointmentId))
                    .returning();

                // If cancelled → update transaction status
                if (validatedData.status === "cancelled") {
                    await tx
                        .update(transactions)
                        .set({ status: "cancelled" })
                        .where(eq(transactions.appointmentId, appointmentId));

                    // Also cancel slot booking
                    await tx
                        .update(slotBookings)
                        .set({ status: "cancelled" })
                        .where(
                            and(
                                eq(slotBookings.appointmentId, appointmentId),
                                eq(slotBookings.status, "active")
                            )
                        );
                }

                return { success: true, data: updatedAppointment };
            });

        } else {
            // Clinic mode update
            return await db.transaction(async (tx) => {
                const [updatedAppointment] = await tx
                    .update(appointments)
                    .set({
                        patientId: validatedData.patientId,
                        doctorUserId: validatedData.doctorUserId,
                        appointmentDate: sql`${validatedData.appointmentDate}::date`,
                        appointmentTime: validatedData.appointmentTime,
                        reason: validatedData.reason || "",
                        notes: validatedData.notes || "",
                        status: validatedData.status || existingAppointment.status,
                        services: validatedData.services,
                    })
                    .where(eq(appointments.id, appointmentId))
                    .returning();

                // If cancelled → update transaction status
                if (validatedData.status === "cancelled") {
                    await tx
                        .update(transactions)
                        .set({ status: "cancelled" })
                        .where(eq(transactions.appointmentId, appointmentId));
                }

                return { success: true, data: updatedAppointment };
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        console.error("Error updating appointment:", error);
        return { success: false, error: "Failed to update appointment" };
    }
}


export async function getAppointmentDetails(appointmentId: string) {
    try {
        const data = await getAppointmentByIdWithDetails(appointmentId);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching appointment details:", error);
        return { success: false, error: "Failed to fetch appointment details" };
    }
}
