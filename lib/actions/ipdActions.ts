"use server";

import { db } from "@/db/index";
import { ipdAdmission, beds } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

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
        });

        revalidatePath("/doctor/IPD/registration");
        return { success: true };
    } catch (error) {
        console.error("Error creating IPD admission:", error);
        return { error: "Failed to create IPD admission" };
    }
}
