import { updateChargeType, deleteChargeType } from "@/lib/db/queries";
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
                { error: "Charge Type ID is required" },
                { status: 400 }
            );
        }

        if (body.name && !body.name.trim()) {
            return NextResponse.json(
                { error: "Charge name cannot be empty" },
                { status: 400 }
            );
        }

        const updatedChargeType = await updateChargeType(id, {
            name: body.name,
            modules: body.modules,
        });

        return NextResponse.json(updatedChargeType, { status: 200 });
    } catch (error) {
        console.error("PUT Charge Type Error:", error);
        return NextResponse.json(
            { error: "Failed to update charge type" },
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
                { error: "Charge Type ID is required" },
                { status: 400 }
            );
        }

        // Soft Delete
        const deletedChargeType = await deleteChargeType(id);
        return NextResponse.json(deletedChargeType, { status: 200 });
    } catch (error) {
        console.error("DELETE Charge Type Error:", error);
        return NextResponse.json(
            { error: "Failed to delete charge type" },
            { status: 500 }
        );
    }
}
