import { updateFloor, deleteFloor, permanentlyDeleteFloor, getUserRole, getBedGroupCountByFloor } from "@/db/queries";
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
        { error: "Floor ID is required" },
        { status: 400 }
      );
    }

    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: "Floor name cannot be empty" },
        { status: 400 }
      );
    }

    const updatedFloor = await updateFloor(id, {
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(updatedFloor, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update floor" },
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
        { error: "Floor ID is required" },
        { status: 400 }
      );
    }

    // Check if bed groups exist for this floor
    const bedGroupCount = await getBedGroupCountByFloor(id);
    if (bedGroupCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete floor. Bed groups exist for this floor. Please delete the bed groups first." },
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
          { error: "Only owner can permanently delete floors" },
          { status: 403 }
        );
      }

      const deletedFloor = await permanentlyDeleteFloor(id);
      return NextResponse.json(deletedFloor, { status: 200 });
    } else {
      // Soft delete (anyone can do this)
      const deletedFloor = await deleteFloor(id);
      return NextResponse.json(deletedFloor, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete floor" },
      { status: 500 }
    );
  }
}
