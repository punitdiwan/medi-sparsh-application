"use server";

import { db } from "@/db/index";
import { medicineUnits } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getMedicineUnits() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: medicineUnits.id,
                name: medicineUnits.name,
                createdAt: medicineUnits.createdAt,
            })
            .from(medicineUnits)
            .where(eq(medicineUnits.hospitalId, org.id))
            .orderBy(desc(medicineUnits.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching medicine units:", error);
        return { error: "Failed to fetch medicine units" };
    }
}

export async function createMedicineUnit(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Unit name is required" };
        }

        const [newUnit] = await db
            .insert(medicineUnits)
            .values({
                hospitalId: org.id,
                name: name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/medicineRecord/medicineUnit");
        return { data: newUnit };
    } catch (error) {
        console.error("Error creating medicine unit:", error);
        return { error: "Failed to create medicine unit" };
    }
}

export async function updateMedicineUnit(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Unit name is required" };
        }

        const [updatedUnit] = await db
            .update(medicineUnits)
            .set({
                name: name.trim(),
                updatedAt: new Date(),
            })
            .where(and(eq(medicineUnits.id, id), eq(medicineUnits.hospitalId, org.id)))
            .returning();

        if (!updatedUnit) {
            return { error: "Medicine unit not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineUnit");
        return { data: updatedUnit };
    } catch (error) {
        console.error("Error updating medicine unit:", error);
        return { error: "Failed to update medicine unit" };
    }
}

export async function deleteMedicineUnit(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [deletedUnit] = await db
            .delete(medicineUnits)
            .where(and(eq(medicineUnits.id, id), eq(medicineUnits.hospitalId, org.id)))
            .returning();

        if (!deletedUnit) {
            return { error: "Medicine unit not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineUnit");
        return { data: deletedUnit };
    } catch (error) {
        console.error("Error deleting medicine unit:", error);
        return { error: "Failed to delete medicine unit" };
    }
}
