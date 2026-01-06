"use server";

import { db } from "@/db/index";
import { operationCategories, operations } from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

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

export async function createOperationCategory(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!formData.name || formData.name.trim() === "") {
            return { error: "Category name is required" };
        }

        const newCategory = await db
            .insert(operationCategories)
            .values({
                hospitalId: org.id,
                name: formData.name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/operations");
        return { data: newCategory[0] };
    } catch (error) {
        console.error("Error creating operation category:", error);
        return { error: "Failed to create operation category" };
    }
}

export async function updateOperationCategory(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        if (!formData.name || formData.name.trim() === "") {
            return { error: "Category name is required" };
        }

        const updatedCategory = await db
            .update(operationCategories)
            .set({ name: formData.name.trim() })
            .where(
                and(
                    eq(operationCategories.id, id),
                    eq(operationCategories.hospitalId, org.id)
                )
            )
            .returning();

        if (updatedCategory.length === 0) {
            return { error: "Category not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: updatedCategory[0] };
    } catch (error) {
        console.error("Error updating operation category:", error);
        return { error: "Failed to update operation category" };
    }
}

export async function deleteOperationCategory(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const deletedCategory = await db
            .update(operationCategories)
            .set({ isDeleted: true })
            .where(
                and(
                    eq(operationCategories.id, id),
                    eq(operationCategories.hospitalId, org.id)
                )
            )
            .returning();

        if (deletedCategory.length === 0) {
            return { error: "Category not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: deletedCategory[0] };
    } catch (error) {
        console.error("Error deleting operation category:", error);
        return { error: "Failed to delete operation category" };
    }
}

export async function restoreOperationCategory(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const restoredCategory = await db
            .update(operationCategories)
            .set({ isDeleted: false })
            .where(
                and(
                    eq(operationCategories.id, id),
                    eq(operationCategories.hospitalId, org.id)
                )
            )
            .returning();

        if (restoredCategory.length === 0) {
            return { error: "Category not found" };
        }

        revalidatePath("/doctor/settings/operations");
        return { data: restoredCategory[0] };
    } catch (error) {
        console.error("Error restoring operation category:", error);
        return { error: "Failed to restore operation category" };
    }
}


export async function getOperationCategoriesWithCounts(showDeleted = false) {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const whereCondition = showDeleted
    ? eq(operationCategories.hospitalId, org.id)
    : and(
        eq(operationCategories.hospitalId, org.id),
        eq(operationCategories.isDeleted, false)
      );

  const result = await db
    .select({
      id: operationCategories.id,
      name: operationCategories.name,
      hospitalId: operationCategories.hospitalId,
      isDeleted: operationCategories.isDeleted,
      createdAt: operationCategories.createdAt,
      operationCount: sql<number>`count(${operations.id})`,
    })
    .from(operationCategories)
    .leftJoin(
      operations,
      and(
        eq(operations.operationCategoryId, operationCategories.id),
        eq(operations.isDeleted, false)
      )
    )
    .where(whereCondition)
    .groupBy(operationCategories.id)
    .orderBy(desc(operationCategories.createdAt));

  return { data: result };
}
