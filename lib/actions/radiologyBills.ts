"use server";

import { db } from "@/db/index";
import {
    radiologyOrders,
    radiologyOrderTests,
    radiologyBills,
    radiologyPayments,
    radiologyTests,
    radiologyResults,
    patients,
} from "@/drizzle/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

// ==================== CREATE ====================

export async function createRadiologyBill(data: {
    patientId: string;
    doctorId?: string;
    doctorName?: string;
    remarks?: string;
    tests: Array<{
        testId: string;
        price: number;
        tax: number;
    }>;
    billDiscount: number;
    billTotalAmount: number;
    billNetAmount: number;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        // Create radiology order
        const order = await db.insert(radiologyOrders).values({
            hospitalId: org.id,
            patientId: data.patientId,
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            remarks: data.remarks,
        }).returning();

        if (!order[0]) {
            return { error: "Failed to create order", success: false };
        }

        // Create order tests
        if (data.tests.length > 0) {
            await db.insert(radiologyOrderTests).values(
                data.tests.map(test => ({
                    hospitalId: org.id,
                    orderId: order[0].id,
                    testId: test.testId,
                    price: test.price.toString(),
                    tax: test.tax.toString(),
                }))
            );
        }

        // Create bill
        const bill = await db.insert(radiologyBills).values({
            hospitalId: org.id,
            orderId: order[0].id,
            billDiscount: data.billDiscount.toString(),
            billTotalAmount: data.billTotalAmount.toString(),
            billNetAmount: data.billNetAmount.toString(),
            billStatus: "pending",
        }).returning();

        revalidatePath("/doctor/radiology");
        return { success: true, data: bill[0], message: "Bill created successfully" };
    } catch (error) {
        console.error("Error creating bill:", error);
        return { error: "Failed to create bill", success: false };
    }
}

// ==================== READ ====================

export async function getBillsByHospital(searchTerm?: string, status?: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const bills = await db
            .select({
                id: radiologyBills.id,
                orderId: radiologyBills.orderId,
                billDate: radiologyBills.billDate,
                billDiscount: radiologyBills.billDiscount,
                billTotalAmount: radiologyBills.billTotalAmount,
                billNetAmount: radiologyBills.billNetAmount,
                billStatus: radiologyBills.billStatus,

                patientName: patients.name,
                patientPhone: patients.mobileNumber,
                patientEmail: patients.email,
                patientGender: patients.gender,
                patientDob: patients.dob,
                patientAddress: patients.address,
                createdAt: radiologyBills.createdAt,
            })
            .from(radiologyBills)
            .leftJoin(radiologyOrders, eq(radiologyBills.orderId, radiologyOrders.id))
            .leftJoin(patients, eq(radiologyOrders.patientId, patients.id))
            .where(eq(radiologyBills.hospitalId, org.id))
            .orderBy(desc(radiologyBills.createdAt));

        // Filters
        let filteredBills = bills;

        if (status && status !== "" && status !== "all") {
            filteredBills = filteredBills.filter(b => b.billStatus === status);
        }

        if (searchTerm && searchTerm !== "") {
            const search = searchTerm.toLowerCase();
            filteredBills = filteredBills.filter((bill: any) =>
                bill.patientName?.toLowerCase().includes(search) ||
                bill.patientPhone?.includes(search) ||
                bill.id.substring(0, 8).toLowerCase().includes(search)
            );
        }

        return { success: true, data: filteredBills };

    } catch (error) {
        console.error("Error fetching bills:", error);
        return { error: "Failed to fetch bills", success: false };
    }
}

