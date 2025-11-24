import { getChargeTypesByHospital, createChargeType } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const chargeTypes = await getChargeTypesByHospital(hospital.hospitalId);

        return NextResponse.json(chargeTypes, { status: 200 });
    } catch (error) {
        console.error("GET Charge Types Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch charge types", details: String(error) },
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
                { error: "Charge name is required" },
                { status: 400 }
            );
        }

        const newChargeType = await createChargeType({
            hospitalId: hospital.hospitalId,
            name: body.name,
            modules: body.modules || [], // Expecting array of module IDs
        });

        return NextResponse.json(newChargeType, { status: 201 });
    } catch (error) {
        console.error("POST Charge Type Error:", error);
        return NextResponse.json(
            { error: "Failed to create charge type" },
            { status: 500 }
        );
    }
}
