import {
    updateTaxCategory,
    softDeleteTaxCategory,
    permanentlyDeleteTaxCategory,
    restoreTaxCategory,
    getChargeCountByTaxCategory
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
                { error: "Tax ID is required" },
                { status: 400 }
            );
        }

        if (body.name && !body.name.trim()) {
            return NextResponse.json(
                { error: "Tax name cannot be empty" },
                { status: 400 }
            );
        }

        const updatedTax = await updateTaxCategory(id, {
            name: body.name,
            percent: body.percent !== undefined ? String(body.percent) : undefined,
        });

        return NextResponse.json(updatedTax, { status: 200 });
    } catch (error) {
        console.error("PUT Error:", error);
        return NextResponse.json(
            { error: "Failed to update tax category" },
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
                { error: "Tax ID is required" },
                { status: 400 }
            );
        }

        if (permanent) {
            // Permanent Delete
            const deletedTax = await permanentlyDeleteTaxCategory(id);
            return NextResponse.json(deletedTax, { status: 200 });
        } else {
            // Soft Delete
            // Check dependencies first
            const chargeCount = await getChargeCountByTaxCategory(id);
            if (chargeCount > 0) {
                return NextResponse.json(
                    { error: "Cannot delete tax category. Charges exist for this category. Please delete the charges first." },
                    { status: 409 }
                );
            }

            const deletedTax = await softDeleteTaxCategory(id);
            return NextResponse.json(deletedTax, { status: 200 });
        }
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json(
            { error: "Failed to delete tax category" },
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
                { error: "Tax ID is required" },
                { status: 400 }
            );
        }

        const restoredTax = await restoreTaxCategory(id);
        return NextResponse.json(restoredTax, { status: 200 });
    } catch (error) {
        console.error("PATCH Error:", error);
        return NextResponse.json(
            { error: "Failed to restore tax category" },
            { status: 500 }
        );
    }
}
