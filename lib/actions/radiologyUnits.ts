"use server";

import { db } from "@/db/index";
import { radiologyUnits } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getRadiologyUnitsByHospital,
    createRadiologyUnit as dbCreateRadiologyUnit,
    updateRadiologyUnit as dbUpdateRadiologyUnit,
    deleteRadiologyUnit as dbDeleteRadiologyUnit,
} from "@/db/queries";

export async function getRadiologyUnits() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getRadiologyUnitsByHospital(org.id);

        return { data };
    } catch (error) {
        console.error("Error fetching radiology units:", error);
        return { error: "Failed to fetch radiology units" };
    }
}

export async function createRadiologyUnit(formData: {
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

        const newUnit = await dbCreateRadiologyUnit({
            hospitalId: org.id,
            name: name.trim(),
        });

        revalidatePath("/doctor/settings/radiology");
        return { data: newUnit };
    } catch (error) {
        console.error("Error creating radiology unit:", error);
        return { error: "Failed to create radiology unit" };
    }
}

export async function updateRadiologyUnit(id: string, formData: {
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

        const updatedUnit = await dbUpdateRadiologyUnit(id, {
            name: name.trim(),
        });

        if (!updatedUnit) {
            return { error: "Radiology unit not found" };
        }

        revalidatePath("/doctor/settings/radiology");
        return { data: updatedUnit };
    } catch (error) {
        console.error("Error updating radiology unit:", error);
        return { error: "Failed to update radiology unit" };
    }
}

export async function deleteRadiologyUnit(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedUnit = await dbDeleteRadiologyUnit(id);

        if (!deletedUnit) {
            return { error: "Radiology unit not found" };
        }

        revalidatePath("/doctor/settings/radiology");
        return { data: deletedUnit };
    } catch (error) {
        console.error("Error deleting radiology unit:", error);
        return { error: "Failed to delete radiology unit" };
    }
}
