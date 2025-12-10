import {
    updateChargeCategory,
    softDeleteChargeCategory,
    permanentlyDeleteChargeCategory,
    restoreChargeCategory,
    getChargeCountByChargeCategory
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

        const updatedCategory = await updateChargeCategory(id, {
            name: body.name,
            description: body.description,
            chargeTypeId: body.chargeTypeId,
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch (error) {
        console.error("PUT Charge Category Error:", error);
        return NextResponse.json(
            { error: "Failed to update charge category", details: String(error) },
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
            const deleted = await permanentlyDeleteChargeCategory(id);
            return NextResponse.json(deleted, { status: 200 });
        } else {
            // Soft Delete
            // Check dependencies first
            const chargeCount = await getChargeCountByChargeCategory(id);
            if (chargeCount > 0) {
                return NextResponse.json(
                    { error: "Cannot delete category. Charges exist for this category." },
                    { status: 409 }
                );
            }

            const deleted = await softDeleteChargeCategory(id);
            return NextResponse.json(deleted, { status: 200 });
        }
    } catch (error) {
        console.error("DELETE Charge Category Error:", error);
        return NextResponse.json(
            { error: "Failed to delete charge category", details: String(error) },
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

        const restored = await restoreChargeCategory(id);
        return NextResponse.json(restored, { status: 200 });
    } catch (error) {
        console.error("PATCH Charge Category Error:", error);
        return NextResponse.json(
            { error: "Failed to restore charge category", details: String(error) },
            { status: 500 }
        );
    }
}
