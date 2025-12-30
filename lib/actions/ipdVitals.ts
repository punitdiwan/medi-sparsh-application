"use server";

import { db } from "@/db/index";
import { ipdVitals, vitals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getActiveOrganization } from "../getActiveOrganization";

export async function getVitalDefinitions() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: vitals.id,
                name: vitals.name,
                unit: vitals.vitalsUnit,
                from: vitals.from,
                to: vitals.to,
            })
            .from(vitals)
            .where(eq(vitals.hospitalId, org.id))
            .orderBy(vitals.name);

        return { data };
    } catch (error) {
        console.error("Error fetching vital definitions:", error);
        return { error: "Failed to fetch vital definitions" };
    }
}

export async function getIPDVitals(ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select()
            .from(ipdVitals)
            .where(
                and(
                    eq(ipdVitals.ipdAdmissionId, ipdAdmissionId),
                    eq(ipdVitals.hospitalId, org.id)
                )
            )
            .orderBy(desc(ipdVitals.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching IPD vitals:", error);
        return { error: "Failed to fetch IPD vitals" };
    }
}

export async function addIPDVitals(ipdAdmissionId: string, vitalsData: any[]) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!ipdAdmissionId || !vitalsData || vitalsData.length === 0) {
            return { error: "Missing required fields" };
        }

        const [newRecord] = await db
            .insert(ipdVitals)
            .values({
                hospitalId: org.id,
                ipdAdmissionId,
                vitals: vitalsData,
            })
            .returning();

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/vitals`);
        return { data: newRecord };
    } catch (error) {
        console.error("Error adding IPD vitals:", error);
        return { error: "Failed to add IPD vitals" };
    }
}
