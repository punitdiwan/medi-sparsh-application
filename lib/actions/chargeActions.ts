"use server";

import { getActiveOrganization } from "../getActiveOrganization";
import { getChargeCategoriesByHospital, getChargesByHospital } from "@/db/queries";

export async function getChargeCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) return { error: "Unauthorized" };

        const data = await getChargeCategoriesByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching charge categories:", error);
        return { error: "Failed to fetch charge categories" };
    }
}

export async function getCharges() {
    try {
        const org = await getActiveOrganization();
        if (!org) return { error: "Unauthorized" };

        const data = await getChargesByHospital(org.id);
        return { data };
    } catch (error) {
        console.error("Error fetching charges:", error);
        return { error: "Failed to fetch charges" };
    }
}