export async function getBillById(billId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const billResult = await db
            .select({
                id: radiologyBills.id,
                orderId: radiologyBills.orderId,
                billDate: radiologyBills.billDate,
                billDiscount: radiologyBills.billDiscount,
                billTotalAmount: radiologyBills.billTotalAmount,
                billNetAmount: radiologyBills.billNetAmount,
                billStatus: radiologyBills.billStatus,
                createdAt: radiologyBills.createdAt,
                updatedAt: radiologyBills.updatedAt,
                patientId: radiologyOrders.patientId,
                patientName: patients.name,
                patientPhone: patients.mobileNumber,
                patientDob: patients.dob,
                patientGender: patients.gender,
                patientAddress: patients.address,
                patientEmail: patients.email,
                patientBloodGroup: patients.bloodGroup,
                doctorId: radiologyOrders.doctorId,
                doctorName: radiologyOrders.doctorName,
                remarks: radiologyOrders.remarks,
            })
            .from(radiologyBills)
            .leftJoin(radiologyOrders, eq(radiologyBills.orderId, radiologyOrders.id))
            .leftJoin(patients, eq(radiologyOrders.patientId, patients.id))
            .where(
                and(
                    eq(radiologyBills.id, billId),
                    eq(radiologyBills.hospitalId, org.id)
                )
            )
            .limit(1);

        if (!billResult[0]) {
            return { error: "Bill not found", success: false };
        }

        const bill = billResult[0];

        // Get order tests with results
        const orderTests = await db
            .select({
                id: radiologyOrderTests.id,
                testId: radiologyOrderTests.testId,
                price: radiologyOrderTests.price,
                tax: radiologyOrderTests.tax,
                testName: radiologyTests.testName,
                reportHours: radiologyTests.reportHours,
                technicianName: radiologyResults.tecnnician_name,
                scanDate: radiologyResults.resultDate,
                approvedBy: radiologyResults.approvedBy,
                approveDate: radiologyResults.approvedAt,
                findings: radiologyResults.remarks,
                reportFileName: radiologyResults.reportFileName,
                reportFilePath: radiologyResults.reportFilePath,
            })
            .from(radiologyOrderTests)
            .leftJoin(radiologyTests, eq(radiologyOrderTests.testId, radiologyTests.id))
            .leftJoin(radiologyResults, eq(radiologyOrderTests.id, radiologyResults.orderTestID))
            .where(eq(radiologyOrderTests.orderId, bill.orderId));

        const tests = orderTests.map((t) => ({
            id: t.id,
            testId: t.testId,
            price: t.price,
            tax: t.tax,
            testName: t.testName,
            reportHours: t.reportHours,
            technicianName: t.technicianName,
            scanDate: t.scanDate,
            approvedBy: t.approvedBy,
            approveDate: t.approveDate,
            findings: t.findings,
            reportFileName: t.reportFileName,
            reportFilePath: t.reportFilePath,
            status: t.approvedBy ? "Approved" : t.technicianName ? "Scanned" : "Pending",
        }));

        // Get payments
        const payments = await db
            .select()
            .from(radiologyPayments)
            .where(eq(radiologyPayments.billId, billId));

        const totalPaid = payments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
        const balanceAmount = Number(bill.billNetAmount) - totalPaid;

        return {
            success: true,
            data: {
                ...bill,
                tests,
                payments,
                totalPaid,
                balanceAmount,
                organization: org,
            },
        };
    } catch (error) {
        console.error("Error fetching bill:", error);
        return { error: "Failed to fetch bill", success: false };
    }
}

// ==================== UPDATE ====================

export async function updateBillStatus(billId: string, status: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const result = await db
            .update(radiologyBills)
            .set({
                billStatus: status as any,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(radiologyBills.id, billId),
                    eq(radiologyBills.hospitalId, org.id)
                )
            )
            .returning();

        revalidatePath("/doctor/radiology");
        return { success: true, data: result[0], message: "Bill status updated" };
    } catch (error) {
        console.error("Error updating bill:", error);
        return { error: "Failed to update bill", success: false };
    }
}

