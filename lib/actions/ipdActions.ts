"use server";

import { db } from "@/db/index";
import { ipdAdmission, beds, doctors, staff, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { patients } from "@/drizzle/schema";

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
