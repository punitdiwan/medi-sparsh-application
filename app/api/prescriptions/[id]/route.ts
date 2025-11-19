import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { getPrescriptionById } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { prescriptions, patients, userInAuth as user, appointments, organizationInAuth } from "@/lib/db/migrations/schema";
import { eq, and } from "drizzle-orm";

// GET /api/prescriptions/[id] - Get a specific prescription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { id } = await params;
    // Fetch prescription with patient and doctor details
    const result = await db
      .select()
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(user, eq(prescriptions.doctorUserId, user.id))
      .innerJoin(appointments, eq(prescriptions.appointmentId, appointments.id))
      .innerJoin(organizationInAuth, eq(prescriptions.hospitalId, organizationInAuth.id)) 
      .where(
        and(
          eq(prescriptions.id, id),
          eq(prescriptions.hospitalId, hospital.hospitalId)
        )
      )
      .limit(1);
    console.log("Prescription data", result);
    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Prescription not found",
        },
        { status: 404 }
      );
    }

    const prescriptionData = {
      id: result[0].prescriptions.id,
      patientId: result[0].prescriptions.patientId,
      patientName: result[0].patients.name,
      patientData: result[0].patients,
      doctorName: result[0].user.name,
      diagnosis: result[0].prescriptions.diagnosis,
      symptoms: result[0].prescriptions.symptoms,
      medicines: result[0].prescriptions.medicines,
      labTests: result[0].prescriptions.labTests,
      vitals: result[0].prescriptions.vitals,
      followUpRequired: result[0].prescriptions.followUpRequired,
      followUpDate: result[0].prescriptions.followUpDate,
      followUpNotes: result[0].prescriptions.followUpNotes,
      additionalNotes: result[0].prescriptions.additionalNotes,
      createdAt: result[0].prescriptions.createdAt,
      appointment: {
        id: result[0].appointments.id,
        appointmentDate: result[0].appointments.appointmentDate,
        appointmentTime: result[0].appointments.appointmentTime,
        status: result[0].appointments.status,
        reason: result[0].appointments.reason,
        notes: result[0].appointments.notes,
        isFollowUp: result[0].appointments.isFollowUp,
        previousAppointmentId: result[0].appointments.previousAppointmentId,
        scheduledBy: result[0].appointments.scheduledBy,
        services: result[0].appointments.services,
      },
      organization: {
        id: result[0].organization.id,
        name: result[0].organization.name,
        metadata: result[0].organization.metadata
      }

    };
    return NextResponse.json({
      success: true,
      data: prescriptionData,
    });
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch prescription",
      },
      { status: 500 }
    );
  }
}
