"use server";

import { db } from "@/db/index";
import { ipdAdmission, beds, doctors, staff, user, ipdConsultation, patients, ipdCharges, appointments, ipdPayments } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { createIPDChargesBatch, getIPDChargesByAdmission } from "@/db/queries";

export async function createIPDAdmission(data: any) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.transaction(async (tx) => {
            // Create IPD Admission
            const [newAdmission] = await tx.insert(ipdAdmission).values({
                hospitalId: org.id,
                patientId: data.patientId,
                admissionDate: new Date(data.admissionDate),
                caseDetails: data.caseDetails,
                casuality: data.casualty === "yes",
                creditLimit: data.creditLimit.toString(),
                refrenceFrom: data.reference,
                doctorId: data.consultantDoctor,
                bedGroupId: data.bedGroup,
                bedId: data.bedNumber, // Assuming bedNumber holds the bed ID from the dropdown
                notes: data.notes,
                medicalHistory: data.previousMedicalIssue,
                diagnosis: data.symptoms, // Store symptoms in diagnosis column as JSONB
            }).returning({ id: ipdAdmission.id });

            // Add credit entry in ipd_payments if credit limit is provided
            if (Number(data.creditLimit) > 0) {
                await tx.insert(ipdPayments).values({
                    hospitalId: org.id,
                    ipdAdmissionId: newAdmission.id,
                    paymentDate: new Date(data.admissionDate),
                    paymentMode: "Credit Limit",
                    paymentAmount: data.creditLimit.toString(),
                    paymentNote: "Initial credit limit during registration",
                    toCredit: true,
                });
            }

            // Update Bed Status
            await tx.update(beds)
                .set({ isOccupied: true, status: "occupied" })
                .where(eq(beds.id, data.bedNumber));

            // Update Patient Status
            await tx.update(patients)
                .set({ isAdmitted: true })
                .where(eq(patients.id, data.patientId));

            // Update Appointment if opdId is provided
            if (data.opdId) {
                const appointment = await tx.query.appointments.findFirst({
                    where: eq(appointments.id, data.opdId)
                });

                if (appointment) {
                    const updatedNotes = appointment.notes
                        ? `${appointment.notes}\nPatient has been moved to IPD.`
                        : "Patient has been moved to IPD.";

                    await tx.update(appointments)
                        .set({
                            status: "completed",
                            notes: updatedNotes,
                            updatedAt: new Date().toISOString()
                        })
                        .where(eq(appointments.id, data.opdId));
                }
            }
        });

        revalidatePath("/doctor/IPD/registration");
        revalidatePath("/doctor/IPD");
        return { success: true };
    } catch (error) {
        console.error("Error creating IPD admission:", error);
        return { error: "Failed to create IPD admission" };
    }
}

