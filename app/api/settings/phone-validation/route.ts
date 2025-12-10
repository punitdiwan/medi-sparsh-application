import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { settings } from "@/db/schema";
import { eq ,and} from "drizzle-orm";
import { getCurrentHospital } from "@/lib/tenant";


export async function GET() {
  try {
    const hospital = await getCurrentHospital();

    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.organizationId, hospital.hospitalId));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orgId, key, value } = await req.json();

    if (typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Key is required" },
        { status: 400 }
      );
    }

    if (typeof value !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Value must be boolean" },
        { status: 400 }
      );
    }

    const stringValue = value ? "true" : "false";

    const updated = await db
      .update(settings)
      .set({
        value: stringValue,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(settings.key, key), eq(settings.organizationId, orgId)))
      .returning();

    if (updated.length > 0) {
      return NextResponse.json({
        success: true,
        data: updated[0],
      });
    }

    // const inserted = await db
    //   .insert(settings)
    //   .values({
    //     key,
    //     value: stringValue,
    //     organizationId: orgId,
    //     createdAt: new Date().toISOString(),
    //   })
    //   .returning();

    // return NextResponse.json({
    //   success: true,
    //   data: inserted[0],
    // });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

