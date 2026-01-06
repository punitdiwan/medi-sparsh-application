"use server";

import {
    getAllSpecializations,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization
} from "@/db/queries";
import { revalidatePath } from "next/cache";

export async function getSpecializationsAction() {
    try {
        const data = await getAllSpecializations();
        return { data };
    } catch (error) {
        console.error("Error fetching specializations:", error);
        return { error: "Failed to fetch specializations" };
    }
}

export async function createSpecializationAction(formData: {
    name: string;
    description?: string;
}) {
    try {
        if (!formData.name || !formData.name.trim()) {
            return { error: "Specialization name is required" };
        }

        const newSpec = await createSpecialization({
            name: formData.name.trim(),
            description: formData.description?.trim(),
        });

        revalidatePath("/doctor/employees/manageSpecialization");
        return { data: newSpec };
    } catch (error) {
        console.error("Error creating specialization:", error);
        return { error: "Failed to create specialization" };
    }
}

export async function updateSpecializationAction(id: number, formData: {
    name?: string;
    description?: string;
}) {
    try {
        const updatedSpec = await updateSpecialization(id, {
            name: formData.name?.trim(),
            description: formData.description?.trim(),
        });

        if (!updatedSpec) {
            return { error: "Specialization not found" };
        }

        revalidatePath("/doctor/employees/manageSpecialization");
        return { data: updatedSpec };
    } catch (error) {
        console.error("Error updating specialization:", error);
        return { error: "Failed to update specialization" };
    }
}

export async function deleteSpecializationAction(id: number) {
    try {
        const deletedSpec = await deleteSpecialization(id);

        if (!deletedSpec) {
            return { error: "Specialization not found" };
        }

        revalidatePath("/doctor/employees/manageSpecialization");
        return { data: deletedSpec };
    } catch (error) {
        console.error("Error deleting specialization:", error);
        return { error: "Failed to delete specialization" };
    }
}
