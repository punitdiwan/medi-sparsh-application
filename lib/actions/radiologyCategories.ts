"use server";

import { db } from "@/db/index";
import { radiologyCategories } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getRadiologyCategoriesByHospital,
    createRadiologyCategory as dbCreateRadiologyCategory,
    updateRadiologyCategory as dbUpdateRadiologyCategory,
    deleteRadiologyCategory as dbDeleteRadiologyCategory,
} from "@/db/queries";

export async function getRadiologyCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getRadiologyCategoriesByHospital(org.id);

        return { data };
    } catch (error) {
        console.error("Error fetching radiology categories:", error);
        return { error: "Failed to fetch radiology categories" };
    }
}

export async function createRadiologyCategory(formData: {
    name: string;
    description?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, description } = formData;

        if (!name || !name.trim()) {
            return { error: "Category name is required" };
        }

        const newCategory = await dbCreateRadiologyCategory({
            hospitalId: org.id,
            name: name.trim(),
            description: description?.trim(),
        });

        revalidatePath("/doctor/settings/radiology");
        return { data: newCategory };
    } catch (error) {
        console.error("Error creating radiology category:", error);
        return { error: "Failed to create radiology category" };
    }
}

export async function updateRadiologyCategory(id: string, formData: {
    name?: string;
    description?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, description } = formData;

        if (name !== undefined && !name.trim()) {
            return { error: "Category name cannot be empty" };
        }

        const updatedCategory = await dbUpdateRadiologyCategory(id, {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description.trim() || undefined }),
        });

        if (!updatedCategory) {
            return { error: "Radiology category not found" };
        }

        revalidatePath("/doctor/settings/radiology");
        return { data: updatedCategory };
    } catch (error) {
        console.error("Error updating radiology category:", error);
        return { error: "Failed to update radiology category" };
    }
}

export async function deleteRadiologyCategory(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedCategory = await dbDeleteRadiologyCategory(id);

        if (!deletedCategory) {
            return { error: "Radiology category not found" };
        }

        revalidatePath("/doctor/settings/radiology");
        return { data: deletedCategory };
    } catch (error) {
        console.error("Error deleting radiology category:", error);
        return { error: "Failed to delete radiology category" };
    }
}
