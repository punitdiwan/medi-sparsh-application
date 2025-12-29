import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { getPatientsByHospital, createPatient } from "@/db/queries";

// GET /api/patients - Get all patients for the current hospital with optional search
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");
    const is_IPD_Patient = Boolean(searchParams.get("is_IPD_Patient"));

    const patients = await getPatientsByHospital(hospital.hospitalId, is_IPD_Patient);

    // If search term is provided, filter patients
    let filteredPatients = patients;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredPatients = patients.filter((patient) => {
        return (
          patient.name?.toLowerCase().includes(term) ||
          patient.email?.toLowerCase().includes(term) ||
          patient.mobileNumber?.includes(term) ||
          patient.id?.toLowerCase().includes(term)
        );
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredPatients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch patients",
      },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();

    const newPatient = await createPatient({
      hospitalId: hospital.hospitalId,
      userId: body.userId || null,
      name: body.name,
      gender: body.gender,
      dob: body.dob,
      email: body.email,
      isEmailVerified: body.isEmailVerified || false,
      mobileNumber: body.mobileNumber,
      isMobileVerified: body.isMobileVerified || false,
      address: body.address,
      city: body.city,
      state: body.state,
      areaOrPin: body.areaOrPin,
      bloodGroup: body.bloodGroup,
      referredByDr: body.referredByDr,
      scheduledBy: user.id,
      isDeleted: false,
    });

    return NextResponse.json({
      success: true,
      data: newPatient,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create patient",
      },
      { status: 500 }
    );
  }
}
