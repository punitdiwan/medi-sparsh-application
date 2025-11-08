import { NextRequest, NextResponse } from "next/server";
import { getAllSpecializations } from "@/lib/db/queries";

// GET /api/specializations - Get all specializations
export async function GET(request: NextRequest) {
  try {
    const specializations = await getAllSpecializations();

    return NextResponse.json({
      success: true,
      data: specializations,
    });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch specializations",
      },
      { status: 500 }
    );
  }
}
