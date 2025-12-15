"use server";

import { getPharmacyStockByMedicineId } from "@/db/queries/pharmacyMedicines";
import { getActiveOrganization } from "../getActiveOrganization";

export async function getPharmacyStock(medicineId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getPharmacyStockByMedicineId(org.id, medicineId);
        return { data };
    } catch (error) {
        console.error("Error fetching pharmacy stock:", error);
        return { error: "Failed to fetch stock" };
    }
}
