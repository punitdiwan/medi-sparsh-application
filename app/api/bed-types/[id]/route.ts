import { updateBedType, deleteBedType, permanentlyDeleteBedType, getUserRole, getBedCountByBedType } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Bed Type ID is required" },
        { status: 400 }
      );
    }

    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: "Bed type name cannot be empty" },
        { status: 400 }
      );
    }

    const updatedBedType = await updateBedType(id, {
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(updatedBedType, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update bed type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const permanent = req.nextUrl.searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Bed Type ID is required" },
        { status: 400 }
      );
    }

    // Check if beds exist for this bed type
    const bedCount = await getBedCountByBedType(id);
    if (bedCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete bed type. ${bedCount} bed(s) are using this bed type.` },
        { status: 409 }
      );
    }

    // Check user role for permanent deletion
    if (permanent) {
      const user = await getCurrentUser();
      const hospital = await getCurrentHospital();
      const userRole = await getUserRole(user.id, hospital.hospitalId);

      // Only owner can permanently delete
      if (userRole !== "owner") {
        return NextResponse.json(
          { error: "Only owner can permanently delete bed types" },
          { status: 403 }
        );
      }

      const deletedBedType = await permanentlyDeleteBedType(id);
      return NextResponse.json(deletedBedType, { status: 200 });
    } else {
      // Soft delete (anyone can do this)
      const deletedBedType = await deleteBedType(id);
      return NextResponse.json(deletedBedType, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete bed type" },
      { status: 500 }
    );
  }
}
