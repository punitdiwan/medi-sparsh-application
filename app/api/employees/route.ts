import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import {
  getStaffWithDoctorDetails,
} from "@/lib/db/queries";
import { auth } from "@/lib/auth";

// GET /api/employees - Get all employees (staff) for the current hospital
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    const employees = await getStaffWithDoctorDetails(hospital.hospitalId);
    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch employees",
      },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee (staff member)
export async function POST(request: NextRequest) {
  let createdUserId: string | null = null;

  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();

    // Step 1: Create user account first using better-auth
    const newUser = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });

    if (!newUser || !newUser.user) {
      throw new Error("Failed to create user account");
    }

    createdUserId = newUser.user.id;

    // Step 2: Add user to organization as member
    await auth.api.addMember({
      body: {
        organizationId: hospital.hospitalId,
        userId: newUser.user.id,
        role: body.role || "member",
      },
      headers: new Headers(),
    });

    // Step 3: Create staff and doctor records in a transaction
    // This ensures atomicity for database operations
    const { createEmployeeTransaction } = await import("@/lib/db/queries");

    const result = await createEmployeeTransaction({
      staffData: {
        userId: newUser.user.id,
        hospitalId: hospital.hospitalId,
        mobileNumber: body.mobileNumber || body.mobile,
        gender: body.gender,
        dob: body.dob || null,
        department: body.department || null,
        joiningDate: body.joiningDate || null,
        address: body.address || null,
        createdBy: user.id,
        isDeleted: false,
      },
      doctorData: body.doctorData ? {
        hospitalId: hospital.hospitalId,
        specialization: body.doctorData.specialization,
        qualification: body.doctorData.qualification,
        experience: body.doctorData.experience,
        consultationFee: body.doctorData.consultationFee,
        availability: body.doctorData.availability || null,
        isDeleted: false,
      } : null,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating employee:", error);

    // Rollback: Delete the auth user if database operations failed
    if (createdUserId) {
      try {
        console.log(`Rolling back: Deleting user ${createdUserId} from auth.user`);
        const { deleteAuthUser } = await import("@/lib/db/queries");
        await deleteAuthUser(createdUserId);
        console.log("Rollback successful: User deleted from auth");
      } catch (rollbackError) {
        console.error("CRITICAL: Failed to rollback user creation:", rollbackError);
        // Log this for manual cleanup
        console.error(`MANUAL CLEANUP REQUIRED: Delete user ${createdUserId} from auth.user table`);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create employee",
      },
      { status: 500 }
    );
  }
}
