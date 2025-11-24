import { updateUnit, deleteUnit, getChargeCountByUnit } from "@/lib/db/queries";
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
                { error: "Unit ID is required" },
                { status: 400 }
            );
        }

        if (body.name && !body.name.trim()) {
            return NextResponse.json(
                { error: "Unit name cannot be empty" },
                { status: 400 }
            );
        }

        const updatedUnit = await updateUnit(id, {
            name: body.name,
        });

        return NextResponse.json(updatedUnit, { status: 200 });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update unit" },
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

        if (!id) {
            return NextResponse.json(
                { error: "Unit ID is required" },
                { status: 400 }
            );
        }

        // Check if charges exist for this unit
        const chargeCount = await getChargeCountByUnit(id);
        if (chargeCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete unit. Charges exist for this unit. Please delete the charges first." },
                { status: 409 }
            );
        }

        const deletedUnit = await deleteUnit(id);
        return NextResponse.json(deletedUnit, { status: 200 });
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to delete unit" },
            { status: 500 }
        );
    }
}
