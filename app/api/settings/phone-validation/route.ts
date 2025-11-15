import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema/settings";
import { eq } from "drizzle-orm";

const SETTING_KEY = "phone_validation_otp_enabled";

export async function GET() {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, SETTING_KEY));

    if (result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    } else {
      // Default to false if not found
      return NextResponse.json({ success: true, data: { key: SETTING_KEY, value: "false" } });
    }
  } catch (error) {
    console.error("Error fetching setting:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch setting" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { value } = await req.json();

    if (typeof value !== "boolean") {
      return NextResponse.json({ success: false, error: "Invalid value provided. Must be a boolean." }, { status: 400 });
    }

    const stringValue = String(value);

    const existingSetting = await db.select().from(settings).where(eq(settings.key, SETTING_KEY));

    if (existingSetting.length > 0) {
      // Update existing setting
      await db.update(settings).set({ value: stringValue, updatedAt: new Date() }).where(eq(settings.key, SETTING_KEY));
    } else {
      // Insert new setting
      await db.insert(settings).values({ key: SETTING_KEY, value: stringValue });
    }

    return NextResponse.json({ success: true, data: { key: SETTING_KEY, value: stringValue } });
  } catch (error) {
    console.error("Error updating setting:", error);
    return NextResponse.json({ success: false, error: "Failed to update setting" }, { status: 500 });
  }
}
