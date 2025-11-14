import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createPrescription, updateAppointmentStatus, getPrescriptionsByHospital } from "@/lib/db/queries";
import { prescriptions } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

// GET /api/prescriptions - Get all prescriptions for the current hospital
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    const prescriptions = await getPrescriptionsByHospital(hospital.hospitalId ,user.id);

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
      vitals: body.vitals || null,
    });


    // // Update appointment status to completed
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

// PUT /api/prescriptions - Update an existing prescription
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();

    if (!body.prescriptionId) {
      return NextResponse.json(
        { success: false, error: "Missing prescriptionId" },
        { status: 400 }
      );
    }

    // Update the prescription
    const updatedPrescriptions = await db
      .update(prescriptions)
      .set({
        diagnosis: body.diagnosis,
        symptoms: body.symptoms || null,
        medicines: body.medicines,
        labTests: body.labTests || null,
        followUpRequired: body.followUpRequired || false,
        followUpDate: body.followUpDate || null,
        followUpNotes: body.followUpNotes || null,
        additionalNotes: body.additionalNotes || null,
        vitals: body.vitals || null,
      })
      .where(
        and(
          eq(prescriptions.id, body.prescriptionId),
          eq(prescriptions.hospitalId, hospital.hospitalId)
        )
      )
      .returning(); // returns an array

    if (!updatedPrescriptions || updatedPrescriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Prescription not found or not updated" },
        { status: 404 }
      );
    }

    // Return the first (and only) updated prescription
    const updatedPrescription = updatedPrescriptions[0];

    return NextResponse.json({
      success: true,
      data: updatedPrescription,
    });
  } catch (error) {
    console.error("Error updating prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update prescription",
      },
      { status: 500 }
    );
  }
}
