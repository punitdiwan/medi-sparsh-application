"use server";

import { db } from "@/db/index";
import { pathologySamples } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getSampleByOrderTest(orderTestId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    const result = await db
      .select()
      .from(pathologySamples)
      .where(
        and(
          eq(pathologySamples.hospitalId, org.id),
          eq(pathologySamples.orderTestID, orderTestId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { success: true, data: null };
    }

    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error fetching sample:", error);
    return { error: "Failed to fetch sample", success: false };
  }
}

export async function saveSampleCollector(data: {
  orderTestId: string;
  personName: string;
  collectedDate: string;
  pathologyCenter: string;
  isUpdate?: boolean;
  sampleId?: string | null;
}) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // Check if this is an update operation
    if (data.isUpdate && data.sampleId) {
      // Update existing sample record
      const result = await db.update(pathologySamples)
        .set({
          collectedBy: data.personName,
          sampleDate: new Date(data.collectedDate),
          sampleType: data.pathologyCenter,
          sampleStatus: "Collected",
        })
        .where(
          and(
            eq(pathologySamples.id, data.sampleId),
            eq(pathologySamples.hospitalId, org.id)
          )
        )
        .returning();

      if (result.length === 0) {
        return { error: "Sample record not found", success: false };
      }

      revalidatePath("/doctor/pathology");
      return { success: true, data: result[0], message: "Sample details updated successfully" };
    } else {
      // Insert new sample record
      // Generate sample number if not provided
      const sampleNumber = `SAM-${Date.now()}`;

      const result = await db.insert(pathologySamples).values({
        hospitalId: org.id,
        orderTestID: data.orderTestId,
        sampleNumber: sampleNumber,
        sampleType: data.pathologyCenter,
        sampleDate: new Date(data.collectedDate),
        sampleStatus: "Collected",
        collectedBy: data.personName,
      }).returning();

      revalidatePath("/doctor/pathology");
      return { success: true, data: result[0], message: "Sample details saved successfully" };
    }
  } catch (error) {
    console.error("Error saving sample:", error);
    return { error: "Failed to save sample", success: false };
  }
}
