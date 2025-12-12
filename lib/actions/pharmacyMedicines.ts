"use server";

import {
    getPharmacyMedicinesByHospital,
    createPharmacyMedicine as createPharmacyMedicineQuery,
    updatePharmacyMedicine as updatePharmacyMedicineQuery,
    deletePharmacyMedicine as deletePharmacyMedicineQuery,
    getMedicineCategories,
    getMedicineCompanies,
    getMedicineGroups,
    getMedicineUnits,
} from "@/db/queries/pharmacyMedicines";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod validation schemas
const pharmacyMedicineCreateSchema = z.object({
    name: z.string().min(1, "Medicine name is required").trim(),
    categoryId: z.string().min(1, "Category is required"),
    companyId: z.string().min(1, "Company is required"),
    unitId: z.string().min(1, "Unit is required"),
    groupId: z.string().min(1, "Group is required"),
});

const pharmacyMedicineUpdateSchema = pharmacyMedicineCreateSchema.extend({
    id: z.string().min(1, "Medicine ID is required"),
});

export type PharmacyMedicineCreateInput = z.infer<typeof pharmacyMedicineCreateSchema>;
export type PharmacyMedicineUpdateInput = z.infer<typeof pharmacyMedicineUpdateSchema>;

export async function getPharmacyMedicines() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacyMedicinesByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching pharmacy medicines:", error);
        return { error: "Failed to fetch medicines" };
    }
}

export async function createPharmacyMedicine(input: PharmacyMedicineCreateInput) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const validatedData = pharmacyMedicineCreateSchema.parse(input);

        const newMedicine = await createPharmacyMedicineQuery({
            hospitalId: org.id,
            name: validatedData.name,
            categoryId: validatedData.categoryId,
            companyId: validatedData.companyId,
            unitId: validatedData.unitId,
            groupId: validatedData.groupId,
        });

        revalidatePath("/doctor/pharmacy/medicine");
        return { data: newMedicine };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = (error as any).issues || [];
            return { error: issues[0]?.message || "Validation error" };
        }
        console.error("Error creating pharmacy medicine:", error);
        return { error: "Failed to create medicine" };
    }
}

export async function updatePharmacyMedicine(input: PharmacyMedicineUpdateInput) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const validatedData = pharmacyMedicineUpdateSchema.parse(input);

        const updatedMedicine = await updatePharmacyMedicineQuery(validatedData.id, {
            name: validatedData.name,
            categoryId: validatedData.categoryId,
            companyId: validatedData.companyId,
            unitId: validatedData.unitId,
            groupId: validatedData.groupId,
        });

        if (!updatedMedicine) {
            return { error: "Medicine not found" };
        }

        revalidatePath("/doctor/pharmacy/medicine");
        return { data: updatedMedicine };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = (error as any).issues || [];
            return { error: issues[0]?.message || "Validation error" };
        }
        console.error("Error updating pharmacy medicine:", error);
        return { error: "Failed to update medicine" };
    }
}

export async function deletePharmacyMedicine(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedMedicine = await deletePharmacyMedicineQuery(id);

        if (!deletedMedicine) {
            return { error: "Medicine not found" };
        }

        revalidatePath("/doctor/pharmacy/medicine");
        return { data: deletedMedicine };
    } catch (error) {
        console.error("Error deleting pharmacy medicine:", error);
        return { error: "Failed to delete medicine" };
    }
}

export async function getPharmacyMedicineDropdowns() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [categories, companies, groups, units] = await Promise.all([
            getMedicineCategories(org.id),
            getMedicineCompanies(org.id),
            getMedicineGroups(org.id),
            getMedicineUnits(org.id),
        ]);

        return {
            data: {
                categories,
                companies,
                groups,
                units,
            },
        };
    } catch (error) {
        console.error("Error fetching dropdown data:", error);
        return { error: "Failed to fetch dropdown data" };
    }
}
