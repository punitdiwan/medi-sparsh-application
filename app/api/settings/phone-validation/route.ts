import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/migrations/schema";
import { eq ,and} from "drizzle-orm";


export async function GET() {
  try {
    const result = await db.select().from(settings);

    if (result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    } else {
      // Default to false if not found
      return NextResponse.json({ success: true, data: { value: "false" } });
    }
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch setting" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { orgId, key, value } = await req.json();

    if (typeof value !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid value, must be boolean" },
        { status: 400 }
      );
    }

    const stringValue = String(value);

    const updateResult = await db
      .update(settings)
      .set({ value: stringValue, updatedAt: new Date().toISOString() })
      .where(
        and(
          eq(settings.key, key),
          eq(settings.organizationId, orgId)
        )
      );

    if (updateResult.length > 0) {
      return NextResponse.json({ success: true, data: { key, value: stringValue } });
    }


    return NextResponse.json({ success: true, data: { key, value: stringValue } });

  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update setting" },
      { status: 500 }
    );
  }
}

