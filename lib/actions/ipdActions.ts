"use server";

import { db } from "@/db/index";
import { ipdAdmission, beds, doctors, staff, user, ipdConsultation } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { patients } from "@/drizzle/schema";
import { createIPDChargesBatch, getIPDChargesByAdmission } from "@/db/queries";

export async function createIPDAdmission(data: any) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.transaction(async (tx) => {
            // Create IPD Admission
            await tx.insert(ipdAdmission).values({
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
            });

            // Update Bed Status
            await tx.update(beds)
                .set({ isOccupied: true })
                .where(eq(beds.id, data.bedNumber));

            // Update Patient Status
            await tx.update(patients)
                .set({ isAdmitted: true })
                .where(eq(patients.id, data.patientId));
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
