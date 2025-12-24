"use server";

import { db } from "@/db/index";
import { operations, operationCategories } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getOperations() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const ops = await db
            .select()
            .from(operations)
            .where(
                and(
                    eq(operations.hospitalId, org.id),
                    eq(operations.isDeleted, false)
                )
            )
            .orderBy(desc(operations.createdAt));

        return { data: ops };
    } catch (error) {
        console.error("Error fetching operations:", error);
        return { error: "Failed to fetch operations" };
    }
}

export async function getAllOperations() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const ops = await db
            .select()
            .from(operations)
            .where(eq(operations.hospitalId, org.id))
            .orderBy(desc(operations.createdAt));

        return { data: ops };
    } catch (error) {
        console.error("Error fetching all operations:", error);
        return { error: "Failed to fetch operations" };
    }
}

export async function getOperationCategories() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const categories = await db
            .select()
            .from(operationCategories)
            .where(
                and(
                    eq(operationCategories.hospitalId, org.id),
                    eq(operationCategories.isDeleted, false)
                )
            )
            .orderBy(desc(operationCategories.createdAt));

        return { data: categories };
    } catch (error) {
        console.error("Error fetching operation categories:", error);
        return { error: "Failed to fetch operation categories" };
    }
}

export async function createOperation(formData: {
    name: string;
    operationCategoryId: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!formData.name || formData.name.trim() === "") {
            return { error: "Operation name is required" };
        }

        if (!formData.operationCategoryId) {
            return { error: "Category is required" };
        }

        const newOperation = await db
            .insert(operations)
            .values({
                hospitalId: org.id,
                name: formData.name.trim(),
                operationCategoryId: formData.operationCategoryId,
            })
            .returning();

        revalidatePath("/doctor/settings/operations");
        return { data: newOperation[0] };
    } catch (error) {
        console.error("Error creating operation:", error);
        return { error: "Failed to create operation" };
    }
}

export async function updateOperation(
    id: string,
    formData: {
        name: string;
        operationCategoryId: string;
    }
) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!formData.name || formData.name.trim() === "") {
            return { error: "Operation name is required" };
        }

        if (!formData.operationCategoryId) {
            return { error: "Category is required" };
        }

        const updatedOperation = await db
            .update(operations)
            .set({
                name: formData.name.trim(),
                operationCategoryId: formData.operationCategoryId,
            })
            .where(
                and(
                    eq(operations.id, id),
                    eq(operations.hospitalId, org.id)
                )
            )
            .returning();

        if (updatedOperation.length === 0) {
            return { error: "Operation not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: updatedOperation[0] };
    } catch (error) {
        console.error("Error updating operation:", error);
        return { error: "Failed to update operation" };
    }
}

export async function deleteOperation(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedOperation = await db
            .update(operations)
            .set({ isDeleted: true })
            .where(
                and(
                    eq(operations.id, id),
                    eq(operations.hospitalId, org.id)
                )
            )
            .returning();

        if (deletedOperation.length === 0) {
            return { error: "Operation not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: deletedOperation[0] };
    } catch (error) {
        console.error("Error deleting operation:", error);
        return { error: "Failed to delete operation" };
    }
}

export async function restoreOperation(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const restoredOperation = await db
            .update(operations)
            .set({ isDeleted: false })
            .where(
                and(
                    eq(operations.id, id),
                    eq(operations.hospitalId, org.id)
                )
            )
            .returning();

        if (restoredOperation.length === 0) {
            return { error: "Operation not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: restoredOperation[0] };
    } catch (error) {
        console.error("Error restoring operation:", error);
        return { error: "Failed to restore operation" };
    }
}

export async function getOperationCountByCategory(categoryId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const result = await db
            .select()
            .from(operations)
            .where(
                and(
                    eq(operations.hospitalId, org.id),
                    eq(operations.operationCategoryId, categoryId),
                    eq(operations.isDeleted, false)
                )
            );

        return { data: result.length };
    } catch (error) {
        console.error("Error counting operations for category:", error);
        return { error: "Failed to count operations" };
    }
}
