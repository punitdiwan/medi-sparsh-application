import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createAppointment, getAppointmentsByHospital, getAppointmentsByDoctor, getUserRole } from "@/lib/db/queries";
import { cookies } from "next/headers";

// GET /api/appointments - Get all appointments for the current hospital
export async function GET(request: NextRequest) {
  try {

    const raw = (await cookies()).get("userData")?.value;
    const userData = raw ? JSON.parse(raw) : null;
    console.log("userData",userData);
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    // Get user's role in the organization
    const userRole = await getUserRole(user.id, hospital.hospitalId);

    let appointments;

    // If user is a doctor (but not admin), show only their appointments
    // If user is admin (even if they're also a doctor), show all appointments
    // If user is any other role, show all appointments
    if (userRole === "doctor") {
      // Only filter for doctor role, not admin
      appointments = await getAppointmentsByDoctor(user.id, hospital.hospitalId);
    } else {
      // For admin, receptionist, or any other role, show all appointments
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
