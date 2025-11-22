import { getChargeCategoriesByHospital, getDeletedChargeCategoriesByHospital, createChargeCategory } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";

        let data;
        if (showDeleted) {
            data = await getDeletedChargeCategoriesByHospital(hospital.hospitalId);
        } else {
            data = await getChargeCategoriesByHospital(hospital.hospitalId);
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("GET Charge Categories Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch charge categories", details: String(error) },
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

        if (!body.chargeTypeId) {
            return NextResponse.json(
                { error: "Charge Type is required" },
                { status: 400 }
            );
        }

        const newCategory = await createChargeCategory({
            hospitalId: hospital.hospitalId,
            name: body.name,
            description: body.description,
            chargeTypeId: body.chargeTypeId,
        });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("POST Charge Category Error:", error);
        return NextResponse.json(
            { error: "Failed to create charge category", details: String(error) },
            { status: 500 }
        );
    }
}