export async function updateRadiologyBill(
    billId: string,
    data: {
        tests: Array<{
            testId: string;
            price: number;
            tax: number;
        }>;
        billDiscount: number;
        billTotalAmount: number;
        billNetAmount: number;
        remarks?: string;
    }
) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        return await db.transaction(async (tx) => {
            // Fetch bill
            const bill = await tx
                .select()
                .from(radiologyBills)
                .where(
                    and(
                        eq(radiologyBills.id, billId),
                        eq(radiologyBills.hospitalId, org.id)
                    )
                )
                .limit(1);

            if (!bill[0]) {
                return { error: "Bill not found", success: false };
            }

            // Only pending bills editable
            if (bill[0].billStatus !== "pending") {
                return {
                    error: "Can only edit bills with pending status",
                    success: false,
                };
            }

            const orderId = bill[0].orderId;

            // Fetch existing tests
            const existing = await tx
                .select({
                    testId: radiologyOrderTests.testId,
                })
                .from(radiologyOrderTests)
                .where(eq(radiologyOrderTests.orderId, orderId));

            const existingIds = new Set(existing.map((t) => t.testId));
            const incomingIds = new Set(data.tests.map((t) => t.testId));

            // Diff
            const toInsert = data.tests.filter((t) => !existingIds.has(t.testId));
            const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

            // Insert NEW tests only
            if (toInsert.length) {
                await tx.insert(radiologyOrderTests).values(
                    toInsert.map((test) => ({
                        hospitalId: org.id,
                        orderId,
                        testId: test.testId,
                        price: test.price.toString(),
                        tax: test.tax.toString(),
                    }))
                );
            }

            // Delete REMOVED tests only - but check if they have results first
            if (toDelete.length) {
                // Get order test IDs for these test IDs in this order
                const testsToDelete = await tx
                    .select({ id: radiologyOrderTests.id, testName: radiologyTests.testName })
                    .from(radiologyOrderTests)
                    .leftJoin(radiologyTests, eq(radiologyOrderTests.testId, radiologyTests.id))
                    .where(
                        and(
                            eq(radiologyOrderTests.orderId, orderId),
                            inArray(radiologyOrderTests.testId, toDelete)
                        )
                    );

                const testOrderTestIds = testsToDelete.map(t => t.id);

                // Check if any of these have results
                const withResults = await tx
                    .select()
                    .from(radiologyResults)
                    .where(inArray(radiologyResults.orderTestID, testOrderTestIds));

                if (withResults.length > 0) {
                    const resultIds = new Set(withResults.map(r => r.orderTestID));
                    const problematicTests = testsToDelete
                        .filter(t => resultIds.has(t.id))
                        .map(t => t.testName)
                        .join(", ");

                    return {
                        error: `Cannot remove tests that already have results/technician data: ${problematicTests}`,
                        success: false,
                    };
                }

                await tx
                    .delete(radiologyOrderTests)
                    .where(
                        and(
                            eq(radiologyOrderTests.orderId, orderId),
                            inArray(radiologyOrderTests.testId, toDelete)
                        )
                    );
            }

            // Update remarks if provided
            if (data.remarks !== undefined) {
                await tx
                    .update(radiologyOrders)
                    .set({ remarks: data.remarks })
                    .where(eq(radiologyOrders.id, orderId));
            }

            // Update bill
            const result = await tx
                .update(radiologyBills)
                .set({
                    billDiscount: data.billDiscount.toString(),
                    billTotalAmount: data.billTotalAmount.toString(),
                    billNetAmount: data.billNetAmount.toString(),
                    updatedAt: new Date(),
                })
                .where(eq(radiologyBills.id, billId))
                .returning();

            revalidatePath("/doctor/radiology");

            return {
                success: true,
                data: result[0],
                message: "Bill updated successfully",
            };
        });
    } catch (error) {
        console.error("Error updating bill:", error);
        return { error: "Failed to update bill", success: false };
    }
}

export async function deleteRadiologyBill(billId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        // Delete payments associated with bill
        await db
            .delete(radiologyPayments)
            .where(eq(radiologyPayments.billId, billId));

        // Delete bill
        const result = await db
            .delete(radiologyBills)
            .where(
                and(
                    eq(radiologyBills.id, billId),
                    eq(radiologyBills.hospitalId, org.id)
                )
            )
            .returning();

        revalidatePath("/doctor/radiology");
        return { success: true, data: result[0], message: "Bill deleted successfully" };
    } catch (error) {
        console.error("Error deleting bill:", error);
        return { error: "Failed to delete bill", success: false };
    }
}

// ==================== PAYMENTS ====================

