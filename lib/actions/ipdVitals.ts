"use server";

import { db } from "@/db/index";
import { ipdVitals, vitals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getActiveOrganization } from "../getActiveOrganization";
import { VitalEntry } from "@/Components/doctor/ipd/vitals/vitalsPage";

/* ---------------- GET VITAL DEFINITIONS ---------------- */
export async function getVitalDefinitions() {
  try {
    const org = await getActiveOrganization();
    if (!org) return { error: "Unauthorized" };

    const data = await db
      .select({
        id: vitals.id,
        name: vitals.name,
        unit: vitals.vitalsUnit,
        from: vitals.from,
        to: vitals.to,
      })
      .from(vitals)
      .where(eq(vitals.hospitalId, org.id))
      .orderBy(vitals.name);

    return { data };
  } catch (error) {
    console.error("Error fetching vital definitions:", error);
    return { error: "Failed to fetch vital definitions" };
  }
}

/* ---------------- GET IPD VITALS ---------------- */
export async function getIPDVitals(ipdAdmissionId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) return { error: "Unauthorized" };

    const data = await db
      .select()
      .from(ipdVitals)
      .where(
        and(
          eq(ipdVitals.ipdAdmissionId, ipdAdmissionId),
          eq(ipdVitals.hospitalId, org.id)
        )
      )
      .orderBy(desc(ipdVitals.createdAt));

    return { data };
  } catch (error) {
    console.error("Error fetching IPD vitals:", error);
    return { error: "Failed to fetch IPD vitals" };
  }
}

/* ---------------- ADD VITALS ---------------- */
// Add or append IPD vitals
export async function addIPDVitals(ipdAdmissionId: string, vitalsData: any[]) {
  try {
    const org = await getActiveOrganization();
    if (!org) return { error: "Unauthorized" };

    if (!ipdAdmissionId || !vitalsData || vitalsData.length === 0)
      return { error: "Missing required fields" };

    // Fetch existing vitals for this admission
    const existingRecords = (await db
      .select()
      .from(ipdVitals)
      .where(eq(ipdVitals.ipdAdmissionId, ipdAdmissionId))
      .execute()) as Array<{ id: string; vitals: any[] }>;

    const insertedRecords: any[] = [];

    // Assign unique IDs to incoming vitals based on count
    let count = 1;
    vitalsData.forEach((v) => {
      if (!v.id) v.id = `vital-${Date.now()}-${count++}`;
    });

    // Group incoming vitals by date
    const vitalsByDate: Record<string, any[]> = {};
    vitalsData.forEach((v) => {
      if (!vitalsByDate[v.date]) vitalsByDate[v.date] = [];
      vitalsByDate[v.date].push(v);
    });

    for (const [date, vitals] of Object.entries(vitalsByDate)) {
      // Check if a record for this date exists
      const existing = existingRecords.find((r) =>
        r.vitals.some((v) => v.date === date)
      );

      if (existing) {
        // Append new vitals to the existing record
        const updatedVitals = [...existing.vitals, ...vitals];
        const [updatedRecord] = await db
          .update(ipdVitals)
          .set({ vitals: updatedVitals, updatedAt: new Date() })
          .where(eq(ipdVitals.id, existing.id))
          .returning();
        insertedRecords.push(updatedRecord);
      } else {
        // Insert new record for this date
        const [newRecord] = await db
          .insert(ipdVitals)
          .values({
            hospitalId: org.id,
            ipdAdmissionId,
            vitals: vitals,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        insertedRecords.push(newRecord);
      }
    }

    revalidatePath(`/doctor/IPD/ipdDetails/${ipdAdmissionId}/ipd/vitals`);
    return { data: insertedRecords };
  } catch (error) {
    console.error("Error adding IPD vitals:", error);
    return { error: "Failed to add IPD vitals" };
  }
}



/* ---------------- UPDATE VITAL ---------------- */
export async function updateIPDVital(
  updatedVital: VitalEntry,
  ipdAdmissionId: string,
) {
  try {
    const org = await getActiveOrganization();

    if (!org) {
      return { error: "Unauthorized" };
    }
    if (!updatedVital.recordId) {
      return { error: "Vital recordId missing" };
    }

    const [record] = await db
      .select()
      .from(ipdVitals)
      .where(
        and(
          eq(ipdVitals.ipdAdmissionId, ipdAdmissionId),
          eq(ipdVitals.id, updatedVital.recordId),
          eq(ipdVitals.hospitalId, org.id)
        )
      );

    if (!record) {
      return { error: "Vital record not found" };
    }

    if (!updatedVital.id) {
      return { error: "Vital ID missing for update" };
    }

    const updatedVitals = (record.vitals as VitalEntry[]).map((v) => {
      if (v.id === updatedVital.id) {
        return {
          ...v,
          vitalValue: updatedVital.vitalValue,
          date: updatedVital.date,
          time: updatedVital.time,
          unit: updatedVital.unit,
          range: updatedVital.range,
          updatedAt: new Date(),
        };
      }
      return v;
    });


    await db
      .update(ipdVitals)
      .set({
        vitals: updatedVitals,
        updatedAt: new Date(),
      })
      .where(eq(ipdVitals.id, record.id));

    revalidatePath(
      `/doctor/IPD/ipdDetails/${record.ipdAdmissionId}/ipd/vitals`
    );

    return { data: true };
  } catch (error) {
    return { error: "Failed to update vital" };
  }
}




/* ---------------- DELETE VITAL ---------------- */
export async function deleteIPDVital(
  ipdAdmissionId: string,
  vitalEntryId: string
) {
  try {
    const org = await getActiveOrganization();
    if (!org) return { error: "Unauthorized" };

    const [record] = await db
      .select()
      .from(ipdVitals)
      .where(
        and(
          eq(ipdVitals.ipdAdmissionId, ipdAdmissionId),
          eq(ipdVitals.hospitalId, org.id)
        )
      );

    if (!record) return { error: "Vital record not found" };

    const filteredVitals = (record.vitals as VitalEntry[]).filter(
      (v) => v.id !== vitalEntryId
    );

    // Agar same length hai → matlab ID mila hi nahi
    if (filteredVitals.length === (record.vitals as VitalEntry[]).length) {
      return { error: "Vital entry not found" };
    }

    await db
      .update(ipdVitals)
      .set({
        vitals: filteredVitals,
        updatedAt: new Date(),
      })
      .where(eq(ipdVitals.id, record.id));

    revalidatePath(
      `/doctor/IPD/ipdDetails/${record.ipdAdmissionId}/ipd/vitals`
    );

    return { data: true };
  } catch (error) {
    console.error("Error deleting vital:", error);
    return { error: "Failed to delete vital" };
  }
}

