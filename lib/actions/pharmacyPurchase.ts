"use server";

import {
    getMedicineSuppliers,
    getMedicineCategories,
    getPharmacyMedicinesByCategory,
} from "@/db/queries/pharmacyMedicines";
import { getPharmacyPurchasesByHospital, getPharmacyPurchaseDetailsById } from "@/db/queries/pharmacyPurchase";
import { getActiveOrganization } from "../getActiveOrganization";
import { db } from "@/db";
import { pharmacyPurchase, pharmacyPurchaseItem, pharmacyMedicines, pharmacyStock } from "@/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

export async function getSuppliers() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getMedicineSuppliers(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return { error: "Failed to fetch suppliers" };
    }
}

export async function getCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getMedicineCategories(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Failed to fetch categories" };
    }
}

export async function getMedicinesByCategory(categoryId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacyMedicinesByCategory(org.id, categoryId);
        return { data };
    } catch (error) {
        console.error("Error fetching medicines by category:", error);
        return { error: "Failed to fetch medicines" };
    }
}

export async function createPharmacyPurchase(data: {
    supplierId: string;
    billNo: string;
    items: {
        medicineId: string;
        batchNo: string;
        expiry: string;
        mrp: number;
        quantity: number;
        purchasePrice: number;
        salePrice: number;
        amount: number;
    }[];
    summary: {
        totalAmount: number;
        discountPercent: number;
        taxPercent: number;
        netAmount: number;
    };
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { supplierId, billNo, items, summary } = data;

        await db.transaction(async (tx) => {
            // 1. Create Purchase Record
            const [purchase] = await tx
                .insert(pharmacyPurchase)
                .values({
                    hospitalId: org.id,
                    supplierId,
                    billNumber: billNo,
                    discount: summary.discountPercent.toString(),
                    gstPercent: summary.taxPercent.toString(),
                    purchaseAmount: summary.netAmount.toString(),
                    purchaseDate: new Date(),
                })
                .returning();

            // 2. Create Purchase Items
            if (items.length > 0) {
                await tx.insert(pharmacyPurchaseItem).values(
                    items.map((item) => ({
                        hospitalId: org.id,
                        purchaseId: purchase.id,
                        medicineId: item.medicineId,
                        batchNumber: item.batchNo,
                        quantity: item.quantity.toString(),
                        costPrice: item.purchasePrice.toString(),
                        sellingPrice: item.salePrice.toString(),
                        mrp: item.mrp.toString(),
                        amount: item.amount.toString(),
                        expiryDate: item.expiry, // Assuming YYYY-MM-DD string from input
                    }))
                );

                // 3. Update Pharmacy Stock
                for (const item of items) {
                    // Check if stock exists for this medicine and batch
                    const existingStock = await tx
                        .select()
                        .from(pharmacyStock)
                        .where(
                            and(
                                eq(pharmacyStock.hospitalId, org.id),
                                eq(pharmacyStock.medicineId, item.medicineId),
                                eq(pharmacyStock.batchNumber, item.batchNo)
                            )
                        )
                        .limit(1);

                    if (existingStock.length > 0) {
                        // Update existing stock
                        await tx
                            .update(pharmacyStock)
                            .set({
                                quantity: sql`${pharmacyStock.quantity} + ${item.quantity}`,
                                costPrice: item.purchasePrice.toString(),
                                sellingPrice: item.salePrice.toString(),
                                mrp: item.mrp.toString(),
                                expiryDate: item.expiry,
                                updatedAt: new Date(),
                            })
                            .where(eq(pharmacyStock.id, existingStock[0].id));
                    } else {
                        // Insert new stock
                        await tx.insert(pharmacyStock).values({
                            hospitalId: org.id,
                            medicineId: item.medicineId,
                            batchNumber: item.batchNo,
                            quantity: item.quantity.toString(),
                            costPrice: item.purchasePrice.toString(),
                            sellingPrice: item.salePrice.toString(),
                            mrp: item.mrp.toString(),
                            expiryDate: item.expiry,
                        });
                    }
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating purchase:", error);
        return { error: "Failed to create purchase" };
    }
}

export async function getPurchases() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacyPurchasesByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching purchases:", error);
        return { error: "Failed to fetch purchases" };
    }
}

export async function getPurchaseDetails(purchaseId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacyPurchaseDetailsById(purchaseId);
        return { data };
    } catch (error) {
        console.error("Error fetching purchase details:", error);
        return { error: "Failed to fetch purchase details" };
    }
}
