"use server";

import { db } from "@/lib/db";
import { vitals } from "@/lib/db/migrations/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getVitals() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: vitals.id,
                name: vitals.name,
                vitalsUnit: vitals.vitalsUnit,
                from: vitals.from,
                to: vitals.to,
            })
            .from(vitals)
            .where(eq(vitals.hospitalId, org.id))
            .orderBy(desc(vitals.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching vitals:", error);
        return { error: "Failed to fetch vitals" };
    }
}

export async function createVital(formData: {
    name: string;
    unit: string;
    from: string;
    to: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, unit, from, to } = formData;

        if (!name || !unit || !from || !to) {
            return { error: "Missing required fields" };
        }

        const [newVital] = await db
            .insert(vitals)
            .values({
                hospitalId: org.id,
                name,
                vitalsUnit: unit,
                from,
                to,
            })
            .returning();

        revalidatePath("/doctor/settings/vital");
        return { data: newVital };
    } catch (error) {
        console.error("Error creating vital:", error);
        return { error: "Failed to create vital" };
    }
}

export async function updateVital(id: string, formData: {
    name: string;
    unit: string;
    from: string;
    to: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, unit, from, to } = formData;

        if (!name || !unit || !from || !to) {
            return { error: "Missing required fields" };
        }

        const [updatedVital] = await db
            .update(vitals)
            .set({
                name,
                vitalsUnit: unit,
                from,
                to,
                updatedAt: new Date(),
            })
            .where(and(eq(vitals.id, id), eq(vitals.hospitalId, org.id)))
            .returning();

        if (!updatedVital) {
            return { error: "Vital not found" };
        }

        revalidatePath("/doctor/settings/vital");
        return { data: updatedVital };
    } catch (error) {
        console.error("Error updating vital:", error);
        return { error: "Failed to update vital" };
    }
}

export async function deleteVital(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [deletedVital] = await db
            .delete(vitals)
            .where(and(eq(vitals.id, id), eq(vitals.hospitalId, org.id)))
            .returning();

        if (!deletedVital) {
            return { error: "Vital not found" };
        }

        revalidatePath("/doctor/settings/vital");
        return { data: deletedVital };
    } catch (error) {
        console.error("Error deleting vital:", error);
        return { error: "Failed to delete vital" };
    }
}
