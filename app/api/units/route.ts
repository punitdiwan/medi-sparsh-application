import { getUnits, createUnit } from "@/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const unitsData = await getUnits();
        return NextResponse.json(unitsData, { status: 200 });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch units" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.name || !body.name.trim()) {
            return NextResponse.json(
                { error: "Unit name is required" },
                { status: 400 }
            );
        }

        const newUnit = await createUnit({
            name: body.name,
        });

        return NextResponse.json(newUnit, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json(
            { error: "Failed to create unit" },
            { status: 500 }
        );
    }
}
