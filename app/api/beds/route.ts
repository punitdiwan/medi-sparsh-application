import { getBedsByHospital, getDeletedBedsByHospital, createBed } from "@/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";
    
    let bedsData;
    if (showDeleted) {
      bedsData = await getDeletedBedsByHospital(hospital.hospitalId);
    } else {
      bedsData = await getBedsByHospital(hospital.hospitalId);
    }
    
    return NextResponse.json(bedsData, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch beds" },
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
        { error: "Bed name is required" },
        { status: 400 }
      );
    }

    if (!body.bedTypeId) {
      return NextResponse.json(
        { error: "Bed type is required" },
        { status: 400 }
      );
    }

    if (!body.bedGroupId) {
      return NextResponse.json(
        { error: "Bed group is required" },
        { status: 400 }
      );
    }

    const newBed = await createBed({
      hospitalId: hospital.hospitalId,
      name: body.name,
      bedTypeId: body.bedTypeId,
      bedGroupId: body.bedGroupId,
    });

    return NextResponse.json(newBed, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create bed" },
      { status: 500 }
    );
  }
}
