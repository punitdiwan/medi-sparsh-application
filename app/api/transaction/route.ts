import { NextRequest, NextResponse } from "next/server";
import { getCurrentHospital } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { createTransaction, getTransactionsByHospital } from "@/lib/db/queries";

export async function GET() {
    try {
        const hospital = await getCurrentHospital();
        const transactions = await getTransactionsByHospital(hospital.hospitalId);
        console.log("traaction data ",transactions)
        return NextResponse.json(
            { success: true, data: transactions },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const user = await getCurrentUser();
    const body = await req.json();

    console.log("Body:", body);
    const appointment = body.appointment;

    if (!appointment || !appointment.id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const services = appointment.services || [];
    const totalAmount = services.reduce((sum: any, service: any) => {
      const amt = Number(service.amount || 0);
      return sum + amt;
    }, 0);

    console.log("Appointment Received:", appointment, "Total:", totalAmount);


    const transaction = await createTransaction({
      hospitalId: appointment.hospitalId,
      patientId: appointment.patientId,
      appointmentsId: appointment.id,
      amount: totalAmount,
      status: "paid",
      paymentMethod: "cash",
      notes: "appointment services",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        appointment,
        services,
        totalAmount,
        transaction,
        hospital,
        user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const user = await getCurrentUser();
    const body = await req.json();

    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    console.log("📝 Update Request:", body);

    

    return NextResponse.json(
      {
        success: true,
        message: "Transaction updated successfully",
        // data: updated[0],
        user,
        hospital,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}