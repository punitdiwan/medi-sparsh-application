"use server";

import { getAppointmentByIdWithDetails } from "@/db/queries";

export async function getAppointmentDetails(appointmentId: string) {
    try {
        const data = await getAppointmentByIdWithDetails(appointmentId);
        return { success: true, data };
    } catch (error) {
        console.error("Error fetching appointment details:", error);
        return { success: false, error: "Failed to fetch appointment details" };
    }
}
