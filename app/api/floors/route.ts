import { getFloorsByHospital, getDeletedFloorsByHospital, createFloor } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";
    
    let floorsData;
    if (showDeleted) {
      floorsData = await getDeletedFloorsByHospital(hospital.hospitalId);
    } else {
      floorsData = await getFloorsByHospital(hospital.hospitalId);
    }
    
    return NextResponse.json(floorsData, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch floors" },
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
        { error: "Floor name is required" },
        { status: 400 }
      );
    }

    const newFloor = await createFloor({
      hospitalId: hospital.hospitalId,
      name: body.name,
      description: body.description,
    });

    return NextResponse.json(newFloor, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create floor" },
      { status: 500 }
    );
  }
}
