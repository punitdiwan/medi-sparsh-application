//export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createUnit } from "@/db/queries"; // your single insert function
import { getCurrentUser } from "@/lib/utils/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 });
    }

    let successCount = 0;
    const errors: { row: number; error: string }[] = [];

    const toString = (value: unknown): string | null => {
      if (!value) return null;
      if (value instanceof Date) return value.toISOString().split("T")[0];
      if (typeof value === "number" || typeof value === "string") return String(value).trim();
      return null;
    };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const values = row.values as any[];

      const name = toString(values[1]); 

      try {
        if (!name) throw new Error("Unit name is required");

        await createUnit({
          name,
        });

        successCount++;
      } catch (err: any) {
        errors.push({
          row: i,
          error: err?.message || "Failed to create unit",
        });
      }
    }

    return NextResponse.json({
      success: true,
      inserted: successCount,
      failed: errors.length,
      errors,
    });
  } catch (err) {
    console.error("HospitalChargeUnit Excel Upload Error:", err);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
