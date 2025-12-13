"use server";

import { db } from "@/db";
import { pharmacySales, pharmacySalesItems, pharmacyMedicines, pharmacyStock } from "@/drizzle/schema";
import { getActiveOrganization } from "../getActiveOrganization";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getPharmacySalesByHospital } from "@/db/queries/pharmacySales";

export async function createPharmacySale(data: {
    customerName: string;
    customerPhone: string;
    medicines: {
        id: string;
        batchNumber: string;
        quantity: number;
        sellingPrice: number;
        amount: number;
    }[];
    totalAmount: number;
    discountAmount: number;
    taxAmount: number;
    netAmount: number;
    paymentMode: string;
    note?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db.transaction(async (tx) => {
            // 1. Create Sale Record
            const [sale] = await tx
                .insert(pharmacySales)
                .values({
                    hospitalId: org.id,
                    billNumber: `BILL-${Date.now()}`, // Simple bill number generation
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    totalAmount: data.totalAmount.toString(),
                    discount: data.discountAmount.toString(),
                    taxAmount: data.taxAmount.toString(),
                    netAmount: data.netAmount.toString(),
                    paymentMode: data.paymentMode,
                })
                .returning();

            // 2. Create Sale Items
            if (data.medicines.length > 0) {
                await tx.insert(pharmacySalesItems).values(
                    data.medicines.map((item) => ({
                        hospitalId: org.id,
                        billId: sale.id,
                        medicineId: item.id,
                        batchNumber: item.batchNumber,
                        quantity: item.quantity.toString(),
                        unitPrice: item.sellingPrice.toString(),
                        totalAmount: item.amount.toString(),
                    }))
                );

                // 3. Update Medicine Stock
                for (const item of data.medicines) {
                    // Update pharmacyStock based on medicineId and batchNumber
                    await tx
                        .update(pharmacyStock)
                        .set({
                            quantity: sql`${pharmacyStock.quantity} - ${item.quantity}`,
                            updatedAt: new Date(), // Assuming updatedAt is a string in schema, or use new Date() if it's timestamp
                        })
                        .where(
                            and(
                                eq(pharmacyStock.hospitalId, org.id),
                                eq(pharmacyStock.medicineId, item.id),
                                eq(pharmacyStock.batchNumber, item.batchNumber)
                            )
                        );
                }
            }
        });

        revalidatePath("/doctor/pharmacy/medicine");
        return { success: true };
    } catch (error) {
        console.error("Error creating pharmacy sale:", error);
        return { error: "Failed to create sale" };
    }
}

export async function getPharmacySales() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacySalesByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching pharmacy sales:", error);
        return { error: "Failed to fetch sales" };
    }
}

export async function getPharmacyBillDetails(billId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [bill] = await db
            .select()
            .from(pharmacySales)
            .where(and(eq(pharmacySales.id, billId), eq(pharmacySales.hospitalId, org.id)));

        if (!bill) {
            return { error: "Bill not found" };
        }

        const items = await db
            .select()
            .from(pharmacySalesItems)
            .where(and(eq(pharmacySalesItems.billId, billId), eq(pharmacySalesItems.hospitalId, org.id)));

        // If relation doesn't exist or we need batch details (expiry) from stock/purchase history
        // For now, let's assume we just need what's in sales items + medicine name.
        // But wait, user wants Expiry Date. Sales items don't have expiry date.
        // We need to fetch expiry date from pharmacyStock based on batchNumber and medicineId.

        const itemsWithDetails = await Promise.all(items.map(async (item) => {
            const [stock] = await db
                .select()
                .from(pharmacyStock)
                .where(
                    and(
                        eq(pharmacyStock.hospitalId, org.id),
                        eq(pharmacyStock.medicineId, item.medicineId),
                        eq(pharmacyStock.batchNumber, item.batchNumber || "")
                    )
                );

            // We also need medicine name. If relation 'medicine' works, we have it.
            // Let's check relations.ts or schema.ts for relations.
            // Assuming we might need to fetch medicine manually if relation is not set up in db.query

            const [medicine] = await db
                .select()
                .from(pharmacyMedicines)
                .where(eq(pharmacyMedicines.id, item.medicineId));

            return {
                ...item,
                medicineName: medicine?.name || "Unknown",
                expiryDate: stock?.expiryDate || "N/A",
            };
        }));

        return { data: { bill, items: itemsWithDetails } };
    } catch (error) {
        console.error("Error fetching bill details:", error);
        return { error: "Failed to fetch bill details" };
    }
}
