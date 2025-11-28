"use server";

import { db } from "@/lib/db";
import { medicineCategories } from "@/lib/db/migrations/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getMedicineCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: medicineCategories.id,
                name: medicineCategories.name,
                createdAt: medicineCategories.createdAt,
            })
            .from(medicineCategories)
            .where(eq(medicineCategories.hospitalId, org.id))
            .orderBy(desc(medicineCategories.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching medicine categories:", error);
        return { error: "Failed to fetch medicine categories" };
    }
}

export async function createMedicineCategory(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Category name is required" };
        }

        const [newCategory] = await db
            .insert(medicineCategories)
            .values({
                hospitalId: org.id,
                name: name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/medicineRecord/medicinCategory");
        return { data: newCategory };
    } catch (error) {
        console.error("Error creating medicine category:", error);
        return { error: "Failed to create medicine category" };
    }
}

export async function updateMedicineCategory(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Category name is required" };
        }

        const [updatedCategory] = await db
            .update(medicineCategories)
            .set({
                name: name.trim(),
                updatedAt: new Date(),
            })
            .where(and(eq(medicineCategories.id, id), eq(medicineCategories.hospitalId, org.id)))
            .returning();

        if (!updatedCategory) {
            return { error: "Medicine category not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicinCategory");
        return { data: updatedCategory };
    } catch (error) {
        console.error("Error updating medicine category:", error);
        return { error: "Failed to update medicine category" };
    }
}

export async function deleteMedicineCategory(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [deletedCategory] = await db
            .delete(medicineCategories)
            .where(and(eq(medicineCategories.id, id), eq(medicineCategories.hospitalId, org.id)))
            .returning();

        if (!deletedCategory) {
            return { error: "Medicine category not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicinCategory");
        return { data: deletedCategory };
    } catch (error) {
        console.error("Error deleting medicine category:", error);
        return { error: "Failed to delete medicine category" };
    }
}
