import { getModulesByHospital } from "@/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const hospital = await getCurrentHospital();
        const modules = await getModulesByHospital(hospital.hospitalId);

        return NextResponse.json(modules, { status: 200 });
    } catch (error) {
        console.error("GET Modules Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch modules", details: String(error) },
            { status: 500 }
        );
    }
}
