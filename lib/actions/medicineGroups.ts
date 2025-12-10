"use server";

import { db } from "@/db/index";
import { medicineGroups, medicines } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getMedicineGroups() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: medicineGroups.id,
                name: medicineGroups.name,
                createdAt: medicineGroups.createdAt,
            })
            .from(medicineGroups)
            .where(eq(medicineGroups.hospitalId, org.id))
            .orderBy(desc(medicineGroups.createdAt));

        // Check usage for each group
        const dataWithUsage = await Promise.all(
            data.map(async (group) => {
                const usageCount = await db
                    .select({ count: medicines.id })
                    .from(medicines)
                    .where(
                        and(
                            eq(medicines.groupId, group.id),
                            eq(medicines.isDeleted, false)
                        )
                    );

                return {
                    ...group,
                    usageCount: usageCount.length,
                    isUsed: usageCount.length > 0,
                };
            })
        );

        return { data: dataWithUsage };
    } catch (error) {
        console.error("Error fetching medicine groups:", error);
        return { error: "Failed to fetch medicine groups" };
    }
}

export async function createMedicineGroup(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Group name is required" };
        }

        const [newGroup] = await db
            .insert(medicineGroups)
            .values({
                hospitalId: org.id,
                name: name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/medicineRecord/medicineGroup");
        return { data: newGroup };
    } catch (error) {
        console.error("Error creating medicine group:", error);
        return { error: "Failed to create medicine group" };
    }
}

export async function updateMedicineGroup(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Group name is required" };
        }

        const [updatedGroup] = await db
            .update(medicineGroups)
            .set({
                name: name.trim(),
                updatedAt: new Date(),
            })
            .where(and(eq(medicineGroups.id, id), eq(medicineGroups.hospitalId, org.id)))
            .returning();

        if (!updatedGroup) {
            return { error: "Medicine group not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineGroup");
        return { data: updatedGroup };
    } catch (error) {
        console.error("Error updating medicine group:", error);
        return { error: "Failed to update medicine group" };
    }
}

export async function checkMedicineGroupUsage(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const usedMedicines = await db
            .select({ id: medicines.id })
            .from(medicines)
            .where(
                and(
                    eq(medicines.groupId, id),
                    eq(medicines.hospitalId, org.id),
                    eq(medicines.isDeleted, false)
                )
            );

        return {
            isUsed: usedMedicines.length > 0,
            count: usedMedicines.length
        };
    } catch (error) {
        console.error("Error checking medicine group usage:", error);
        return { error: "Failed to check usage" };
    }
}

export async function deleteMedicineGroup(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Check if the group is used by any medicines
        const usageCheck = await checkMedicineGroupUsage(id);
        if (usageCheck.error) {
            return { error: usageCheck.error };
        }

        if (usageCheck.isUsed) {
            return {
                error: `Cannot delete this medicine group. It is currently used by ${usageCheck.count} medicine(s).`
            };
        }

        const [deletedGroup] = await db
            .delete(medicineGroups)
            .where(and(eq(medicineGroups.id, id), eq(medicineGroups.hospitalId, org.id)))
            .returning();

        if (!deletedGroup) {
            return { error: "Medicine group not found" };
        }

        revalidatePath("/doctor/settings/medicineRecord/medicineGroup");
        return { data: deletedGroup };
    } catch (error) {
        console.error("Error deleting medicine group:", error);
        return { error: "Failed to delete medicine group" };
    }
}
