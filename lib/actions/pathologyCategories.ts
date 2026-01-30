"use server";

import { db } from "@/db/index";
import { pathologyCategories } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getPathologyCategoriesByHospital,
    createPathologyCategory as dbCreatePathologyCategory,
    updatePathologyCategory as dbUpdatePathologyCategory,
    deletePathologyCategory as dbDeletePathologyCategory,
} from "@/db/queries";

export async function getPathologyCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPathologyCategoriesByHospital(org.id);

        return { data };
    } catch (error) {
        console.error("Error fetching pathology categories:", error);
        return { error: "Failed to fetch pathology categories" };
    }
}

export async function createPathologyCategory(formData: {
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

        const newCategory = await dbCreatePathologyCategory({
            hospitalId: org.id,
            name: name.trim(),
            description: description?.trim(),
        });

        revalidatePath("/doctor/settings/pathology");
        return { data: newCategory };
    } catch (error) {
        console.error("Error creating pathology category:", error);
        return { error: "Failed to create pathology category" };
    }
}

export async function updatePathologyCategory(id: string, formData: {
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

        const updatedCategory = await dbUpdatePathologyCategory(id, {
            name: name.trim(),
            description: description?.trim(),
        });

        if (!updatedCategory) {
            return { error: "Pathology category not found" };
        }

        revalidatePath("/doctor/settings/pathology");
        return { data: updatedCategory };
    } catch (error) {
        console.error("Error updating pathology category:", error);
        return { error: "Failed to update pathology category" };
    }
}

export async function deletePathologyCategory(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedCategory = await dbDeletePathologyCategory(id);

        if (!deletedCategory) {
            return { error: "Pathology category not found" };
        }

        revalidatePath("/doctor/settings/pathology");
        return { data: deletedCategory };
    } catch (error) {
        console.error("Error deleting pathology category:", error);
        return { error: "Failed to delete pathology category" };
    }
}
