import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createPrescription, updateAppointmentStatus, getPrescriptionsByHospital } from "@/lib/db/queries";

// GET /api/prescriptions - Get all prescriptions for the current hospital
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    const prescriptions = await getPrescriptionsByHospital(hospital.hospitalId);

    return NextResponse.json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch prescriptions",
      },
      { status: 500 }
    );
  }
}

// POST /api/prescriptions - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();

    const newPrescription = await createPrescription({
      hospitalId: hospital.hospitalId,
      appointmentId: body.appointmentId,
      patientId: body.patientId,
      doctorUserId: user.id,
      diagnosis: body.diagnosis,
      symptoms: body.symptoms || null,
      medicines: body.medicines, // Array of medicine objects
      labTests: body.labTests || null, // Array of lab test objects
      followUpRequired: body.followUpRequired || false,
      followUpDate: body.followUpDate || null,
      followUpNotes: body.followUpNotes || null,
      additionalNotes: body.additionalNotes || null,
    });

    // Update appointment status to completed
    await updateAppointmentStatus(body.appointmentId, "completed");

    return NextResponse.json({
      success: true,
      data: newPrescription,
    });
  } catch (error) {
    console.error("Error creating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create prescription",
      },
      { status: 500 }
    );
  }
}
