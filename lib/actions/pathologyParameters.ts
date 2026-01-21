"use server";

import { db } from "@/db/index";
import { pathologyParameters } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getPathologyParametersByHospital,
    createPathologyParameter as dbCreatePathologyParameter,
    updatePathologyParameter as dbUpdatePathologyParameter,
    deletePathologyParameter as dbDeletePathologyParameter,
} from "@/db/queries";

export async function getPathologyParameters() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPathologyParametersByHospital(org.id);

        return { data };
    } catch (error) {
        console.error("Error fetching pathology parameters:", error);
        return { error: "Failed to fetch pathology parameters" };
    }
}

export async function createPathologyParameter(formData: {
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    description?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { paramName, fromRange, toRange, unitId, description } = formData;

        if (!paramName || !paramName.trim()) {
            return { error: "Parameter name is required" };
        }

        if (!fromRange || !fromRange.trim()) {
            return { error: "From range is required" };
        }

        if (!toRange || !toRange.trim()) {
            return { error: "To range is required" };
        }

        if (!unitId || !unitId.trim()) {
            return { error: "Unit is required" };
        }

        const newParameter = await dbCreatePathologyParameter({
            hospitalId: org.id,
            paramName: paramName.trim(),
            fromRange: fromRange.trim(),
            toRange: toRange.trim(),
            unitId: unitId.trim(),
            description: description?.trim(),
        });

        revalidatePath("/doctor/settings/pathology/parameter");
        return { data: newParameter };
    } catch (error) {
        console.error("Error creating pathology parameter:", error);
        return { error: "Failed to create pathology parameter" };
    }
}

export async function updatePathologyParameter(id: string, formData: {
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    description?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { paramName, fromRange, toRange, unitId, description } = formData;

        if (!paramName || !paramName.trim()) {
            return { error: "Parameter name is required" };
        }

        if (!fromRange || !fromRange.trim()) {
            return { error: "From range is required" };
        }

        if (!toRange || !toRange.trim()) {
            return { error: "To range is required" };
        }

        if (!unitId || !unitId.trim()) {
            return { error: "Unit is required" };
        }

        const updatedParameter = await dbUpdatePathologyParameter(id, {
            paramName: paramName.trim(),
            fromRange: fromRange.trim(),
            toRange: toRange.trim(),
            unitId: unitId.trim(),
            description: description?.trim(),
        });

        if (!updatedParameter) {
            return { error: "Pathology parameter not found" };
        }

        revalidatePath("/doctor/settings/pathology/parameter");
        return { data: updatedParameter };
    } catch (error) {
        console.error("Error updating pathology parameter:", error);
        return { error: "Failed to update pathology parameter" };
    }
}

export async function deletePathologyParameter(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedParameter = await dbDeletePathologyParameter(id);

        if (!deletedParameter) {
            return { error: "Pathology parameter not found" };
        }

        revalidatePath("/doctor/settings/pathology/parameter");
        return { data: deletedParameter };
    } catch (error) {
        console.error("Error deleting pathology parameter:", error);
        return { error: "Failed to delete pathology parameter" };
    }
}
