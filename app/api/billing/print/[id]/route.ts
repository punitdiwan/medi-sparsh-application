import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { transactions, patients, appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Fetch transaction details with related data
    const result = await db
      .select({
        transactionId: transactions.id,
        hospitalId: transactions.hospitalId,
        patientId: transactions.patientId,
        appointmentId: transactions.appointmentId,
        amount: transactions.amount,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        patientName: patients.name,
        patientPhone: patients.mobileNumber,
        patientGender: patients.gender,
        appointmentStatus: appointments.status,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
      })
      .from(transactions)
      .leftJoin(patients, eq(patients.id, transactions.patientId))
      .leftJoin(appointments, eq(appointments.id, transactions.appointmentId))
      .where(eq(transactions.id, id));

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
