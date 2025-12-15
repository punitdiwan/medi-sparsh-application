"use server";

import { db } from "@/db";
import {
  pharmacyMedicines as medicines,
  medicineCategories,
  medicineCompanies,
  medicineUnits,
  medicineGroups,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getActiveOrganization } from "../getActiveOrganization";
import { revalidatePath } from "next/cache";
import { z } from "zod";


const medicineCreateSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  companyId: z.string().min(1),
  unitId: z.string().min(1),
  groupId: z.string().min(1),
});

const medicineUpdateSchema = medicineCreateSchema.extend({
  id: z.string().min(1),
});

export type MedicineCreateInput = z.infer<typeof medicineCreateSchema>;
export type MedicineUpdateInput = z.infer<typeof medicineUpdateSchema>;


export async function getPharmacyMedicines() {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const data = await db
    .select()
    .from(medicines)
    .where(eq(medicines.hospitalId, org.id))
    .orderBy(desc(medicines.createdAt));

  return { data };
}


export async function getPharmacyMedicineById(id: string) {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const [data] = await db
    .select()
    .from(medicines)
    .where(and(eq(medicines.id, id), eq(medicines.hospitalId, org.id)))
    .limit(1);

  return { data: data ?? null };
}


export async function createPharmacyMedicine(input: MedicineCreateInput) {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const data = medicineCreateSchema.parse(input);

  const [category, company, unit, group] = await Promise.all([
    db.select().from(medicineCategories)
      .where(and(eq(medicineCategories.id, data.categoryId), eq(medicineCategories.hospitalId, org.id)))
      .limit(1),

    db.select().from(medicineCompanies)
      .where(and(eq(medicineCompanies.id, data.companyId), eq(medicineCompanies.hospitalId, org.id)))
      .limit(1),

    db.select().from(medicineUnits)
      .where(and(eq(medicineUnits.id, data.unitId), eq(medicineUnits.hospitalId, org.id)))
      .limit(1),

    db.select().from(medicineGroups)
      .where(and(eq(medicineGroups.id, data.groupId), eq(medicineGroups.hospitalId, org.id)))
      .limit(1),
  ]);

  if (!category[0]) return { error: "Invalid category" };
  if (!company[0]) return { error: "Invalid company" };
  if (!unit[0]) return { error: "Invalid unit" };
  if (!group[0]) return { error: "Invalid group" };

  const [medicine] = await db
    .insert(medicines)
    .values({
      hospitalId: org.id,
      name: data.name,
      categoryId: data.categoryId,
      companyId: data.companyId,
      unitId: data.unitId,
      groupId: data.groupId,
    })
    .returning();

  revalidatePath("/doctor/settings/medicineRecord");
  return { data: medicine };
}


export async function updatePharmacyMedicine(input: MedicineUpdateInput) {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const data = medicineUpdateSchema.parse(input);

  const [updated] = await db
    .update(medicines)
    .set({
      name: data.name,
      categoryId: data.categoryId,
      companyId: data.companyId,
      unitId: data.unitId,
      groupId: data.groupId,
      updatedAt: new Date(),
    })
    .where(and(eq(medicines.id, data.id), eq(medicines.hospitalId, org.id)))
    .returning();

  if (!updated) return { error: "Medicine not found" };

  revalidatePath("/doctor/settings/medicineRecord");
  return { data: updated };
}


export async function deletePharmacyMedicine(id: string) {
  const org = await getActiveOrganization();
  if (!org) return { error: "Unauthorized" };

  const [deleted] = await db
    .delete(medicines)
    .where(and(eq(medicines.id, id), eq(medicines.hospitalId, org.id)))
    .returning();

  if (!deleted) return { error: "Medicine not found" };

  revalidatePath("/doctor/settings/medicineRecord");
  return { data: deleted };
}
