"use server";

import { db } from "@/db/index";
import { symptoms, symptomTypes } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getSymptoms() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        // Fetch symptoms with symptom type name via join
        const data = await db
            .select({
                id: symptoms.id,
                name: symptoms.name,
                description: symptoms.description,
                symptomTypeId: symptoms.symptomTypeId,
                symptomTypeName: symptomTypes.name,
                createdAt: symptoms.createdAt,
            })
            .from(symptoms)
            .leftJoin(symptomTypes, eq(symptoms.symptomTypeId, symptomTypes.id))
            .where(
                and(
                    eq(symptoms.hospitalId, org.id),
                    eq(symptoms.isDeleted, false)
                )
            )
            .orderBy(desc(symptoms.createdAt));

        return { data };
    } catch (error) {
        console.error("Error fetching symptoms:", error);
        return { error: "Failed to fetch symptoms" };
    }
}

export async function createSymptom(formData: {
    name: string;
    description: string;
    symptomTypeId: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, description, symptomTypeId } = formData;

        // Validate required fields
        if (!name || !name.trim()) {
            return { error: "Symptom name is required" };
        }

        if (!description || !description.trim()) {
            return { error: "Description is required" };
        }

        if (!symptomTypeId || !symptomTypeId.trim()) {
            return { error: "Symptom type is required" };
        }

        // Verify symptom type exists and belongs to the organization
        const [symptomType] = await db
            .select()
            .from(symptomTypes)
            .where(
                and(
                    eq(symptomTypes.id, symptomTypeId),
                    eq(symptomTypes.hospitalId, org.id),
                    eq(symptomTypes.isDeleted, false)
                )
            );

        if (!symptomType) {
            return { error: "Invalid symptom type selected" };
        }

        const [newSymptom] = await db
            .insert(symptoms)
            .values({
                hospitalId: org.id,
                name: name.trim(),
                description: description.trim(),
                symptomTypeId: symptomTypeId,
            })
            .returning();

        revalidatePath("/doctor/settings/symptom");
        return { data: newSymptom };
    } catch (error) {
        console.error("Error creating symptom:", error);
        return { error: "Failed to create symptom" };
    }
}

export async function updateSymptom(id: string, formData: {
    name: string;
    description: string;
    symptomTypeId: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const { name, description, symptomTypeId } = formData;

        // Validate required fields
        if (!name || !name.trim()) {
            return { error: "Symptom name is required" };
        }

        if (!description || !description.trim()) {
            return { error: "Description is required" };
        }

        if (!symptomTypeId || !symptomTypeId.trim()) {
            return { error: "Symptom type is required" };
        }

        // Verify symptom type exists and belongs to the organization
        const [symptomType] = await db
            .select()
            .from(symptomTypes)
            .where(
                and(
                    eq(symptomTypes.id, symptomTypeId),
                    eq(symptomTypes.hospitalId, org.id),
                    eq(symptomTypes.isDeleted, false)
                )
            );

        if (!symptomType) {
            return { error: "Invalid symptom type selected" };
        }

        const [updatedSymptom] = await db
            .update(symptoms)
            .set({
                name: name.trim(),
                description: description.trim(),
                symptomTypeId: symptomTypeId,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(symptoms.id, id),
                    eq(symptoms.hospitalId, org.id)
                )
            )
            .returning();

        if (!updatedSymptom) {
            return { error: "Symptom not found" };
        }

        revalidatePath("/doctor/settings/symptom");
        return { data: updatedSymptom };
    } catch (error) {
        console.error("Error updating symptom:", error);
        return { error: "Failed to update symptom" };
    }
}

export async function deleteSymptom(id: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized" };
        }

        const [deletedSymptom] = await db
            .update(symptoms)
            .set({
                isDeleted: true,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(symptoms.id, id),
                    eq(symptoms.hospitalId, org.id)
                )
            )
            .returning();

        if (!deletedSymptom) {
            return { error: "Symptom not found" };
        }

        revalidatePath("/doctor/settings/symptom");
        return { data: deletedSymptom };
    } catch (error) {
        console.error("Error deleting symptom:", error);
        return { error: "Failed to delete symptom" };
    }
}
