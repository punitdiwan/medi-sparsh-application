import { getBedGroupsByHospital, getDeletedBedGroupsByHospital, createBedGroup } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const showDeleted = req.nextUrl.searchParams.get("showDeleted") === "true";
    
    let bedGroupsData;
    if (showDeleted) {
      bedGroupsData = await getDeletedBedGroupsByHospital(hospital.hospitalId);
    } else {
      bedGroupsData = await getBedGroupsByHospital(hospital.hospitalId);
    }
    
    return NextResponse.json(bedGroupsData, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bed groups" },
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
        { error: "Bed group name is required" },
        { status: 400 }
      );
    }

    if (!body.floorId) {
      return NextResponse.json(
        { error: "Floor is required" },
        { status: 400 }
      );
    }

    const newBedGroup = await createBedGroup({
      hospitalId: hospital.hospitalId,
      name: body.name,
      floorId: body.floorId,
      description: body.description,
    });

    return NextResponse.json(newBedGroup, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create bed group" },
      { status: 500 }
    );
  }
}
