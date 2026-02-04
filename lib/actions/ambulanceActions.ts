"use server";

import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getAmbulancesByHospital,
    createAmbulance as dbCreateAmbulance,
    updateAmbulance as dbUpdateAmbulance,
} from "@/db/queries";
import { NewAmbulance } from "@/db/types";

export async function getAmbulances(activeOnly = true) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getAmbulancesByHospital(org.id, activeOnly);

        return { data };
    } catch (error) {
        console.error("Error fetching ambulances:", error);
        return { error: "Failed to fetch ambulances" };
    }
}

export async function saveAmbulance(data: Partial<NewAmbulance> & { id?: string }) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { id, ...ambulanceData } = data;

        if (id) {
            // Update
            const updated = await dbUpdateAmbulance(id, {
                ...ambulanceData as any,
                hospitalId: org.id,
            });
            revalidatePath("/doctor/ambulance/ambulanceManagement");
            return { data: updated };
        } else {
            // Create
            const created = await dbCreateAmbulance({
                ...ambulanceData as any,
                hospitalId: org.id,
            });
            revalidatePath("/doctor/ambulance/ambulanceManagement");
            return { data: created };
        }
    } catch (error) {
        console.error("Error saving ambulance:", error);
        return { error: "Failed to save ambulance" };
    }
}

