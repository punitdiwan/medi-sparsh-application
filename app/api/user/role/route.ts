import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { getUserRole } from "@/lib/db/queries";

// GET /api/user/role - Get current user's role
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    const userRole = await getUserRole(user.id, hospital.hospitalId);

    return NextResponse.json({
      success: true,
      data: {
        role: userRole,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user role",
      },
      { status: 500 }
    );
  }
}
