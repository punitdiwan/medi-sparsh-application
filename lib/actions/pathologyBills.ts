"use server";

import { db } from "@/db/index";
import {
  pathologyOrders,
  pathologyOrderTests,
  pathologyBills,
  pathologyPayments,
  pathologyTests,
  patients,
  pathologySamples,
} from "@/drizzle/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { revalidatePath } from "next/cache";

// ==================== CREATE ====================

export async function createPathologyBill(data: {
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

    // Create pathology order
    const order = await db.insert(pathologyOrders).values({
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
      await db.insert(pathologyOrderTests).values(
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
    const bill = await db.insert(pathologyBills).values({
      hospitalId: org.id,
      orderId: order[0].id,
      billDiscount: data.billDiscount.toString(),
      billTotalAmount: data.billTotalAmount.toString(),
      billNetAmount: data.billNetAmount.toString(),
      billStatus: "pending",
    }).returning();

    revalidatePath("/doctor/pathology");
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
        id: pathologyBills.id,
        orderId: pathologyBills.orderId,
        billDate: pathologyBills.billDate,
        billDiscount: pathologyBills.billDiscount,
        billTotalAmount: pathologyBills.billTotalAmount,
        billNetAmount: pathologyBills.billNetAmount,
        billStatus: pathologyBills.billStatus,

        patientName: patients.name,
        patientPhone: patients.mobileNumber,
        patientEmail: patients.email,
        patientGender: patients.gender,
        patientDob: patients.dob,
        patientAddress: patients.address,
        createdAt: pathologyBills.createdAt,
        hasSampleCollected: sql<boolean>`
          EXISTS (
            SELECT 1 FROM pathology_samples ps
            INNER JOIN pathology_order_tests pot 
              ON pot.id = ps.order_test_id
            WHERE pot.order_id = ${pathologyBills.orderId}
          )
        `
      })
      .from(pathologyBills)
      .leftJoin(pathologyOrders, eq(pathologyBills.orderId, pathologyOrders.id))
      .leftJoin(patients, eq(pathologyOrders.patientId, patients.id))
      .where(eq(pathologyBills.hospitalId, org.id))
      .orderBy(desc(pathologyBills.createdAt));

    // Filters
    let filteredBills = bills;

    if (status && status !== "") {
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
        id: pathologyBills.id,
        orderId: pathologyBills.orderId,
        billDate: pathologyBills.billDate,
        billDiscount: pathologyBills.billDiscount,
        billTotalAmount: pathologyBills.billTotalAmount,
        billNetAmount: pathologyBills.billNetAmount,
        billStatus: pathologyBills.billStatus,
        createdAt: pathologyBills.createdAt,
        updatedAt: pathologyBills.updatedAt,
        patientId: pathologyOrders.patientId,
        patientName: patients.name,
        patientPhone: patients.mobileNumber,
        patientDob: patients.dob,
        patientGender: patients.gender,
        patientAddress: patients.address,
        patientEmail: patients.email,
        patientBloodGroup: patients.bloodGroup,
        doctorId: pathologyOrders.doctorId,
        doctorName: pathologyOrders.doctorName,
        remarks: pathologyOrders.remarks,
      })
      .from(pathologyBills)
      .leftJoin(pathologyOrders, eq(pathologyBills.orderId, pathologyOrders.id))
      .leftJoin(patients, eq(pathologyOrders.patientId, patients.id))
      .where(
        and(
          eq(pathologyBills.id, billId),
          eq(pathologyBills.hospitalId, org.id)
        )
      )
      .limit(1);

    if (!billResult[0]) {
      return { error: "Bill not found", success: false };
    }

    const bill = billResult[0];

    // Get order tests
    const orderTests = await db
      .select({
        id: pathologyOrderTests.id,
        testId: pathologyOrderTests.testId,
        price: pathologyOrderTests.price,
        tax: pathologyOrderTests.tax,
        testName: pathologyTests.testName,
        reportHours: pathologyTests.reportHours,
        sampleId: pathologySamples.id
      })
      .from(pathologyOrderTests)
      .leftJoin(pathologyTests, eq(pathologyOrderTests.testId, pathologyTests.id))
      .leftJoin(pathologySamples,
        eq(pathologySamples.orderTestID, pathologyOrderTests.id)
      )
      .where(eq(pathologyOrderTests.orderId, bill.orderId));

    const tests = orderTests.map((t) => ({
      id: t.id,
      testId: t.testId,
      price: t.price,
      tax: t.tax,
      testName: t.testName,
      reportHours: t.reportHours,
      hasSampleCollected: Boolean(t.sampleId),
    }));

    // Get payments
    const payments = await db
      .select()
      .from(pathologyPayments)
      .where(eq(pathologyPayments.billId, billId));

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
      .update(pathologyBills)
      .set({
        billStatus: status as any,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pathologyBills.id, billId),
          eq(pathologyBills.hospitalId, org.id)
        )
      )
      .returning();

    revalidatePath("/doctor/pathology");
    return { success: true, data: result[0], message: "Bill status updated" };
  } catch (error) {
    console.error("Error updating bill:", error);
    return { error: "Failed to update bill", success: false };
  }
}

