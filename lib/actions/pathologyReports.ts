"use server";

import { db } from "@/db/index";
import { pathologyResults, pathologyResultValues, pathologyOrderTests, pathologyParameters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function getParametersByOrderTest(orderTestId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // First, get the test_id from pathology_order_tests
    const orderTest = await db
      .select()
      .from(pathologyOrderTests)
      .where(
        and(
          eq(pathologyOrderTests.hospitalId, org.id),
          eq(pathologyOrderTests.id, orderTestId)
        )
      )
      .limit(1);

    if (orderTest.length === 0) {
      return { success: true, data: [] };
    }

    // Then fetch parameters for this test
    const parameters = await db
      .select()
      .from(pathologyParameters)
      .where(
        and(
          eq(pathologyParameters.hospitalId, org.id),
          eq(pathologyParameters.testId, orderTest[0].testId)
        )
      );

    return { success: true, data: parameters };
  } catch (error) {
    console.error("Error fetching parameters:", error);
    return { error: "Failed to fetch parameters", success: false };
  }
}

export async function saveReportData(data: {
  orderTestId: string;
  approvedBy: string;
  approveDate: string;
  remarks: string;
  parameterValues: Array<{
    id: string;
    name: string;
    value: string;
    range: string;
  }>;
}) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    if (!data.approvedBy || !data.approveDate || !data.parameterValues.length) {
      return { error: "Please fill all required fields", success: false };
    }

    // Check if result already exists for this order test
    const existingResult = await db
      .select()
      .from(pathologyResults)
      .where(
        and(
          eq(pathologyResults.hospitalId, org.id),
          eq(pathologyResults.orderTestID, data.orderTestId)
        )
      )
      .limit(1);

    let resultId: string;

    if (existingResult.length > 0) {
      // Update existing result
      resultId = existingResult[0].id;
      await db
        .update(pathologyResults)
        .set({
          approvedBy: data.approvedBy,
          approvedAt: new Date(data.approveDate),
          remarks: data.remarks,
          updatedAt: new Date(),
        })
        .where(eq(pathologyResults.id, resultId));

      // Delete old parameter values for this result
      await db
        .delete(pathologyResultValues)
        .where(eq(pathologyResultValues.resultID, resultId));
    } else {
      // Insert new result
      const insertResult = await db
        .insert(pathologyResults)
        .values({
          hospitalId: org.id,
          orderTestID: data.orderTestId,
          approvedBy: data.approvedBy,
          approvedAt: new Date(data.approveDate),
          remarks: data.remarks,
          resultDate: new Date(),
        })
        .returning({ id: pathologyResults.id });

      if (!insertResult.length) {
        return { error: "Failed to create result record", success: false };
      }

      resultId = insertResult[0].id;
    }

    // Insert parameter values
    const parameterValuesToInsert = data.parameterValues
      .filter((p) => p.value.trim()) // Only save non-empty values
      .map((p) => ({
        hospitalId: org.id,
        resultID: resultId,
        parameterID: p.id, // This should be the parameter ID from the database
        resultValue: p.value,
        unit: p.range || "", // Using range as unit for now
      }));

    if (parameterValuesToInsert.length > 0) {
      await db.insert(pathologyResultValues).values(parameterValuesToInsert);
    }

    revalidatePath("/doctor/pathology");

    return { success: true, data: { resultId } };
  } catch (error) {
    console.error("Error saving report:", error);
    return { error: "Failed to save report", success: false };
  }
}

export async function getReportByOrderTest(orderTestId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    const result = await db
      .select()
      .from(pathologyResults)
      .where(
        and(
          eq(pathologyResults.hospitalId, org.id),
          eq(pathologyResults.orderTestID, orderTestId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { success: true, data: null };
    }

    // Fetch parameter values for this result
    const parameterValues = await db
      .select()
      .from(pathologyResultValues)
      .where(eq(pathologyResultValues.resultID, result[0].id));

    return { success: true, data: { ...result[0], parameterValues } };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { error: "Failed to fetch report", success: false };
  }
}
