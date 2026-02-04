"use server";

import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getAmbulancesByHospital,
    getDeletedAmbulancesByHospital,
    createAmbulance as dbCreateAmbulance,
    updateAmbulance as dbUpdateAmbulance,
    deleteAmbulance as dbDeleteAmbulance,
    restoreAmbulance as dbRestoreAmbulance,
} from "@/db/queries";
import { NewAmbulance } from "@/db/types";

export async function getAmbulances(showDeleted = false) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = showDeleted
            ? await getDeletedAmbulancesByHospital(org.id)
            : await getAmbulancesByHospital(org.id);

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

export async function deleteAmbulance(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deleted = await dbDeleteAmbulance(id);
        revalidatePath("/doctor/ambulance/ambulanceManagement");
        return { data: deleted };
    } catch (error) {
        console.error("Error deleting ambulance:", error);
        return { error: "Failed to delete ambulance" };
    }
}

export async function restoreAmbulance(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const restored = await dbRestoreAmbulance(id);
        revalidatePath("/doctor/ambulance/ambulanceManagement");
        return { data: restored };
    } catch (error) {
        console.error("Error restoring ambulance:", error);
        return { error: "Failed to restore ambulance" };
    }
}
