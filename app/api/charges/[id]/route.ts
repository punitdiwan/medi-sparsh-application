import {
    updateCharge,
    softDeleteCharge,
    permanentlyDeleteCharge,
    restoreCharge
} from "@/db/queries";
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
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const updatedCharge = await updateCharge(id, {
            name: body.name,
            description: body.description,
            amount: body.amount,
            chargeCategoryId: body.chargeCategoryId,
            chargeTypeId: body.chargeTypeId,
            taxCategoryId: body.taxCategoryId,
            unitId: body.unitId,
        });

        return NextResponse.json(updatedCharge, { status: 200 });
    } catch (error) {
        console.error("PUT Charge Error:", error);
        return NextResponse.json(
            { error: "Failed to update charge", details: String(error) },
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
                { error: "ID is required" },
                { status: 400 }
            );
        }

        if (permanent) {
            // Permanent Delete
            const deleted = await permanentlyDeleteCharge(id);
            return NextResponse.json(deleted, { status: 200 });
        } else {
            // Soft Delete
            const deleted = await softDeleteCharge(id);
            return NextResponse.json(deleted, { status: 200 });
        }
    } catch (error) {
        console.error("DELETE Charge Error:", error);
        return NextResponse.json(
            { error: "Failed to delete charge", details: String(error) },
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
                { error: "ID is required" },
                { status: 400 }
            );
        }

        const restored = await restoreCharge(id);
        return NextResponse.json(restored, { status: 200 });
    } catch (error) {
        console.error("PATCH Charge Error:", error);
        return NextResponse.json(
            { error: "Failed to restore charge", details: String(error) },
            { status: 500 }
        );
    }
}
