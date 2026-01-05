"use server";

import { db } from "@/db";
import {
    ipdMedications,
    medicines,
    medicineCategories,
    ipdAdmission,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to generate 6-char alphanumeric ID
const generateDoseId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export type Dose = {
    id: string;
    time: string;
    dosage: string;
};

export async function getIPDMedications(ipdAdmissionId: string) {
    try {
        const data = await db
            .select({
                id: ipdMedications.id,
                date: ipdMedications.date,
                medicineId: ipdMedications.medicineId,
                medicineName: medicines.name,
                categoryName: medicineCategories.name,
                dose: ipdMedications.dose,
                note: ipdMedications.note,
            })
            .from(ipdMedications)
            .leftJoin(medicines, eq(ipdMedications.medicineId, medicines.id))
            .leftJoin(
                medicineCategories,
                eq(medicines.categoryId, medicineCategories.id)
            )
            .where(eq(ipdMedications.ipdAdmissionId, ipdAdmissionId))
            .orderBy(desc(ipdMedications.date));

        return { success: true, data };
    } catch (error) {
        console.error("Error fetching IPD medications:", error);
        return { success: false, error: "Failed to fetch medications" };
    }
}

export async function addIPDMedication(data: {
    ipdAdmissionId: string;
    date: string;
    medicineId: string;
    time: string;
    dosage: string;
    note?: string;
}) {
    try {
        const { ipdAdmissionId, date, medicineId, time, dosage, note } = data;

        // Check if a record exists for this date and medicine
        const existingRecords = await db
            .select()
            .from(ipdMedications)
            .where(
                and(
                    eq(ipdMedications.ipdAdmissionId, ipdAdmissionId),
                    eq(ipdMedications.date, date),
                    eq(ipdMedications.medicineId, medicineId)
                )
            )
            .limit(1);

        const existingRecord = existingRecords[0];

        const newDose: Dose = {
            id: generateDoseId(),
            time,
            dosage,
        };

        if (existingRecord) {
            // Append dose
            const currentDoses = (existingRecord.dose as Dose[]) || [];
            const updatedDoses = [...currentDoses, newDose];

            await db
                .update(ipdMedications)
                .set({
                    dose: updatedDoses,
                    note: note || existingRecord.note, // Update note if provided
                })
                .where(eq(ipdMedications.id, existingRecord.id));
        } else {
            // Create new record
            const admissionRecords = await db
                .select({ hospitalId: ipdAdmission.hospitalId })
                .from(ipdAdmission)
                .where(eq(ipdAdmission.id, ipdAdmissionId))
                .limit(1);

            const hospitalId = admissionRecords[0]?.hospitalId;

            if (!hospitalId) {
                return { success: false, error: "Hospital ID not found" };
            }

            await db.insert(ipdMedications).values({
                hospitalId,
                ipdAdmissionId,
                medicineId,
                date,
                dose: [newDose],
                note: note || null,
            });
        }

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/medication`);
        return { success: true };
    } catch (error) {
        console.error("Error adding IPD medication:", error);
        return { success: false, error: "Failed to add medication" };
    }
}

export async function updateIPDMedication(data: {
    rowId: string;
    doseId: string;
    ipdAdmissionId: string;
    date: string;
    medicineId: string;
    time: string;
    dosage: string;
    note?: string;
}) {
    try {
        const {
            rowId,
            doseId,
            ipdAdmissionId,
            date,
            medicineId,
            time,
            dosage,
            note,
        } = data;

        const existingRecords = await db
            .select()
            .from(ipdMedications)
            .where(eq(ipdMedications.id, rowId))
            .limit(1);

        const existingRecord = existingRecords[0];

        if (!existingRecord) {
            return { success: false, error: "Record not found" };
        }

        // Check if date or medicine changed
        const isSameGroup =
            existingRecord.date === date && existingRecord.medicineId === medicineId;

        if (isSameGroup) {
            // Update in place
            const currentDoses = (existingRecord.dose as Dose[]) || [];
            const updatedDoses = currentDoses.map((d) =>
                d.id === doseId ? { ...d, time, dosage } : d
            );

            await db
                .update(ipdMedications)
                .set({
                    dose: updatedDoses,
                    note: note !== undefined ? note : existingRecord.note,
                })
                .where(eq(ipdMedications.id, rowId));
        } else {
            // Move to another group (or create new)

            // 1. Remove from old group
            const oldDoses = (existingRecord.dose as Dose[]) || [];
            const filteredDoses = oldDoses.filter((d) => d.id !== doseId);

            if (filteredDoses.length === 0) {
                // Delete the old row if no doses left
                await db.delete(ipdMedications).where(eq(ipdMedications.id, rowId));
            } else {
                // Update old row
                await db
                    .update(ipdMedications)
                    .set({ dose: filteredDoses })
                    .where(eq(ipdMedications.id, rowId));
            }

            // 2. Add to new group
            // Check if new group exists
            const targetRecords = await db
                .select()
                .from(ipdMedications)
                .where(
                    and(
                        eq(ipdMedications.ipdAdmissionId, ipdAdmissionId),
                        eq(ipdMedications.date, date),
                        eq(ipdMedications.medicineId, medicineId)
                    )
                )
                .limit(1);

            const targetRecord = targetRecords[0];

            const updatedDose: Dose = {
                id: doseId, // Keep same ID
                time,
                dosage,
            };

            if (targetRecord) {
                const targetDoses = (targetRecord.dose as Dose[]) || [];
                await db
                    .update(ipdMedications)
                    .set({
                        dose: [...targetDoses, updatedDose],
                        note: note || targetRecord.note,
                    })
                    .where(eq(ipdMedications.id, targetRecord.id));
            } else {
                // Create new
                const admissionRecords = await db
                    .select({ hospitalId: ipdAdmission.hospitalId })
                    .from(ipdAdmission)
                    .where(eq(ipdAdmission.id, ipdAdmissionId))
                    .limit(1);

                const hospitalId = admissionRecords[0]?.hospitalId;

                if (!hospitalId) {
                    return { success: false, error: "Hospital ID not found" };
                }

                await db.insert(ipdMedications).values({
                    hospitalId,
                    ipdAdmissionId,
                    medicineId,
                    date,
                    dose: [updatedDose],
                    note: note || null,
                });
            }
        }

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/medication`);
        return { success: true };
    } catch (error) {
        console.error("Error updating IPD medication:", error);
        return { success: false, error: "Failed to update medication" };
    }
}

