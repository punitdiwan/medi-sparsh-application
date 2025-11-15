import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { db } from "@/lib/db";
import { prescriptions, patients, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { desc } from "drizzle-orm";

// GET /api/patients/[patientId]/prescriptions - Get all prescriptions for a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { patientId } = await params;

    // Fetch prescriptions for the patient with doctor details
    const prescriptionsList = await db
      .select()
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(user, eq(prescriptions.doctorUserId, user.id))
      .where(
        and(
          eq(prescriptions.patientId, patientId),
          eq(prescriptions.hospitalId, hospital.hospitalId)
        )
      )
      .orderBy(desc(prescriptions.createdAt));

    // Format the data to match the component's expected structure
    const formattedData = prescriptionsList.map((item) => ({
      id: item.prescriptions.id,
      appointment_id: item.prescriptions.appointmentId,
      patient_id: item.prescriptions.patientId,
      diagnosis: item.prescriptions.diagnosis,
      symptoms: item.prescriptions.symptoms,
      medicines: item.prescriptions.medicines,
      vitals: item.prescriptions.vitals, // Include actual vitals data from prescriptions table
      notes: item.prescriptions.additionalNotes,
      created_at: item.prescriptions.createdAt,
      doctor_name: item.user.name,
      patient_name: item.patients.name,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch prescriptions",
      },
      { status: 500 }
    );
  }
}
