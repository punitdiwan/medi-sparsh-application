"use server";

import { db } from "@/db/index";
import { medicines, medicineCategories, medicineCompanies, medicineUnits, medicineGroups } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod validation schemas
const medicineCreateSchema = z.object({
  name: z.string().min(1, "Medicine name is required").trim(),
  categoryId: z.string().min(1, "Category is required"),
  companyName: z.string().min(1, "Company is required"),
  unitId: z.string().min(1, "Unit is required"),
  notes: z.string().optional().nullable(),
  groupId: z.string().min(1, "Group is required"),
});

const medicineUpdateSchema = medicineCreateSchema.extend({
  id: z.string().min(1, "Medicine ID is required"),
});

export type MedicineCreateInput = z.infer<typeof medicineCreateSchema>;
export type MedicineUpdateInput = z.infer<typeof medicineUpdateSchema>;

// Get all medicines with related data
export async function getMedicines() {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    const data = await db
      .select({
        id: medicines.id,
        name: medicines.name,
        categoryId: medicines.categoryId,
        companyName: medicines.companyName,
        unitId: medicines.unitId,
        groupId: medicines.groupId,
        notes: medicines.notes,
        createdAt: medicines.createdAt,
        updatedAt: medicines.updatedAt,
      })
      .from(medicines)
      .where(and(eq(medicines.hospitalId, org.id), eq(medicines.isDeleted, false)))
      .orderBy(desc(medicines.createdAt));

    return { data };
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return { error: "Failed to fetch medicines" };
  }
}

// Get medicine by ID
export async function getMedicineById(id: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    const data = await db
      .select()
      .from(medicines)
      .where(
        and(
          eq(medicines.id, id),
          eq(medicines.hospitalId, org.id),
          eq(medicines.isDeleted, false)
        )
      )
      .limit(1);

    return { data: data[0] || null };
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return { error: "Failed to fetch medicine" };
  }
}

// Create medicine
export async function createMedicine(input: MedicineCreateInput) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    // Validate input
    const validatedData = medicineCreateSchema.parse(input);

    // Verify that category, company, unit, and group belong to the same organization
    const [category, company, unit, group] = await Promise.all([
      db
        .select()
        .from(medicineCategories)
        .where(
          and(
            eq(medicineCategories.id, validatedData.categoryId),
            eq(medicineCategories.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineCompanies)
        .where(
          and(
            eq(medicineCompanies.id, validatedData.companyName),
            eq(medicineCompanies.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineUnits)
        .where(
          and(
            eq(medicineUnits.id, validatedData.unitId),
            eq(medicineUnits.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineGroups)
        .where(
          and(
            eq(medicineGroups.id, validatedData.groupId),
            eq(medicineGroups.hospitalId, org.id)
          )
        )
        .limit(1),
    ]);

    if (!category[0]) {
      return { error: "Invalid category selected" };
    }
    if (!company[0]) {
      return { error: "Invalid company selected" };
    }
    if (!unit[0]) {
      return { error: "Invalid unit selected" };
    }
    if (!group[0]) {
      return { error: "Invalid group selected" };
    }

    const [newMedicine] = await db
      .insert(medicines)
      .values({
        hospitalId: org.id,
        name: validatedData.name,
        categoryId: validatedData.categoryId,
        companyName: validatedData.companyName,
        unitId: validatedData.unitId,
        notes: validatedData.notes ?? null,
        groupId: validatedData.groupId,
      })
      .returning();



    revalidatePath("/doctor/settings/medicineRecord");
    return { data: newMedicine };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = (error as any).issues || [];
      return { error: issues[0]?.message || "Validation error" };
    }
    console.error("Error creating medicine:", error);
    return { error: "Failed to create medicine" };
  }
}

// Update medicine
export async function updateMedicine(input: MedicineUpdateInput) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    // Validate input
    const validatedData = medicineUpdateSchema.parse(input);

    // Verify that category, company, unit, and group belong to the same organization
    const [category, company, unit, group] = await Promise.all([
      db
        .select()
        .from(medicineCategories)
        .where(
          and(
            eq(medicineCategories.id, validatedData.categoryId),
            eq(medicineCategories.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineCompanies)
        .where(
          and(
            eq(medicineCompanies.id, validatedData.companyName),
            eq(medicineCompanies.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineUnits)
        .where(
          and(
            eq(medicineUnits.id, validatedData.unitId),
            eq(medicineUnits.hospitalId, org.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(medicineGroups)
        .where(
          and(
            eq(medicineGroups.id, validatedData.groupId),
            eq(medicineGroups.hospitalId, org.id)
          )
        )
        .limit(1),
    ]);

    if (!category[0]) {
      return { error: "Invalid category selected" };
    }
    if (!company[0]) {
      return { error: "Invalid company selected" };
    }
    if (!unit[0]) {
      return { error: "Invalid unit selected" };
    }
    if (!group[0]) {
      return { error: "Invalid group selected" };
    }

    const [updatedMedicine] = await db
      .update(medicines)
      .set({
        name: validatedData.name,
        categoryId: validatedData.categoryId,
        companyName: validatedData.companyName,
        unitId: validatedData.unitId,
        groupId: validatedData.groupId,
        notes: validatedData.notes || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(medicines.id, validatedData.id),
          eq(medicines.hospitalId, org.id)
        )
      )
      .returning();

    if (!updatedMedicine) {
      return { error: "Medicine not found" };
    }

    revalidatePath("/doctor/settings/medicineRecord");
    return { data: updatedMedicine };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = (error as any).issues || [];
      return { error: issues[0]?.message || "Validation error" };
    }
    console.error("Error updating medicine:", error);
    return { error: "Failed to update medicine" };
  }
}

// Soft delete medicine
export async function deleteMedicine(id: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    const [deletedMedicine] = await db
      .update(medicines)
      .set({
        isDeleted: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(medicines.id, id),
          eq(medicines.hospitalId, org.id)
        )
      )
      .returning();

    if (!deletedMedicine) {
      return { error: "Medicine not found" };
    }

    revalidatePath("/doctor/settings/medicineRecord");
    return { data: deletedMedicine };
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return { error: "Failed to delete medicine" };
  }
}

// Permanent delete medicine (hard delete)
export async function permanentlyDeleteMedicine(id: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized" };
    }

    const [deletedMedicine] = await db
      .delete(medicines)
      .where(
        and(
          eq(medicines.id, id),
          eq(medicines.hospitalId, org.id)
        )
      )
      .returning();

    if (!deletedMedicine) {
      return { error: "Medicine not found" };
    }

    revalidatePath("/doctor/settings/medicineRecord");
    return { data: deletedMedicine };
  } catch (error) {
    console.error("Error permanently deleting medicine:", error);
    return { error: "Failed to permanently delete medicine" };
  }
}
