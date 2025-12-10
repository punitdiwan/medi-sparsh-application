import { getTaxCategoriesByHospital, getDeletedTaxCategoriesByHospital, createTaxCategory } from "@/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";

        let taxData;
        if (showDeleted) {
            taxData = await getDeletedTaxCategoriesByHospital(hospital.hospitalId);
        } else {
            taxData = await getTaxCategoriesByHospital(hospital.hospitalId);
        }

        return NextResponse.json(taxData, { status: 200 });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch tax categories" },
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
                { error: "Tax name is required" },
                { status: 400 }
            );
        }

        if (body.percent === undefined || body.percent === null) {
            return NextResponse.json(
                { error: "Percentage is required" },
                { status: 400 }
            );
        }

        const newTax = await createTaxCategory({
            hospitalId: hospital.hospitalId,
            name: body.name,
            percent: String(body.percent),
        });

        return NextResponse.json(newTax, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create tax category" },
            { status: 500 }
        );
    }
}
