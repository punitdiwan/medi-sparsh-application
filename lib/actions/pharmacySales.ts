"use server";

import { db } from "@/db";
import { pharmacySales, pharmacySalesItems, pharmacyMedicines, pharmacyStock } from "@/drizzle/schema";
import { getActiveOrganization } from "../getActiveOrganization";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
