"use server";

import { db } from "@/db/index";
import { operations, operationCategories, ipdOperations } from "@/drizzle/schema";

// ... existing code ...

export async function createIPDOperation(data: {
    ipdAdmissionId: string;
    operationId: string;
    operationDate: Date;
    operationTime: Date;
    doctors: any;
    anaesthetist: any;
    anaesthetiaType: string;
    operationDetails: string;
    supportStaff: any;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const newOp = await db
            .insert(ipdOperations)
            .values({
                hospitalId: org.id,
                ...data,
            })
            .returning();

        revalidatePath(`/doctor/IPD/ipdDetails/${data.ipdAdmissionId}/ipd/operation`);
        return { data: newOp[0] };
    } catch (error) {
        console.error("Error creating IPD operation:", error);
        return { error: "Failed to create IPD operation" };
    }
}

export async function getIPDOperations(ipdAdmissionId: string, showDeleted: boolean = false) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const whereConditions = [
            eq(ipdOperations.hospitalId, org.id),
            eq(ipdOperations.ipdAdmissionId, ipdAdmissionId),
            eq(ipdOperations.isDeleted, showDeleted),
        ];

        const ops = await db
            .select({
                id: ipdOperations.id,
                operationId: ipdOperations.operationId,
                operationName: operations.name,
                categoryName: operationCategories.name,
                operationDate: ipdOperations.operationDate,
                operationTime: ipdOperations.operationTime,
                doctors: ipdOperations.doctors,
                anaesthetist: ipdOperations.anaesthetist,
                anaesthetiaType: ipdOperations.anaesthetiaType,
                operationDetails: ipdOperations.operationDetails,
                supportStaff: ipdOperations.supportStaff,
                categoryId: operations.operationCategoryId,
                isDeleted: ipdOperations.isDeleted,
            })
            .from(ipdOperations)
            .innerJoin(operations, eq(ipdOperations.operationId, operations.id))
            .innerJoin(operationCategories, eq(operations.operationCategoryId, operationCategories.id))
            .where(and(...whereConditions))
            .orderBy(desc(ipdOperations.createdAt));

        return { data: ops };
    } catch (error) {
        console.error("Error fetching IPD operations:", error);
        return { error: "Failed to fetch IPD operations" };
    }
}
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
export async function getOperationsByCategory(categoryId: string) {
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
                    eq(operations.operationCategoryId, categoryId),
                    eq(operations.isDeleted, false)
                )
            )
            .orderBy(desc(operations.createdAt));

        return { data: ops };
    } catch (error) {
        console.error("Error fetching operations by category:", error);
        return { error: "Failed to fetch operations" };
    }
}

export async function updateIPDOperation(id: string, data: {
    operationId: string;
    operationDate: Date;
    operationTime: Date;
    doctors: any;
    anaesthetist: any;
    anaesthetiaType: string;
    operationDetails: string;
    supportStaff: any;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const updatedOp = await db
            .update(ipdOperations)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(ipdOperations.id, id),
                    eq(ipdOperations.hospitalId, org.id)
                )
            )
            .returning();

        // Fetch the ipdAdmissionId to revalidate the correct path
        const op = updatedOp[0];
        if (op) {
            revalidatePath(`/doctor/IPD/ipdDetails/${op.ipdAdmissionId}/ipd/operation`);
        }

        return { data: updatedOp[0] };
    } catch (error) {
        console.error("Error updating IPD operation:", error);
        return { error: "Failed to update IPD operation" };
    }
}

export async function deleteIPDOperation(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db
            .update(ipdOperations)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(
                and(
                    eq(ipdOperations.id, id),
                    eq(ipdOperations.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/operation`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD operation:", error);
        return { error: "Failed to delete IPD operation" };
    }
}

export async function restoreIPDOperation(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db
            .update(ipdOperations)
            .set({ isDeleted: false, updatedAt: new Date() })
            .where(
                and(
                    eq(ipdOperations.id, id),
                    eq(ipdOperations.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/operation`);
        return { success: true };
    } catch (error) {
        console.error("Error restoring IPD operation:", error);
        return { error: "Failed to restore IPD operation" };
    }
}

export async function permanentlyDeleteIPDOperation(id: string, ipdAdmissionId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        await db
            .delete(ipdOperations)
            .where(
                and(
                    eq(ipdOperations.id, id),
                    eq(ipdOperations.hospitalId, org.id)
                )
            );

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/operation`);
        return { success: true };
    } catch (error) {
        console.error("Error permanently deleting IPD operation:", error);
        return { error: "Failed to permanently delete IPD operation" };
    }
}