export async function getIPDAdmissions() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db.select({
            ipdNo: ipdAdmission.id,
            caseId: ipdAdmission.caseId,
            patientName: patients.name,
            gender: patients.gender,
            phone: patients.mobileNumber,
            doctorName: user.name,
            bedName: beds.name,
            creditLimit: ipdAdmission.creditLimit,
            // Compute available credit per admission using subqueries on ipd_payments
            availableCredit: sql`COALESCE(
                (
                    (SELECT COALESCE(SUM(payment_amount::numeric),0) FROM ipd_payments WHERE ipd_payments.ipd_admission_id = ipd_admission.id AND ipd_payments.to_credit = true)
                    -
                    (SELECT COALESCE(SUM(payment_amount::numeric),0) FROM ipd_payments WHERE ipd_payments.ipd_admission_id = ipd_admission.id AND ipd_payments.payment_mode = 'Credit')
                ), 0
            )`,
            medicalHistory: ipdAdmission.medicalHistory,
            // isAntenatal: patients.isAntenatal, // Assuming this field exists or we default to false
            // For now, we don't have isAntenatal in the patient schema shown, so we'll omit or default it.
        })
            .from(ipdAdmission)
            .leftJoin(patients, eq(ipdAdmission.patientId, patients.id))
            .leftJoin(doctors, eq(ipdAdmission.doctorId, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .leftJoin(beds, eq(ipdAdmission.bedId, beds.id))
            .where(
                and(
                    eq(ipdAdmission.hospitalId, org.id),
                    eq(ipdAdmission.dischargeStatus, "pending"),
                    eq(patients.isAdmitted, true)
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching IPD admissions:", error);
        return { error: "Failed to fetch IPD admissions" };
    }
}

export async function getIPDAdmissionDetails(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db.select({
            ipdNo: ipdAdmission.id,
            caseId: ipdAdmission.caseId,
            patientName: patients.name,
            gender: patients.gender,
            phone: patients.mobileNumber,
            dob: patients.dob,
            doctorName: user.name,
            bedName: beds.name,
            admissionDate: ipdAdmission.admissionDate,
            creditLimit: ipdAdmission.creditLimit,
            medicalHistory: ipdAdmission.medicalHistory,
            notes: ipdAdmission.notes,
            diagnosis: ipdAdmission.diagnosis,
            dischargeStatus: ipdAdmission.dischargeStatus,
        })
            .from(ipdAdmission)
            .leftJoin(patients, eq(ipdAdmission.patientId, patients.id))
            .leftJoin(doctors, eq(ipdAdmission.doctorId, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .leftJoin(beds, eq(ipdAdmission.bedId, beds.id))
            .where(
                and(
                    eq(ipdAdmission.hospitalId, org.id),
                    eq(ipdAdmission.id, id)
                )
            )
            .limit(1);

        if (data.length === 0) {
            return { error: "Admission not found" };
        }

        return { data: data[0] };
    } catch (error) {
        console.error("Error fetching IPD admission details:", error);
        return { error: "Failed to fetch IPD admission details" };
    }
}

export async function createIPDConsultation(data: any) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.insert(ipdConsultation).values({
            hospitalId: org.id,
            ipdAdmissionId: data.ipdAdmissionId,
            doctorId: data.consultantDoctorId,
            appliedDate: new Date(data.appliedDate),
            consultationDate: new Date(data.consultantDate),
            consultationTime: new Date(data.consultantDate + "T" + (data.consultationTime || "00:00")),
            consultationDetails: data.instruction,
        });

        revalidatePath(`/doctor/IPD/ipdDetails/${data.ipdAdmissionId}/ipd/consultantRegister`);
        return { success: true };
    } catch (error) {
        console.error("Error creating IPD consultation:", error);
        return { error: "Failed to create IPD consultation" };
    }
}

export async function getIPDConsultations(ipdAdmissionId: string, showDeleted: boolean = false) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db.select({
            id: ipdConsultation.id,
            appliedDate: ipdConsultation.appliedDate,
            consultationDate: ipdConsultation.consultationDate,
            consultationTime: ipdConsultation.consultationTime,
            consultantDoctorName: user.name,
            instruction: ipdConsultation.consultationDetails,
            isDeleted: ipdConsultation.isDeleted,
        })
            .from(ipdConsultation)
            .leftJoin(doctors, eq(ipdConsultation.doctorId, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .where(
                and(
                    eq(ipdConsultation.hospitalId, org.id),
                    eq(ipdConsultation.ipdAdmissionId, ipdAdmissionId),
                    showDeleted ? undefined : eq(ipdConsultation.isDeleted, false)
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching IPD consultations:", error);
        return { error: "Failed to fetch IPD consultations" };
    }
}

export async function deleteIPDConsultation(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.update(ipdConsultation)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(
                and(
                    eq(ipdConsultation.id, id),
                    eq(ipdConsultation.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/consultantRegister`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD consultation:", error);
        return { error: "Failed to delete IPD consultation" };
    }
}

export async function restoreIPDConsultation(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.update(ipdConsultation)
            .set({ isDeleted: false, updatedAt: new Date() })
            .where(
                and(
                    eq(ipdConsultation.id, id),
                    eq(ipdConsultation.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/consultantRegister`);
        return { success: true };
    } catch (error) {
        console.error("Error restoring IPD consultation:", error);
        return { error: "Failed to restore IPD consultation" };
    }
}

export async function createIPDCharges(data: {
    ipdAdmissionId: string;
    charges: Array<{
        chargeTypeId: string;
        chargeCategoryId: string;
        chargeId: string;
        qty: number;
        standardCharge: number;
        totalAmount: number;
        discountPercent?: number;
        taxPercent?: number;
        note?: string | null;
    }>;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!data.ipdAdmissionId) {
            return { error: "IPD Admission ID is required" };
        }

        if (!data.charges || !Array.isArray(data.charges) || data.charges.length === 0) {
            return { error: "At least one charge is required" };
        }

        // Validate each charge
        for (const charge of data.charges) {
            if (!charge.chargeTypeId || !charge.chargeCategoryId || !charge.chargeId) {
                return { error: "All charge fields (Type, Category, Charge) are required" };
            }
            if (!charge.qty || charge.qty <= 0) {
                return { error: "Quantity must be greater than 0" };
            }
            if (!charge.standardCharge || charge.standardCharge < 0) {
                return { error: "Standard charge must be a valid number" };
            }
        }

        const result = await createIPDChargesBatch({
            hospitalId: org.id,
            ipdAdmissionId: data.ipdAdmissionId,
            charges: data.charges.map((charge) => ({
                chargeTypeId: charge.chargeTypeId,
                chargeCategoryId: charge.chargeCategoryId,
                chargeId: charge.chargeId,
                qty: charge.qty,
                standardCharge: charge.standardCharge,
                totalAmount: charge.totalAmount,
                discountPercent: charge.discountPercent ?? 0,
                taxPercent: charge.taxPercent ?? 0,
                note: charge.note ?? undefined,
            })),
        });

        revalidatePath(`/doctor/IPD/ipdDetails/${data.ipdAdmissionId}/ipd/charges`);
        return { data: result, success: true };
    } catch (error) {
        console.error("Error creating IPD charges:", error);
        return { error: "Failed to create IPD charges" };
    }
}

export async function getIPDCharges(ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!ipdAdmissionId) {
            return { error: "IPD Admission ID is required" };
        }

        const data = await getIPDChargesByAdmission(ipdAdmissionId, org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching IPD charges:", error);
        return { error: "Failed to fetch IPD charges" };
    }
}

export async function deleteIPDCharge(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.delete(ipdCharges)
            .where(
                and(
                    eq(ipdCharges.id, id),
                    eq(ipdCharges.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/charges`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD charge:", error);
        return { error: "Failed to delete IPD charge" };
    }
}

export async function updateIPDCharge(id: string, data: any, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.update(ipdCharges)
            .set({
                qty: data.qty,
                totalAmount: data.totalAmount,
                discountPercent: data.discountPercent,
                taxPercent: data.taxPercent,
                note: data.note,
                createdAt: data.date ? new Date(data.date) : undefined, // Update date if provided
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(ipdCharges.id, id),
                    eq(ipdCharges.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/charges`);
        return { success: true };
    } catch (error) {
        console.error("Error updating IPD charge:", error);
        return { error: "Failed to update IPD charge" };
    }
}

export async function dischargePatient(ipdAdmissionId: string, data: any) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const admission = await db.query.ipdAdmission.findFirst({
            where: eq(ipdAdmission.id, ipdAdmissionId)
        });

        if (!admission) {
            return { error: "Admission not found" };
        }

        await db.transaction(async (tx) => {
            // Update IPD Admission
            await tx.update(ipdAdmission)
                .set({
                    dischargeDate: new Date(data.dischargeDate),
                    dischargeStatus: data.dischargeStatus.toLowerCase() === "referral" ? "referal" : data.dischargeStatus.toLowerCase() as any,
                    notes: data.note,
                    dischargeInfo: data,
                })
                .where(eq(ipdAdmission.id, ipdAdmissionId));

            // Update Bed Status
            if (admission.bedId) {
                await tx.update(beds)
                    .set({ isOccupied: false, status: "active" })
                    .where(eq(beds.id, admission.bedId));
            }

            // Update Patient Status
            await tx.update(patients)
                .set({ isAdmitted: false })
                .where(eq(patients.id, admission.patientId));
        });

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd`);
        revalidatePath("/doctor/IPD");
        return { success: true };
    } catch (error) {
        console.error("Error discharging patient:", error);
        return { error: "Failed to discharge patient" };
    }
}

export async function getDischargedPatients() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db.select({
            id: ipdAdmission.id,
            name: patients.name,
            patientId: patients.id,
            caseId: ipdAdmission.caseId,
            gender: patients.gender,
            phone: patients.mobileNumber,
            consultantDoctor: user.name,
            admissionDate: ipdAdmission.admissionDate,
            dischargedDate: ipdAdmission.dischargeDate,
            dischargeStatus: ipdAdmission.dischargeStatus,
        })
            .from(ipdAdmission)
            .leftJoin(patients, eq(ipdAdmission.patientId, patients.id))
            .leftJoin(doctors, eq(ipdAdmission.doctorId, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .where(
                and(
                    eq(ipdAdmission.hospitalId, org.id),
                    ne(ipdAdmission.dischargeStatus, "pending")
                )
            );

        return { data };
    } catch (error) {
        console.error("Error fetching discharged patients:", error);
        return { error: "Failed to fetch discharged patients" };
    }
}
