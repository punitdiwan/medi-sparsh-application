import { updateBed, deleteBed, permanentlyDeleteBed, getUserRole, getBedById, restoreBed } from "@/db/queries";
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
        { error: "Bed ID is required" },
        { status: 400 }
      );
    }

    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: "Bed name cannot be empty" },
        { status: 400 }
      );
    }

    if (body.bedTypeId && !body.bedTypeId.trim()) {
      return NextResponse.json(
        { error: "Bed type cannot be empty" },
        { status: 400 }
      );
    }

    if (body.bedGroupId && !body.bedGroupId.trim()) {
      return NextResponse.json(
        { error: "Bed group cannot be empty" },
        { status: 400 }
      );
    }

    const updatedBed = await updateBed(id, {
      name: body.name,
      bedTypeId: body.bedTypeId,
      bedGroupId: body.bedGroupId,
    });

    return NextResponse.json(updatedBed, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update bed" },
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
        { error: "Bed ID is required" },
        { status: 400 }
      );
    }

    // Check if bed is occupied
    const bed = await getBedById(id);
    if (bed && bed.isOccupied) {
      return NextResponse.json(
        { error: "Bed is occupied by a patient and cannot be deleted" },
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
          { error: "Only owner can permanently delete beds" },
          { status: 403 }
        );
      }

      const deletedBed = await permanentlyDeleteBed(id);
      return NextResponse.json(deletedBed, { status: 200 });
    } else {
      // Soft delete (anyone can do this)
      const deletedBed = await deleteBed(id);
      return NextResponse.json(deletedBed, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete bed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Bed ID is required" },
        { status: 400 }
      );
    }

    const restoredBed = await restoreBed(id);
    return NextResponse.json(restoredBed, { status: 200 });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json(
      { error: "Failed to restore bed" },
      { status: 500 }
    );
  }
}
