export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getCurrentHospital } from "@/lib/tenant";
import { createMedicineUnit } from "@/lib/actions/medicineUnits";

export async function POST(request: NextRequest) {
  try {
    const hospital = await getCurrentHospital();

    if (!hospital) {
      console.warn("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.warn("No file received");
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];

    if (!sheet) {
      console.warn("No sheet found in Excel file");
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 });
    }

    let successCount = 0;
    const errors: { row: number; error: string }[] = [];

    const toString = (value: unknown): string | null => {
      if (value === undefined || value === null) return null;
      if (value instanceof Date) return value.toISOString().split("T")[0];
      return String(value).trim();
    };

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const values = row.values as any[];

      const name = toString(values[1]);

      try {
        if (!name) throw new Error("Unit name is required");

        await createMedicineUnit({ name });

        successCount++;
      } catch (err: any) {
        console.error(`Row ${i} failed:`, err?.message || err);
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
    console.error("Hospital Charge Unit Upload Error:", err);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
