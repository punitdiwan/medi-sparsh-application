import { getServicesByHospital, createService } from "@/db/queries";
import { getCurrentHospital } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
  try {
    const hospital = await getCurrentHospital();
    console.log("hospital",hospital);
    const services = await getServicesByHospital(hospital.hospitalId);
    console.log("service data on server",services);
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();
    const body = await req.json();
    
    const newService = await createService({
      hospitalId: hospital.hospitalId,
      name: body.name,
      amount: body.amount,
      description: body.description,
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

