"use server";

import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getPathologyTestsByHospital,
    createPathologyTest as dbCreatePathologyTest,
    updatePathologyTest as dbUpdatePathologyTest,
    deletePathologyTest as dbDeletePathologyTest,
    restorePathologyTest as dbRestorePathologyTest,
} from "@/db/queries";

export async function getPathologyTests() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPathologyTestsByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching pathology tests:", error);
        return { error: "Failed to fetch pathology tests" };
    }
}

export async function createPathologyTest(formData: {
    testName: string;
    shortName?: string;
    sampleType: string;
    description?: string;
    categoryId: string;
    subCategoryId?: string;
    method?: string;
    reportHours: number;
    chargeCategoryId: string;
    chargeId: string;
    chargeName: string;
    parameters: {
        paramName: string;
        fromRange: string;
        toRange: string;
        unitId: string;
        description?: string;
    }[];
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!formData.testName || !formData.testName.trim()) {
            return { error: "Test name is required" };
        }

        const newTest = await dbCreatePathologyTest({
            ...formData,
            hospitalId: org.id,
        });

        revalidatePath("/doctor/pathology/pathologyTest");
        return { data: newTest };
    } catch (error) {
        console.error("Error creating pathology test:", error);
        return { error: "Failed to create pathology test" };
    }
}

export async function updatePathologyTest(id: string, formData: {
    testName?: string;
    shortName?: string;
    sampleType?: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    method?: string;
    reportDays?: number;
    chargeCategoryId?: string;
    chargeId?: string;
    chargeName?: string;
    parameters?: {
        id?: string;
        paramName: string;
        fromRange: string;
        toRange: string;
        unitId: string;
        description?: string;
    }[];
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const updatedTest = await dbUpdatePathologyTest(id, {
            ...formData,
            hospitalId: org.id,
            ...(formData.reportDays !== undefined && { reportHours: formData.reportDays * 24 }),
        });

        if (!updatedTest) {
            return { error: "Pathology test not found" };
        }

        revalidatePath("/doctor/pathology/pathologyTest");
        return { data: updatedTest };
    } catch (error) {
        console.error("Error updating pathology test:", error);
        return { error: "Failed to update pathology test" };
    }
}

export async function deletePathologyTest(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedTest = await dbDeletePathologyTest(id);

        if (!deletedTest) {
            return { error: "Pathology test not found" };
        }

        revalidatePath("/doctor/pathology/pathologyTest");
        return { data: deletedTest };
    } catch (error) {
        console.error("Error deleting pathology test:", error);
        return { error: "Failed to delete pathology test" };
    }
}

export async function restorePathologyTest(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const restoredTest = await dbRestorePathologyTest(id);

        if (!restoredTest) {
            return { error: "Pathology test not found" };
        }

        revalidatePath("/doctor/pathology/pathologyTest");
        return { data: restoredTest };
    } catch (error) {
        console.error("Error restoring pathology test:", error);
        return { error: "Failed to restore pathology test" };
    }
}
