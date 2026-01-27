"use server";

import { db } from "@/db/index";
import {
  pathologyOrders,
  pathologyOrderTests,
  pathologyBills,
  pathologyPayments,
  pathologyTests,
  patients,
} from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
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
        createdAt: pathologyBills.createdAt,
      })
      .from(pathologyBills)
      .leftJoin(pathologyOrders, eq(pathologyBills.orderId, pathologyOrders.id))
      .leftJoin(patients, eq(pathologyOrders.patientId, patients.id))
      .where(eq(pathologyBills.hospitalId, org.id))
      .orderBy(desc(pathologyBills.createdAt));

    // Apply filters
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

    const bill = await db
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

    // Get order details
    const order = await db
      .select()
      .from(pathologyOrders)
      .where(eq(pathologyOrders.id, bill[0].orderId))
      .limit(1);

    // Get order tests
    const orderTests = await db
      .select({
        id: pathologyOrderTests.id,
        testId: pathologyOrderTests.testId,
        price: pathologyOrderTests.price,
        tax: pathologyOrderTests.tax,
        testName: pathologyTests.testName,
      })
      .from(pathologyOrderTests)
      .leftJoin(pathologyTests, eq(pathologyOrderTests.testId, pathologyTests.id))
      .where(eq(pathologyOrderTests.orderId, bill[0].orderId));

    return {
      success: true,
      data: {
        ...bill[0],
        order: order[0],
        tests: orderTests,
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
