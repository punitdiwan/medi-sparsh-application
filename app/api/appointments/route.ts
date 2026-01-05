import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createAppointment, getAppointmentsByHospital, getAppointmentsByDoctor, getUserRole, updateAppointment } from "@/db/queries";

// GET /api/appointments - Get all appointments for the current hospital
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    // Get user's role in the organization
    const userRole = await getUserRole(user.id, hospital.hospitalId);

    let appointments;

    if (userRole === "doctor") {
      appointments = await getAppointmentsByDoctor(user.id, hospital.hospitalId);
    } else {
      appointments = await getAppointmentsByHospital(hospital.hospitalId);
    }

    return NextResponse.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch appointments",
      },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();

    const newAppointment = await createAppointment({
      hospitalId: hospital.hospitalId,
      patientId: body.patientId,
      doctorUserId: body.doctorUserId,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      status: "scheduled",
      reason: body.reason,
      notes: body.notes,
      isFollowUp: body.isFollowUp || false,
      previousAppointmentId: body.previousAppointmentId || null,
      scheduledBy: user.id,
      services: body.services,
    });

    return NextResponse.json({
      success: true,
      data: newAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create appointment",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/appointments - Update an existing appointment
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const updatedAppointment = await updateAppointment(id, data);

    return NextResponse.json({
      success: true,
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update appointment",
      },
      { status: 500 }
    );
  }
}
