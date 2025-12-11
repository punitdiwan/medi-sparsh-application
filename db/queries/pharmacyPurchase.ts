import { db } from "../index";
import {
    pharmacyPurchase,
    medicineSuppliers,
    pharmacyPurchaseItem,
    pharmacyMedicines,
} from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

export async function getPharmacyPurchasesByHospital(hospitalId: string) {
    return await db
        .select({
            id: pharmacyPurchase.id,
            billNumber: pharmacyPurchase.billNumber,
            supplierId: pharmacyPurchase.supplierId,
            supplierName: medicineSuppliers.supplierName,
            purchaseDate: pharmacyPurchase.purchaseDate,
            totalAmount: pharmacyPurchase.purchaseAmount,
            status: pharmacyPurchase.purchaseAmount, // Placeholder, maybe add status later
        })
        .from(pharmacyPurchase)
        .leftJoin(medicineSuppliers, eq(pharmacyPurchase.supplierId, medicineSuppliers.id))
        .where(eq(pharmacyPurchase.hospitalId, hospitalId))
        .orderBy(desc(pharmacyPurchase.purchaseDate));
}

export async function getPharmacyPurchaseDetailsById(purchaseId: string) {
    const purchase = await db
        .select({
            id: pharmacyPurchase.id,
            billNumber: pharmacyPurchase.billNumber,
            supplierName: medicineSuppliers.supplierName,
            purchaseDate: pharmacyPurchase.purchaseDate,
            totalAmount: pharmacyPurchase.purchaseAmount,
            discount: pharmacyPurchase.discount,
            gstPercent: pharmacyPurchase.gstPercent,
        })
        .from(pharmacyPurchase)
        .leftJoin(medicineSuppliers, eq(pharmacyPurchase.supplierId, medicineSuppliers.id))
        .where(eq(pharmacyPurchase.id, purchaseId))
        .limit(1);

    if (purchase.length === 0) return null;

    const items = await db
        .select({
            id: pharmacyPurchaseItem.id,
            medicineName: pharmacyMedicines.name,
            batchNumber: pharmacyPurchaseItem.batchNumber,
            expiryDate: pharmacyPurchaseItem.expiryDate,
            quantity: pharmacyPurchaseItem.quantity,
            mrp: pharmacyPurchaseItem.mrp,
            purchasePrice: pharmacyPurchaseItem.costPrice,
            amount: pharmacyPurchaseItem.amount,
        })
        .from(pharmacyPurchaseItem)
        .leftJoin(pharmacyMedicines, eq(pharmacyPurchaseItem.medicineId, pharmacyMedicines.id))
        .where(eq(pharmacyPurchaseItem.purchaseId, purchaseId));

    return { ...purchase[0], items };
}
