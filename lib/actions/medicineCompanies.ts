"use server";

import { db } from "@/db/index";
import { medicineCompanies } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getMedicineCompanies() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: medicineCompanies.id,
                name: medicineCompanies.name,
                createdAt: medicineCompanies.createdAt,
            })
            .from(medicineCompanies)
            .where(eq(medicineCompanies.hospitalId, org.id))
            .orderBy(desc(medicineCompanies.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching medicine companies:", error);
        return { error: "Failed to fetch medicine companies" };
    }
}

export async function createMedicineCompany(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Company name is required" };
        }

        const [newCompany] = await db
            .insert(medicineCompanies)
            .values({
                hospitalId: org.id,
                name: name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/medicineRecord/medicineCompany");
        return { data: newCompany };
    } catch (error) {
        console.error("Error creating medicine company:", error);
        return { error: "Failed to create medicine company" };
    }
}

export async function updateMedicineCompany(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Company name is required" };
        }

        const [updatedCompany] = await db
            .update(medicineCompanies)
            .set({
                name: name.trim(),
                updatedAt: new Date(),
            })
            .where(and(eq(medicineCompanies.id, id), eq(medicineCompanies.hospitalId, org.id)))
            .returning();

        if (!updatedCompany) {
            return { error: "Medicine company not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineCompany");
        return { data: updatedCompany };
    } catch (error) {
        console.error("Error updating medicine company:", error);
        return { error: "Failed to update medicine company" };
    }
}

export async function deleteMedicineCompany(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [deletedCompany] = await db
            .delete(medicineCompanies)
            .where(and(eq(medicineCompanies.id, id), eq(medicineCompanies.hospitalId, org.id)))
            .returning();

        if (!deletedCompany) {
            return { error: "Medicine company not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineCompany");
        return { data: deletedCompany };
    } catch (error) {
        console.error("Error deleting medicine company:", error);
        return { error: "Failed to delete medicine company" };
    }
}
