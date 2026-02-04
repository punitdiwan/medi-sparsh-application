import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import {
  getPatientById,
  updatePatient,
  deletePatient,
} from "@/db/queries";
import { db } from "@/db/index";
import { appointments, ipdAdmission } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/patients/[patientId] - Get a specific patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { patientId } = await params;

    const patient = await getPatientById(patientId);

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    // Verify patient belongs to current hospital
    if (patient.hospitalId !== hospital.hospitalId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access to patient data",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch patient",
      },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[patientId] - Update a patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();
    const { patientId } = await params;

    // Verify patient exists and belongs to current hospital
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    if (existingPatient.hospitalId !== hospital.hospitalId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access to patient data",
        },
        { status: 403 }
      );
    }

    // Update patient record
    const updatedPatient = await updatePatient(patientId, {
      name: body.name,
      gender: body.gender,
      dob: body.dob || null,
      email: body.email,
      mobileNumber: body.mobileNumber,
      address: body.address,
      city: body.city,
      state: body.state,
      areaOrPin: body.areaOrPin,
      bloodGroup: body.bloodGroup,
      referredByDr: body.referredByDr,
    });

    return NextResponse.json({
      success: true,
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update patient",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[patientId] - Soft delete a patient
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { patientId } = await params;

    // Verify patient exists and belongs to current hospital
    const existingPatient = await getPatientById(patientId);

    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    if (existingPatient.hospitalId !== hospital.hospitalId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access to patient data",
        },
        { status: 403 }
      );
    }

    if (existingPatient.isAdmitted) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete patient with active IPD.",
        },
        { status: 400 }
      );
    }

    // Check if patient has active appointments
    const patientAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .limit(1)
      .orderBy(desc(appointments.appointmentDate));
    if (patientAppointments.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete patient with appointments.",
        },
        { status: 400 }
      );
    }

    const activeIpdAdmissions = await db
      .select()
      .from(ipdAdmission)
      .where(eq(ipdAdmission.patientId, patientId))
      .limit(1);
    if (activeIpdAdmissions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete patient with IPD admissions.",
        },
        { status: 400 }
      );
    }

    // Soft delete patient
    await deletePatient(patientId);

    return NextResponse.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete patient",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/patients/[patientId] - Activate/Reactivate a patient
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { patientId } = await params;
    const body = await request.json();

    // Verify patient exists and belongs to current hospital
    const existingPatient = await getPatientById(patientId);
    if (!existingPatient) {
      return NextResponse.json(
        {
          success: false,
          error: "Patient not found",
        },
        { status: 404 }
      );
    }

    if (existingPatient.hospitalId !== hospital.hospitalId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access to patient data",
        },
        { status: 403 }
      );
    }

    // Reactivate or deactivate patient
    const updatedPatient = await updatePatient(patientId, {
      isDeleted: body.isDeleted ?? false,
    });

    return NextResponse.json({
      success: true,
      data: updatedPatient,
      message: body.isDeleted
        ? "Patient deactivated successfully"
        : "Patient activated successfully",
    });
  } catch (error) {
    console.error("Error updating patient status:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update patient status",
      },
      { status: 500 }
    );
  }
}
