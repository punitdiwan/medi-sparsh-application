import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import {
  updateStaff,
  updateDoctor,
  deleteStaff,
  deleteDoctor,
  getStaffByUserId,
  getDoctorByStaffId,
  getStaffByIdWithDetails,
} from "@/lib/db/queries";

// GET /api/employees/[userId] - Get a specific employee (userId is actually staffId)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { userId } = await params;
    const staffId = userId; // This is actually staffId in the URL

    const employee = await getStaffByIdWithDetails(staffId, hospital.hospitalId);

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch employee",
      },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[userId] - Update an employee (userId is actually staffId in new schema)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const body = await request.json();
    const { userId } = await params;
    const staffId = userId; // This is actually staffId in the URL

    // Update staff record
    const updatedStaff = await updateStaff(staffId, {
      mobileNumber: body.mobileNumber || body.mobile,
      gender: body.gender,
      dob: body.dob || null,
      department: body.department,
      joiningDate: body.joiningDate || null,
      address: body.address,
    });

    // If doctor data provided, update or create doctor record
    let doctorRecord = null;
    if (body.doctorData) {
      const existingDoctor = await getDoctorByStaffId(staffId, hospital.hospitalId);
      
      if (existingDoctor) {
        doctorRecord = await updateDoctor(existingDoctor.id, {
          specialization: body.doctorData.specialization,
          qualification: body.doctorData.qualification,
          experience: body.doctorData.experience,
          consultationFee: body.doctorData.consultationFee,
          availability: body.doctorData.availability || null,
        });
      } else {
        // Create doctor record if it doesn't exist
        const { createDoctor } = await import("@/lib/db/queries");
        doctorRecord = await createDoctor({
          staffId: staffId,
          hospitalId: hospital.hospitalId,
          specialization: body.doctorData.specialization,
          qualification: body.doctorData.qualification,
          experience: body.doctorData.experience,
          consultationFee: body.doctorData.consultationFee,
          availability: body.doctorData.availability || null,
        } as any); // Type assertion needed as id is auto-generated
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
    console.error("Error updating employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update employee",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[userId] - Soft delete an employee (userId is actually staffId)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { userId } = await params;
    const staffId = userId; // This is actually staffId in the URL

    // Soft delete staff record
    await deleteStaff(staffId);

    // If the employee is a doctor, also soft delete the doctor record
    const doctor = await getDoctorByStaffId(staffId, hospital.hospitalId);
    if (doctor) {
      await deleteDoctor(doctor.id);
    }

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete employee",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/employees/[userId] - Activate/Reactivate an employee (userId is actually staffId)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();
    const { userId } = await params;
    const staffId = userId; // This is actually staffId in the URL
    const body = await request.json();

    // Reactivate staff record
    const updatedStaff = await updateStaff(staffId, {
      isDeleted: body.isDeleted ?? false,
    });

    // If the employee is a doctor, also reactivate the doctor record
    const doctor = await getDoctorByStaffId(staffId, hospital.hospitalId);
    if (doctor) {
      await updateDoctor(doctor.id, {
        isDeleted: body.isDeleted ?? false,
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedStaff,
      message: body.isDeleted ? "Employee deactivated successfully" : "Employee activated successfully",
    });
  } catch (error) {
    console.error("Error updating employee status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update employee status",
      },
      { status: 500 }
    );
  }
}
