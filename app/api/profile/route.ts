import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import {
  getStaffByUserId,
  getDoctorByStaffId,
  updateStaff,
  updateDoctor,
} from "@/db/queries";
import { selectAllAppliedValues } from "recharts/types/state/selectors/axisSelectors";
import { db } from "@/db";
import { member } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();

    if (!currentUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated",
        },
        { status: 401 }
      );
    }

    const [memberRole] = await db
      .select()
      .from(member)
      .where(eq(member.userId, currentUser.id))
      .limit(1);

    if(memberRole?.role === 'owner') {
      return NextResponse.json(
        {
          success: true,
          data:{user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            image: currentUser.image,
            role: memberRole?.role,
          },}
        }, { status: 200 }
      );

    }
    // Get staff record for current user
    const staffRecord = await getStaffByUserId(currentUser.id, hospital.hospitalId);

    if (!staffRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff profile not found",
        },
        { status: 404 }
      );
    }

    // Get doctor record if exists
    const doctorRecord = await getDoctorByStaffId(staffRecord.id, hospital.hospitalId);

    return NextResponse.json({
      success: true,
      data: {
        staff: staffRecord,
        doctor: doctorRecord,
        user: {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();
    console.log("Received profile update body:", body);
    console.log("Current User:", currentUser);
    console.log("Hospital:", hospital);
    if (!currentUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated",
        },
        { status: 401 }
      );
    }

    // Get staff record for current user
    const staffRecord = await getStaffByUserId(currentUser.id, hospital.hospitalId);

    if (!staffRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Staff profile not found",
        },
        { status: 404 }
      );
    }

    // Update staff record
    const updatedStaff = await updateStaff(staffRecord.id, {
      mobileNumber: body.mobileNumber,
      gender: body.gender,
      dob: body.dob || null,
      department: body.department,
      joiningDate: body.joiningDate || null,
      address: body.address,
    });

    // If doctor data provided, update doctor record
    let doctorRecord = null;
    if (body.doctorData) {
      const existingDoctor = await getDoctorByStaffId(staffRecord.id, hospital.hospitalId);
      
      if (existingDoctor) {
        doctorRecord = await updateDoctor(existingDoctor.id, {
          specialization: body.doctorData.specialization,
          qualification: body.doctorData.qualification,
          experience: body.doctorData.experience,
          consultationFee: body.doctorData.consultationFee,
          availability: body.doctorData.availability || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        staff: updatedStaff,
        doctor: doctorRecord,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
