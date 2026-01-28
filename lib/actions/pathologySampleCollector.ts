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
}) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // Generate sample number if not provided
    const sampleNumber = `SAM-${Date.now()}`;

    const result = await db.insert(pathologySamples).values({
      hospitalId: org.id,
      orderTestID: data.orderTestId,
      sampleNumber: sampleNumber,
      sampleType: "General",
      sampleDate: new Date(data.collectedDate),
      sampleStatus: "Collected",
      collectedBy: data.personName,
    }).returning();

    revalidatePath("/doctor/pathology");
    return { success: true, data: result[0], message: "Sample details saved successfully" };
  } catch (error) {
    console.error("Error saving sample:", error);
    return { error: "Failed to save sample", success: false };
  }
}
