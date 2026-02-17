"use server";

import { db } from "@/db/index";
import { pathologyUnits } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getPathologyUnitsByHospital,
    createPathologyUnit as dbCreatePathologyUnit,
    updatePathologyUnit as dbUpdatePathologyUnit,
    deletePathologyUnit as dbDeletePathologyUnit,
} from "@/db/queries";

export async function getPathologyUnits() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPathologyUnitsByHospital(org.id);

        return { data };
    } catch (error) {
        console.error("Error fetching pathology units:", error);
        return { error: "Failed to fetch pathology units" };
    }
}

export async function createPathologyUnit(formData: {
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

        const newUnit = await dbCreatePathologyUnit({
            hospitalId: org.id,
            name: name.trim(),
        });

        revalidatePath("/doctor/settings/pathology/unit");
        return { data: newUnit };
    } catch (error) {
        console.error("Error creating pathology unit:", error);
        return { error: "Failed to create pathology unit" };
    }
}

export async function updatePathologyUnit(id: string, formData: {
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

        const updatedUnit = await dbUpdatePathologyUnit(id, {
            name: name.trim(),
        });

        if (!updatedUnit) {
            return { error: "Pathology unit not found" };
        }

        revalidatePath("/doctor/settings/pathology/unit");
        return { data: updatedUnit };
    } catch (error) {
        console.error("Error updating pathology unit:", error);
        return { error: "Failed to update pathology unit" };
    }
}

export async function deletePathologyUnit(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedUnit = await dbDeletePathologyUnit(id);

        if (!deletedUnit) {
            return { error: "Pathology unit not found" };
        }

        revalidatePath("/doctor/settings/pathology/unit");
        return { data: deletedUnit };
    } catch (error) {
        console.error("Error deleting pathology unit:", error);
        return { error: "Failed to delete pathology unit" };
    }
}
