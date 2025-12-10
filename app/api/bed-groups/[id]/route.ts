import { updateBedGroup, deleteBedGroup, permanentlyDeleteBedGroup, getUserRole } from "@/db/queries";
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
        { error: "Bed Group ID is required" },
        { status: 400 }
      );
    }

    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: "Bed group name cannot be empty" },
        { status: 400 }
      );
    }

    if (body.floorId && !body.floorId.trim()) {
      return NextResponse.json(
        { error: "Floor cannot be empty" },
        { status: 400 }
      );
    }

    const updatedBedGroup = await updateBedGroup(id, {
      name: body.name,
      floorId: body.floorId,
      description: body.description,
    });

    return NextResponse.json(updatedBedGroup, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update bed group" },
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
        { error: "Bed Group ID is required" },
        { status: 400 }
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
          { error: "Only owner can permanently delete bed groups" },
          { status: 403 }
        );
      }

      const deletedBedGroup = await permanentlyDeleteBedGroup(id);
      return NextResponse.json(deletedBedGroup, { status: 200 });
    } else {
      // Soft delete (anyone can do this)
      const deletedBedGroup = await deleteBedGroup(id);
      return NextResponse.json(deletedBedGroup, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete bed group" },
      { status: 500 }
    );
  }
}
