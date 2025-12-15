// export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { createMedicineGroup } from "@/lib/actions/medicineGroups";

export async function POST(req: NextRequest) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 });
    }

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    const toString = (value: unknown) => {
      if (value === null || value === undefined) return null;
      return String(value).trim();
    };

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const groupName = toString(row.getCell(1).value);

      console.log(`Processing row ${rowNumber}: ${groupName}`);

      try {
        if (!groupName) throw new Error("Group name is required");

        // Use your action to create group
        const result = await createMedicineGroup({ name: groupName });

        if (result.error) {
          throw new Error(result.error);
        }

        successCount++;
        console.log(`Inserted row ${rowNumber}: ${groupName}`);
      } catch (err: any) {
        console.error(`Row ${rowNumber} error:`, err.message);
        errors.push({
          row: rowNumber,
          error: err?.message || "Failed to create group",
        });
      }
    }

    return NextResponse.json({
      success: true,
      inserted: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Medicine Groups Excel Upload Error:", error);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
