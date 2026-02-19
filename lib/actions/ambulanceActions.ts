"use server";

import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import {
    getAmbulancesByHospital,
    createAmbulance as dbCreateAmbulance,
    updateAmbulance as dbUpdateAmbulance,
    getAmbulanceBookingsByHospital,
    createAmbulanceBooking,
    updateAmbulanceBooking,
    deleteAmbulanceBooking as dbDeleteAmbulanceBooking,
    getAmbulanceBookingById,
} from "@/db/queries";
import { NewAmbulance, NewAmbulanceBooking } from "@/db/types";

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

export async function getAmbulanceBookings() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await getAmbulanceBookingsByHospital(org.id);
        return { data, org: { name: org.name, metadata: org.metadata } };
    } catch (error) {
        console.error("Error fetching ambulance bookings:", error);
        return { error: "Failed to fetch ambulance bookings" };
    }
}

export async function saveAmbulanceBooking(data: Partial<NewAmbulanceBooking> & { id?: string }) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { id, ...bookingData } = data;

        // Ensure referenceNo is empty if paidAmount is zero
        if (Number(bookingData.paidAmount) === 0) {
            bookingData.referenceNo = "";
        }

        if (id) {
            // Update
            const updated = await updateAmbulanceBooking(id, {
                ...bookingData as any,
                hospitalId: org.id,
            });
            revalidatePath("/doctor/ambulance");
            return { data: updated };
        } else {
            // Create
            const created = await createAmbulanceBooking({
                ...bookingData as any,
                hospitalId: org.id,
            });
            revalidatePath("/doctor/ambulance");
            return { data: created };
        }
    } catch (error) {
        console.error("Error saving ambulance booking:", error);
        return { error: "Failed to save ambulance booking" };
    }
}

export async function deleteAmbulanceBooking(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deleted = await dbDeleteAmbulanceBooking(id);
        revalidatePath("/doctor/ambulance");
        return { data: deleted };
    } catch (error) {
        console.error("Error deleting ambulance booking:", error);
        return { error: "Failed to delete ambulance booking" };
    }
}

export async function getBookingById(id: string) {
    try {
        const data = await getAmbulanceBookingById(id);
        return { data };
    } catch (error) {
        console.error("Error fetching booking:", error);
        return { error: "Failed to fetch booking" };
    }
}