export async function updateBillDiscount(billId: string, discount: number) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // Get current bill to calculate net amount
    const bill = await db
      .select()
      .from(pathologyBills)
      .where(eq(pathologyBills.id, billId))
      .limit(1);

    if (!bill[0]) {
      return { error: "Bill not found", success: false };
    }

    const totalAmount = Number(bill[0].billTotalAmount);
    const netAmount = totalAmount - discount;

    const result = await db
      .update(pathologyBills)
      .set({
        billDiscount: discount.toString(),
        billNetAmount: netAmount.toString(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pathologyBills.id, billId),
          eq(pathologyBills.hospitalId, org.id)
        )
      )
      .returning();

    revalidatePath("/doctor/pathology");
    return { success: true, data: result[0], message: "Discount updated" };
  } catch (error) {
    console.error("Error updating discount:", error);
    return { error: "Failed to update discount", success: false };
  }
}

// ==================== DELETE ====================

export async function updatePathologyBill(
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
      // 🔹 Fetch bill
      const bill = await tx
        .select()
        .from(pathologyBills)
        .where(
          and(
            eq(pathologyBills.id, billId),
            eq(pathologyBills.hospitalId, org.id)
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
          testId: pathologyOrderTests.testId,
        })
        .from(pathologyOrderTests)
        .where(eq(pathologyOrderTests.orderId, orderId));

      const existingIds = new Set(existing.map((t) => t.testId));
      const incomingIds = new Set(data.tests.map((t) => t.testId));

      // Diff
      const toInsert = data.tests.filter((t) => !existingIds.has(t.testId));
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

      // Insert NEW tests only
      if (toInsert.length) {
        await tx.insert(pathologyOrderTests).values(
          toInsert.map((test) => ({
            hospitalId: org.id,
            orderId,
            testId: test.testId,
            price: test.price.toString(),
            tax: test.tax.toString(),
          }))
        );
      }

      // Delete REMOVED tests only
      if (toDelete.length) {
        await tx
          .delete(pathologyOrderTests)
          .where(
            and(
              eq(pathologyOrderTests.orderId, orderId),
              inArray(pathologyOrderTests.testId, toDelete)
            )
          );
      }

      // Update remarks if provided
      if (data.remarks !== undefined) {
        await tx
          .update(pathologyOrders)
          .set({ remarks: data.remarks })
          .where(eq(pathologyOrders.id, orderId));
      }

      // Update bill
      const result = await tx
        .update(pathologyBills)
        .set({
          billDiscount: data.billDiscount.toString(),
          billTotalAmount: data.billTotalAmount.toString(),
          billNetAmount: data.billNetAmount.toString(),
          updatedAt: new Date(),
        })
        .where(eq(pathologyBills.id, billId))
        .returning();

      revalidatePath("/doctor/pathology");

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


export async function deleteBill(billId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // Delete payments associated with bill
    await db
      .delete(pathologyPayments)
      .where(eq(pathologyPayments.billId, billId));

    // Delete bill
    const result = await db
      .delete(pathologyBills)
      .where(
        and(
          eq(pathologyBills.id, billId),
          eq(pathologyBills.hospitalId, org.id)
        )
      )
      .returning();

    revalidatePath("/doctor/pathology");
    return { success: true, data: result[0], message: "Bill deleted successfully" };
  } catch (error) {
    console.error("Error deleting bill:", error);
    return { error: "Failed to delete bill", success: false };
  }
}