export async function recordRadiologyPayment(billId: string, paymentData: {
    amount: number;
    mode: string;
    referenceNo?: string;
}) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const payment = await db
            .insert(radiologyPayments)
            .values({
                hospitalId: org.id,
                billId,
                paymentAmount: paymentData.amount.toString(),
                paymentMode: paymentData.mode,
                referenceNo: paymentData.referenceNo,
            })
            .returning();

        // Update bill status based on total payment
        const allPayments = await db
            .select()
            .from(radiologyPayments)
            .where(eq(radiologyPayments.billId, billId));

        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
        const bill = await db.select().from(radiologyBills).where(eq(radiologyBills.id, billId)).limit(1);

        if (bill[0]) {
            const billAmount = Number(bill[0].billNetAmount);
            let newStatus = "pending";

            if (totalPaid >= billAmount) {
                newStatus = "paid";
            } else if (totalPaid > 0) {
                newStatus = "partially_paid";
            }

            await db
                .update(radiologyBills)
                .set({ billStatus: newStatus as any, updatedAt: new Date() })
                .where(eq(radiologyBills.id, billId));
        }

        revalidatePath("/doctor/radiology");
        return { success: true, data: payment[0], message: "Payment recorded" };
    } catch (error) {
        console.error("Error recording payment:", error);
        return { error: "Failed to record payment", success: false };
    }
}

export async function getRadiologyPaymentsByBillId(billId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const payments = await db
            .select()
            .from(radiologyPayments)
            .where(
                and(
                    eq(radiologyPayments.billId, billId),
                    eq(radiologyPayments.hospitalId, org.id)
                )
            );

        return { success: true, data: payments };
    } catch (error) {
        console.error("Error fetching payments:", error);
        return { error: "Failed to fetch payments", success: false };
    }
}

export async function deleteRadiologyPayment(paymentId: string, billId: string) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        // Delete the payment
        const result = await db
            .delete(radiologyPayments)
            .where(
                and(
                    eq(radiologyPayments.id, paymentId),
                    eq(radiologyPayments.hospitalId, org.id)
                )
            )
            .returning();

        if (result.length === 0) {
            return { error: "Payment not found", success: false };
        }

        // Update bill status based on remaining payments
        const allPayments = await db
            .select()
            .from(radiologyPayments)
            .where(eq(radiologyPayments.billId, billId));

        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
        const bill = await db.select().from(radiologyBills).where(eq(radiologyBills.id, billId)).limit(1);

        if (bill[0]) {
            const billAmount = Number(bill[0].billNetAmount);
            let newStatus = "pending";

            if (totalPaid >= billAmount) {
                newStatus = "paid";
            } else if (totalPaid > 0) {
                newStatus = "partially_paid";
            }

            await db
                .update(radiologyBills)
                .set({ billStatus: newStatus as any, updatedAt: new Date() })
                .where(eq(radiologyBills.id, billId));
        }

        revalidatePath("/doctor/radiology");
        return { success: true, data: result[0], message: "Payment deleted successfully" };
    } catch (error) {
        console.error("Error deleting payment:", error);
        return { error: "Failed to delete payment", success: false };
    }
}

export async function getAllRadiologyPayments() {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return { error: "Unauthorized", success: false };
        }

        const payments = await db
            .select({
                id: radiologyPayments.id,
                billId: radiologyPayments.billId,
                paymentDate: radiologyPayments.paymentDate,
                paymentAmount: radiologyPayments.paymentAmount,
                paymentMode: radiologyPayments.paymentMode,
                referenceNo: radiologyPayments.referenceNo,
                patientName: patients.name,
                patientPhone: patients.mobileNumber,
                billNo: sql<string>`SUBSTRING(${radiologyBills.id}, 1, 8)`
            })
            .from(radiologyPayments)
            .leftJoin(radiologyBills, eq(radiologyPayments.billId, radiologyBills.id))
            .leftJoin(radiologyOrders, eq(radiologyBills.orderId, radiologyOrders.id))
            .leftJoin(patients, eq(radiologyOrders.patientId, patients.id))
            .where(eq(radiologyPayments.hospitalId, org.id))
            .orderBy(desc(radiologyPayments.paymentDate));

        return { success: true, data: payments };
    } catch (error) {
        console.error("Error fetching all radiology payments:", error);
        return { error: "Failed to fetch payments", success: false };
    }
}

