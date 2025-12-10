import { getBedTypesByHospital, getDeletedBedTypesByHospital, createBedType } from "@/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";
    
    let bedTypesData;
    if (showDeleted) {
      bedTypesData = await getDeletedBedTypesByHospital(hospital.hospitalId);
    } else {
      bedTypesData = await getBedTypesByHospital(hospital.hospitalId);
    }
    
    return NextResponse.json(bedTypesData, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bed types" },
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
        { error: "Bed type name is required" },
        { status: 400 }
      );
    }

    const newBedType = await createBedType({
      hospitalId: hospital.hospitalId,
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(newBedType, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create bed type" },
      { status: 500 }
    );
  }
}
