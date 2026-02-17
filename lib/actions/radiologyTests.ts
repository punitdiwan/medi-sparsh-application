"use server";

import { getActiveOrganization } from "@/lib/getActiveOrganization";
import {
    getRadiologyTestsByHospital,
    createRadiologyTest as dbCreateRadiologyTest,
    updateRadiologyTest as dbUpdateRadiologyTest,
    deleteRadiologyTest as dbDeleteRadiologyTest,
    restoreRadiologyTest as dbRestoreRadiologyTest,
} from "@/db/queries";
import { revalidatePath } from "next/cache";

export async function getRadiologyTests() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const data = await getRadiologyTestsByHospital(org.id);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching radiology tests:", error);
        return { error: "Failed to fetch radiology tests", success: false };
    }
}

export async function createRadiologyTest(formData: {
    testName: string;
    shortName?: string;
    testType?: string;
    description?: string;
    categoryId: string;
    subCategoryId?: string;
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
            return { error: "Unauthorized", success: false };
        }

        if (!formData.testName || !formData.testName.trim()) {
            return { error: "Test name is required", success: false };
        }

        const newTest = await dbCreateRadiologyTest({
            ...formData,
            hospitalId: org.id,
        });

        revalidatePath("/doctor/radiology/radiologyTest");
        return { success: true, data: newTest };
    } catch (error) {
        console.error("Error creating radiology test:", error);
        return { error: "Failed to create radiology test", success: false };
    }
}

export async function updateRadiologyTest(id: string, formData: {
    testName?: string;
    shortName?: string;
    testType?: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    reportHours?: number;
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
            return { error: "Unauthorized", success: false };
        }

        const updatedTest = await dbUpdateRadiologyTest(id, {
            ...formData,
            hospitalId: org.id,
        });

        if (!updatedTest) {
            return { error: "Radiology test not found", success: false };
        }

        revalidatePath("/doctor/radiology/radiologyTest");
        return { success: true, data: updatedTest };
    } catch (error) {
        console.error("Error updating radiology test:", error);
        return { error: "Failed to update radiology test", success: false };
    }
}

export async function deleteRadiologyTest(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const deletedTest = await dbDeleteRadiologyTest(id);

        if (!deletedTest) {
            return { error: "Radiology test not found", success: false };
        }

        revalidatePath("/doctor/radiology/radiologyTest");
        return { success: true, data: deletedTest };
    } catch (error) {
        console.error("Error deleting radiology test:", error);
        return { error: "Failed to delete radiology test", success: false };
    }
}

export async function restoreRadiologyTest(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const restoredTest = await dbRestoreRadiologyTest(id);

        if (!restoredTest) {
            return { error: "Radiology test not found", success: false };
        }

        revalidatePath("/doctor/radiology/radiologyTest");
        return { success: true, data: restoredTest };
    } catch (error) {
        console.error("Error restoring radiology test:", error);
        return { error: "Failed to restore radiology test", success: false };
    }
}
