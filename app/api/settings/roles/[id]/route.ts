import { NextRequest, NextResponse } from "next/server";
import { getOrganizationRoleById } from "@/db/queries";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { db } from "@/db/index";
import { organizationRole } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

// GET /api/settings/roles/[id] - Get a specific organization role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    if (!user || !hospital) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const role = await getOrganizationRoleById(id, hospital.hospitalId);

    if (!role) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 404 }
      );
    }

    // Parse the permission JSON string
    let permission: Record<string, string[]> = {};
    try {
      permission = JSON.parse(role.permission);
    } catch {
      // If permission is not valid JSON, return empty object
      permission = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        id: role.id,
        role: role.role,
        permission,
        organizationId: role.organizationId,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching organization role:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch role",
      },
      { status: 500 }
    );
  }
}

// PUT /api/settings/roles/[id] - Update an organization role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();

    if (!user || !hospital) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const { role, permission } = body;

    if (!role || !permission) {
      return NextResponse.json(
        { success: false, error: "Role name and permissions are required" },
        { status: 400 }
      );
    }

    // Update the role in the database
    const result = await db
      .update(organizationRole)
      .set({
        role,
        permission: JSON.stringify(permission),
      })
      .where(
        and(
          eq(organizationRole.id, id),
          eq(organizationRole.organizationId, hospital.hospitalId)
        )
      )
      .returning();

    if (!result.length) {
      return NextResponse.json(
        { success: false, error: "Role not found" },
        { status: 404 }
      );
    }

    const updatedRole = result[0];

    return NextResponse.json({
      success: true,
      data: {
        id: updatedRole.id,
        role: updatedRole.role,
        permission: JSON.parse(updatedRole.permission),
        organizationId: updatedRole.organizationId,
        createdAt: updatedRole.createdAt,
        updatedAt: updatedRole.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating organization role:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update role",
      },
      { status: 500 }
    );
  }
}
