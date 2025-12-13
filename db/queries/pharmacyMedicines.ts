import { db } from "../index";
import {
    pharmacyMedicines,
    medicineCategories,
    medicineCompanies,
    medicineGroups,
    medicineUnits,
    medicineSuppliers,
    pharmacyStock,
} from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Types
export type NewPharmacyMedicine = typeof pharmacyMedicines.$inferInsert;

// ============================================
// Pharmacy Medicine Queries
// ============================================

export async function getPharmacyMedicinesByHospital(hospitalId: string) {
    const stockSq = db
        .select({
            medicineId: pharmacyStock.medicineId,
            totalQuantity: sql<number>`sum(${pharmacyStock.quantity})`.as("total_quantity"),
        })
        .from(pharmacyStock)
        .where(eq(pharmacyStock.hospitalId, hospitalId))
        .groupBy(pharmacyStock.medicineId)
        .as("stock_sq");

    return await db
        .select({
            id: pharmacyMedicines.id,
            name: pharmacyMedicines.name,
            categoryId: pharmacyMedicines.categoryId,
            categoryName: medicineCategories.name,
            companyId: pharmacyMedicines.companyId,
            companyName: medicineCompanies.name,
            groupId: pharmacyMedicines.groupId,
            groupName: medicineGroups.name,
            unitId: pharmacyMedicines.unitId,
            unitName: medicineUnits.name,
            quantity: sql<number>`coalesce(${stockSq.totalQuantity}, 0)`,
            hospitalId: pharmacyMedicines.hospitalId,
            createdAt: pharmacyMedicines.createdAt,
            updatedAt: pharmacyMedicines.updatedAt,
        })
        .from(pharmacyMedicines)
        .leftJoin(medicineCategories, eq(pharmacyMedicines.categoryId, medicineCategories.id))
        .leftJoin(medicineCompanies, eq(pharmacyMedicines.companyId, medicineCompanies.id))
        .leftJoin(medicineGroups, eq(pharmacyMedicines.groupId, medicineGroups.id))
        .leftJoin(medicineUnits, eq(pharmacyMedicines.unitId, medicineUnits.id))
        .leftJoin(stockSq, eq(pharmacyMedicines.id, stockSq.medicineId))
        .where(eq(pharmacyMedicines.hospitalId, hospitalId))
        .orderBy(desc(pharmacyMedicines.createdAt));
}

export async function createPharmacyMedicine(data: NewPharmacyMedicine) {
    const result = await db.insert(pharmacyMedicines).values(data).returning();
    return result[0];
}

export async function updatePharmacyMedicine(id: string, data: Partial<NewPharmacyMedicine>) {
    const result = await db
        .update(pharmacyMedicines)
        .set({ ...data, updatedAt: sql`now()` })
        .where(eq(pharmacyMedicines.id, id))
        .returning();
    return result[0];
}

export async function deletePharmacyMedicine(id: string) {
    const result = await db
        .delete(pharmacyMedicines)
        .where(eq(pharmacyMedicines.id, id))
        .returning();
    return result[0];
}

// ============================================
// Dropdown Data Queries
// ============================================

export async function getMedicineCategories(hospitalId: string) {
    return await db
        .select({ id: medicineCategories.id, name: medicineCategories.name })
        .from(medicineCategories)
        .where(eq(medicineCategories.hospitalId, hospitalId))
        .orderBy(medicineCategories.name);
}

export async function getMedicineCompanies(hospitalId: string) {
    return await db
        .select({ id: medicineCompanies.id, name: medicineCompanies.name })
        .from(medicineCompanies)
        .where(eq(medicineCompanies.hospitalId, hospitalId))
        .orderBy(medicineCompanies.name);
}

export async function getMedicineGroups(hospitalId: string) {
    return await db
        .select({ id: medicineGroups.id, name: medicineGroups.name })
        .from(medicineGroups)
        .where(eq(medicineGroups.hospitalId, hospitalId))
        .orderBy(medicineGroups.name);
}

export async function getMedicineUnits(hospitalId: string) {
    return await db
        .select({ id: medicineUnits.id, name: medicineUnits.name })
        .from(medicineUnits)
        .where(eq(medicineUnits.hospitalId, hospitalId))
        .orderBy(medicineUnits.name);
}

export async function getMedicineSuppliers(hospitalId: string) {
    return await db
        .select({ id: medicineSuppliers.id, name: medicineSuppliers.supplierName })
        .from(medicineSuppliers)
        .where(eq(medicineSuppliers.hospitalId, hospitalId))
        .orderBy(medicineSuppliers.supplierName);
}

export async function getPharmacyMedicinesByCategory(hospitalId: string, categoryId: string) {
    return await db
        .select({ id: pharmacyMedicines.id, name: pharmacyMedicines.name })
        .from(pharmacyMedicines)
        .where(
            and(
                eq(pharmacyMedicines.hospitalId, hospitalId),
                eq(pharmacyMedicines.categoryId, categoryId)
            )
        )
        .orderBy(pharmacyMedicines.name);
}

export async function getPharmacyStockByMedicineId(hospitalId: string, medicineId: string) {
    return await db
        .select({
            id: pharmacyStock.id,
            batchNumber: pharmacyStock.batchNumber,
            expiryDate: pharmacyStock.expiryDate,
            quantity: pharmacyStock.quantity,
            sellingPrice: pharmacyStock.sellingPrice,
            mrp: pharmacyStock.mrp,
        })
        .from(pharmacyStock)
        .where(
            and(
                eq(pharmacyStock.hospitalId, hospitalId),
                eq(pharmacyStock.medicineId, medicineId),
                sql`${pharmacyStock.quantity} > 0`
            )
        )
        .orderBy(pharmacyStock.expiryDate);
}
