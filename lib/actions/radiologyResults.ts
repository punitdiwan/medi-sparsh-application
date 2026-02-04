"use server";

import { db } from "@/db/index";
import {
    radiologyResults,
    radiologyResultValues,
    radiologyOrderTests,
    radiologyParameters,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

export async function saveRadiologyTechnician(data: {
    orderTestId: string;
    technicianName: string;
    scanDate: Date;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        // Check if result already exists for this order test
        const existing = await db
            .select()
            .from(radiologyResults)
            .where(eq(radiologyResults.orderTestID, data.orderTestId))
            .limit(1);

        if (existing[0]) {
            await db
                .update(radiologyResults)
                .set({
                    tecnnician_name: data.technicianName,
                    resultDate: data.scanDate,
                    updatedAt: new Date(),
                })
                .where(eq(radiologyResults.orderTestID, data.orderTestId));
        } else {
            await db.insert(radiologyResults).values({
                hospitalId: org.id,
                orderTestID: data.orderTestId,
                tecnnician_name: data.technicianName,
                resultDate: data.scanDate,
                remarks: "Scan scheduled/completed", // placeholder
            });
        }

        revalidatePath("/doctor/radiology");
        return { success: true, message: "Technician assigned successfully" };
    } catch (error) {
        console.error("Error saving radiology technician:", error);
        return { error: "Failed to save technician", success: false };
    }
}

export async function saveRadiologyReport(data: {
    orderTestId: string;
    approvedBy: string;
    approveDate: Date;
    findings: string;
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

        const existing = await db
            .select()
            .from(radiologyResults)
            .where(eq(radiologyResults.orderTestID, data.orderTestId))
            .limit(1);

        let resultId: string;

        if (existing[0]) {
            resultId = existing[0].id;
            await db
                .update(radiologyResults)
                .set({
                    approvedBy: data.approvedBy,
                    approvedAt: data.approveDate,
                    remarks: data.findings,
                    updatedAt: new Date(),
                })
                .where(eq(radiologyResults.orderTestID, data.orderTestId));

            // Delete old parameter values for this result
            await db
                .delete(radiologyResultValues)
                .where(eq(radiologyResultValues.resultID, resultId));
        } else {
            const inserted = await db.insert(radiologyResults).values({
                hospitalId: org.id,
                orderTestID: data.orderTestId,
                approvedBy: data.approvedBy,
                approvedAt: data.approveDate,
                remarks: data.findings,
                resultDate: new Date(), // default to today if not scanned yet
            }).returning({ id: radiologyResults.id });

            if (!inserted[0]) {
                return { error: "Failed to create result record", success: false };
            }
            resultId = inserted[0].id;
        }

        // Insert parameter values
        const parameterValuesToInsert = data.parameterValues
            .filter((p) => p.value.trim()) // Only save non-empty values
            .map((p) => ({
                hospitalId: org.id,
                resultID: resultId,
                parameterID: p.id,
                resultValue: p.value,
                unit: p.range || "", // Using range as unit for now, adjust if schema has separate unit
            }));

        if (parameterValuesToInsert.length > 0) {
            await db.insert(radiologyResultValues).values(parameterValuesToInsert);
        }

        revalidatePath("/doctor/radiology");
        return { success: true, message: "Report approved successfully" };
    } catch (error) {
        console.error("Error saving radiology report:", error);
        return { error: "Failed to save report", success: false };
    }
}

export async function getParametersByOrderTest(orderTestId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        // Get test_id from order_test
        const orderTest = await db
            .select()
            .from(radiologyOrderTests)
            .where(eq(radiologyOrderTests.id, orderTestId))
            .limit(1);

        if (!orderTest[0]) {
            return { success: true, data: [] };
        }

        const parameters = await db
            .select()
            .from(radiologyParameters)
            .where(eq(radiologyParameters.testId, orderTest[0].testId));

        return { success: true, data: parameters };
    } catch (error) {
        console.error("Error fetching parameters:", error);
        return { error: "Failed to fetch parameters", success: false };
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
            .from(radiologyResults)
            .where(eq(radiologyResults.orderTestID, orderTestId))
            .limit(1);

        if (!result[0]) {
            return { success: true, data: null };
        }

        const parameterValues = await db
            .select()
            .from(radiologyResultValues)
            .where(eq(radiologyResultValues.resultID, result[0].id));

        return { success: true, data: { ...result[0], parameterValues } };
    } catch (error) {
        console.error("Error fetching report:", error);
        return { error: "Failed to fetch report", success: false };
    }
}
