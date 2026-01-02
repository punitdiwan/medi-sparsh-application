"use server";

import { db } from "@/db";
import { ipdPrescriptions, doctors, user, staff } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getIPDPrescriptions(ipdAdmissionId: string) {
    try {
        const data = await db
            .select({
                id: ipdPrescriptions.id,
                prescriptionNo: ipdPrescriptions.id, // Using ID as prescription number for now
                date: ipdPrescriptions.prescribeDate,
                findings: ipdPrescriptions.symptoms, // Using symptoms as findings
                doctorId: ipdPrescriptions.prescribeBy,
                medicines: ipdPrescriptions.medicines,
                notes: ipdPrescriptions.note,
                doctorName: user.name,
            })
            .from(ipdPrescriptions)
            .leftJoin(doctors, eq(ipdPrescriptions.prescribeBy, doctors.id))
            .leftJoin(staff, eq(doctors.staffId, staff.id))
            .leftJoin(user, eq(staff.userId, user.id))
            .where(eq(ipdPrescriptions.ipdAdmissionId, ipdAdmissionId))
            .orderBy(desc(ipdPrescriptions.createdAt));

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching IPD prescriptions:", error);
        return { success: false, error: "Failed to fetch prescriptions" };
    }
}

import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function createIPDPrescription(data: any) {
    console.log("createIPDPrescription received data:", data);
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { success: false, error: "Unauthorized" };
        }

        if (!data.ipdAdmissionId) {
            throw new Error("ipdAdmissionId is required");
        }
        await db.insert(ipdPrescriptions).values({
            hospitalId: org.id,
            ipdAdmissionId: data.ipdAdmissionId,
            prescribeBy: data.doctorId,
            symptoms: data.symptoms,
            medicines: data.medicines,
            note: data.notes,
            attachments: data.attachments ? JSON.stringify(data.attachments) : null,
        });

        revalidatePath(`/doctor/IPD/ipdDetails/${data.ipdAdmissionId}/ipd/prescription`);
        return { success: true };
    } catch (error) {
        console.error("Error creating IPD prescription:", error);
        return { success: false, error: "Failed to create prescription" };
    }
}

export async function updateIPDPrescription(id: string, data: any) {
    try {
        await db
            .update(ipdPrescriptions)
            .set({
                prescribeBy: data.doctorId,
                symptoms: data.symptoms,
                medicines: data.medicines,
                note: data.notes,
                attachments: data.attachments ? JSON.stringify(data.attachments) : null,
            })
            .where(eq(ipdPrescriptions.id, id));

        revalidatePath(`/doctor/IPD/ipdDetails/${data.ipdAdmissionId}/ipd/prescription`);
        return { success: true };
    } catch (error) {
        console.error("Error updating IPD prescription:", error);
        return { success: false, error: "Failed to update prescription" };
    }
}

export async function deleteIPDPrescription(id: string, ipdAdmissionId: string) {
    try {
        await db.delete(ipdPrescriptions).where(eq(ipdPrescriptions.id, id));
        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/prescription`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD prescription:", error);
        return { success: false, error: "Failed to delete prescription" };
    }
}
