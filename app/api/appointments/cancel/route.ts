import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { updateAppointmentStatus } from "@/lib/db/queries";

// POST /api/appointments/cancel - Cancel an appointment
export async function POST(request: NextRequest) {
  try {
    // const user = await getCurrentUser();
    // const hospital = await getCurrentHospital();
    const body = await request.json();

    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Appointment ID is required",
        },
        { status: 400 }
      );
    }

    // Update appointment status to cancelled
    const updatedAppointment = await updateAppointmentStatus(appointmentId, "cancelled");

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel appointment",
      },
      { status: 500 }
    );
  }
}
