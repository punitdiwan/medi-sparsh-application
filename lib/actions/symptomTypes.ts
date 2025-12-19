"use server";

import { db } from "@/db/index";
import { symptomTypes, symptoms } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getSymptomTypes() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const data = await db
            .select({
                id: symptomTypes.id,
                name: symptomTypes.name,
                createdAt: symptomTypes.createdAt,
            })
            .from(symptomTypes)
            .where(
                and(
                    eq(symptomTypes.hospitalId, org.id),
                    eq(symptomTypes.isDeleted, false)
                )
            )
            .orderBy(desc(symptomTypes.createdAt));

        // Check usage for each symptom type
        const dataWithUsage = await Promise.all(
            data.map(async (type) => {
                const usageCount = await db
                    .select({ count: symptoms.id })
                    .from(symptoms)
                    .where(
                        and(
                            eq(symptoms.symptomTypeId, type.id),
                            eq(symptoms.isDeleted, false)
                        )
                    );

                return {
                    ...type,
                    usageCount: usageCount.length,
                    isUsed: usageCount.length > 0,
                };
            })
        );

        return { data: dataWithUsage };
    } catch (error) {
        console.error("Error fetching symptom types:", error);
        return { error: "Failed to fetch symptom types" };
    }
}

export async function createSymptomType(formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Symptom type name is required" };
        }

        const [newSymptomType] = await db
            .insert(symptomTypes)
            .values({
                hospitalId: org.id,
                name: name.trim(),
            })
            .returning();

        revalidatePath("/doctor/settings/symptom");
        return { data: newSymptomType };
    } catch (error) {
        console.error("Error creating symptom type:", error);
        return { error: "Failed to create symptom type" };
    }
}

export async function updateSymptomType(id: string, formData: {
    name: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name } = formData;

        if (!name || !name.trim()) {
            return { error: "Symptom type name is required" };
        }

        const [updatedSymptomType] = await db
            .update(symptomTypes)
            .set({
                name: name.trim(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(symptomTypes.id, id),
                    eq(symptomTypes.hospitalId, org.id)
                )
            )
            .returning();

        if (!updatedSymptomType) {
            return { error: "Symptom type not found" };
        }

        revalidatePath("/doctor/settings/symptom");
        return { data: updatedSymptomType };
    } catch (error) {
        console.error("Error updating symptom type:", error);
        return { error: "Failed to update symptom type" };
    }
}

export async function checkSymptomTypeUsage(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const usedSymptoms = await db
            .select({ id: symptoms.id })
            .from(symptoms)
            .where(
                and(
                    eq(symptoms.symptomTypeId, id),
                    eq(symptoms.hospitalId, org.id),
                    eq(symptoms.isDeleted, false)
                )
            );

        return {
            isUsed: usedSymptoms.length > 0,
            count: usedSymptoms.length
        };
    } catch (error) {
        console.error("Error checking symptom type usage:", error);
        return { error: "Failed to check usage" };
    }
}

export async function deleteSymptomType(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Check if the symptom type is used by any symptoms
        const usageCheck = await checkSymptomTypeUsage(id);
        if (usageCheck.error) {
            return { error: usageCheck.error };
        }

        if (usageCheck.isUsed) {
            return {
                error: `Cannot delete this symptom type. It is currently used by ${usageCheck.count} symptom(s).`
            };
        }

        const [deletedSymptomType] = await db
            .update(symptomTypes)
            .set({
                isDeleted: true,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(symptomTypes.id, id),
                    eq(symptomTypes.hospitalId, org.id)
                )
            )
            .returning();

        if (!deletedSymptomType) {
            return { error: "Symptom type not found" };
        }

        revalidatePath("/doctor/settings/symptom");
        return { data: deletedSymptomType };
    } catch (error) {
        console.error("Error deleting symptom type:", error);
        return { error: "Failed to delete symptom type" };
    }
}