export async function deleteIPDMedication(
    rowId: string,
    doseId: string,
    ipdAdmissionId: string
) {
    try {
        const existingRecords = await db
            .select()
            .from(ipdMedications)
            .where(eq(ipdMedications.id, rowId))
            .limit(1);

        const existingRecord = existingRecords[0];

        if (!existingRecord) {
            return { success: false, error: "Record not found" };
        }

        const currentDoses = (existingRecord.dose as Dose[]) || [];
        const updatedDoses = currentDoses.filter((d) => d.id !== doseId);

        if (updatedDoses.length === 0) {
            await db.delete(ipdMedications).where(eq(ipdMedications.id, rowId));
        } else {
            await db
                .update(ipdMedications)
                .set({ dose: updatedDoses })
                .where(eq(ipdMedications.id, rowId));
        }

        revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/medication`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting IPD medication:", error);
        return { success: false, error: "Failed to delete medication" };
    }
}

export async function getMedicines() {
    try {
        const data = await db
            .select({
                id: medicines.id,
                name: medicines.name,
                categoryId: medicines.categoryId,
            })
            .from(medicines);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "Failed to fetch medicines" };
    }
}

export async function getMedicineCategories() {
    try {
        const data = await db.select().from(medicineCategories);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: "Failed to fetch categories" };
    }
}