// ==================== PAYMENTS ====================

export async function recordPayment(billId: string, paymentData: {
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
      .insert(pathologyPayments)
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
      .from(pathologyPayments)
      .where(eq(pathologyPayments.billId, billId));

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
    const bill = await db.select().from(pathologyBills).where(eq(pathologyBills.id, billId)).limit(1);

    if (bill[0]) {
      const billAmount = Number(bill[0].billNetAmount);
      let newStatus = "pending";

      if (totalPaid >= billAmount) {
        newStatus = "paid";
      } else if (totalPaid > 0) {
        newStatus = "partially_paid";
      }

      await db
        .update(pathologyBills)
        .set({ billStatus: newStatus as any, updatedAt: new Date() })
        .where(eq(pathologyBills.id, billId));
    }

    revalidatePath("/doctor/pathology");
    return { success: true, data: payment[0], message: "Payment recorded" };
  } catch (error) {
    console.error("Error recording payment:", error);
    return { error: "Failed to record payment", success: false };
  }
}

export async function getPaymentsByBillId(billId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    const payments = await db
      .select()
      .from(pathologyPayments)
      .where(
        and(
          eq(pathologyPayments.billId, billId),
          eq(pathologyPayments.hospitalId, org.id)
        )
      );

    return { success: true, data: payments };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { error: "Failed to fetch payments", success: false };
  }
}

export async function deletePayment(paymentId: string, billId: string) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    // Delete the payment
    const result = await db
      .delete(pathologyPayments)
      .where(
        and(
          eq(pathologyPayments.id, paymentId),
          eq(pathologyPayments.hospitalId, org.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return { error: "Payment not found", success: false };
    }

    // Update bill status based on remaining payments
    const allPayments = await db
      .select()
      .from(pathologyPayments)
      .where(eq(pathologyPayments.billId, billId));

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.paymentAmount), 0);
    const bill = await db.select().from(pathologyBills).where(eq(pathologyBills.id, billId)).limit(1);

    if (bill[0]) {
      const billAmount = Number(bill[0].billNetAmount);
      let newStatus = "pending";

      if (totalPaid >= billAmount) {
        newStatus = "paid";
      } else if (totalPaid > 0) {
        newStatus = "partially_paid";
      }

      await db
        .update(pathologyBills)
        .set({ billStatus: newStatus as any, updatedAt: new Date() })
        .where(eq(pathologyBills.id, billId));
    }

    revalidatePath("/doctor/pathology");
    return { success: true, data: result[0], message: "Payment deleted successfully" };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { error: "Failed to delete payment", success: false };
  }
}

export async function getAllPathologyPayments() {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return { error: "Unauthorized", success: false };
    }

    const payments = await db
      .select({
        id: pathologyPayments.id,
        billId: pathologyPayments.billId,
        paymentDate: pathologyPayments.paymentDate,
        paymentAmount: pathologyPayments.paymentAmount,
        paymentMode: pathologyPayments.paymentMode,
        referenceNo: pathologyPayments.referenceNo,
        patientName: patients.name,
        patientPhone: patients.mobileNumber,
        billNo: sql<string>`SUBSTRING(${pathologyBills.id}, 1, 8)`
      })
      .from(pathologyPayments)
      .leftJoin(pathologyBills, eq(pathologyPayments.billId, pathologyBills.id))
      .leftJoin(pathologyOrders, eq(pathologyBills.orderId, pathologyOrders.id))
      .leftJoin(patients, eq(pathologyOrders.patientId, patients.id))
      .where(eq(pathologyPayments.hospitalId, org.id))
      .orderBy(desc(pathologyPayments.paymentDate));

    return { success: true, data: payments };
  } catch (error) {
    console.error("Error fetching all pathology payments:", error);
    return { error: "Failed to fetch payments", success: false };
  }
}
