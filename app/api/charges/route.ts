import { getChargesByHospital, getDeletedChargesByHospital, createCharge } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";

        let data;
        if (showDeleted) {
            data = await getDeletedChargesByHospital(hospital.hospitalId);
        } else {
            data = await getChargesByHospital(hospital.hospitalId);
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("GET Charges Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch charges", details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const body = await req.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        if (!body.chargeCategoryId || !body.chargeTypeId || !body.taxCategoryId || !body.unitId) {
            return NextResponse.json(
                { error: "All fields (Category, Type, Tax, Unit) are required" },
                { status: 400 }
            );
        }

        const newCharge = await createCharge({
            hospitalId: hospital.hospitalId,
            name: body.name,
            description: body.description,
            amount: body.amount,
            chargeCategoryId: body.chargeCategoryId,
            chargeTypeId: body.chargeTypeId,
            taxCategoryId: body.taxCategoryId,
            unitId: body.unitId,
        });

        return NextResponse.json(newCharge, { status: 201 });
    } catch (error) {
        console.error("POST Charge Error:", error);
        return NextResponse.json(
            { error: "Failed to create charge", details: String(error) },
            { status: 500 }
        );
    }
}
