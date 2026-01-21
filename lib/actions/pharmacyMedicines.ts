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

export async function getPharmacyMedicineWithBatches(medicineId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { db } = await import("@/db");
        const { pharmacyMedicines, pharmacyStock, medicineCategories, medicineCompanies, medicineGroups, medicineUnits } = await import("@/db/schema");
        const { eq, and, gte } = await import("drizzle-orm");

        // Fetch medicine details
        const [medicine] = await db
            .select({
                id: pharmacyMedicines.id,
                name: pharmacyMedicines.name,
                categoryId: pharmacyMedicines.categoryId,
                companyId: pharmacyMedicines.companyId,
                groupId: pharmacyMedicines.groupId,
                unitId: pharmacyMedicines.unitId,
            })
            .from(pharmacyMedicines)
            .where(
                and(
                    eq(pharmacyMedicines.id, medicineId),
                    eq(pharmacyMedicines.hospitalId, org.id)
                )
            );

        if (!medicine) {
            return { error: "Medicine not found" };
        }

        // Fetch related data
        const [category] = await db
            .select({ name: medicineCategories.name })
            .from(medicineCategories)
            .where(eq(medicineCategories.id, medicine.categoryId));

        const [company] = await db
            .select({ name: medicineCompanies.name })
            .from(medicineCompanies)
            .where(eq(medicineCompanies.id, medicine.companyId));

        const [group] = await db
            .select({ name: medicineGroups.name })
            .from(medicineGroups)
            .where(eq(medicineGroups.id, medicine.groupId));

        const [unit] = await db
            .select({ name: medicineUnits.name })
            .from(medicineUnits)
            .where(eq(medicineUnits.id, medicine.unitId));

        // Fetch stock batches - ONLY non-expired ones, sorted by expiry date (earliest first)
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        const batches = await db
            .select({
                id: pharmacyStock.id,
                batchNumber: pharmacyStock.batchNumber,
                quantity: pharmacyStock.quantity,
                lowStockAlert: pharmacyStock.lowStockAlert,
                costPrice: pharmacyStock.costPrice,
                mrp: pharmacyStock.mrp,
                sellingPrice: pharmacyStock.sellingPrice,
                expiryDate: pharmacyStock.expiryDate,
                isDeleted: pharmacyStock.isDeleted,
            })
            .from(pharmacyStock)
            .where(
                and(
                    eq(pharmacyStock.medicineId, medicineId),
                    eq(pharmacyStock.hospitalId, org.id),
                    gte(pharmacyStock.expiryDate, today) // Only non-expired batches
                )
            )
            .orderBy(pharmacyStock.expiryDate); // Sort by expiry date (earliest first)

        // Format the response
        const formattedData = {
            id: medicine.id,
            name: medicine.name,
            companyName: company?.name || "N/A",
            categoryName: category?.name || "N/A",
            groupName: group?.name || "N/A",
            unitName: unit?.name || "N/A",
            batches: batches.map((stock) => ({
                id: stock.id,
                batchNumber: stock.batchNumber,
                quantity: stock.quantity,
                lowStockAlert: stock.lowStockAlert,
                costPrice: stock.costPrice,
                mrp: stock.mrp,
                sellingPrice: stock.sellingPrice,
                expiryDate: stock.expiryDate,
                isDeleted: stock.isDeleted || false,
            }))
        };

        return { data: formattedData };
    } catch (error) {
        console.error("Error fetching medicine with batches:", error);
        return { error: "Failed to fetch medicine details" };
    }
}



