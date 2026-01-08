import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { chargeCategories, chargeTypes } from "@/db/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function POST(req: Request) {
  try {

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 });
    }

    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [typeList, existingCategories] = await Promise.all([
      db.select().from(chargeTypes).where(eq(chargeTypes.hospitalId, org.id)),
      db
        .select()
        .from(chargeCategories)
        .where(eq(chargeCategories.hospitalId, org.id)),
    ]);

    const chargeTypeMap = new Map(
      typeList.map((t) => [t.name.toLowerCase(), t.id])
    );

    const dbNameSet = new Set(
      existingCategories.map((c) => c.name.toLowerCase())
    );
    const excelNameSet = new Set<string>();

    const errors: { row: number; error: string }[] = [];
    const rowsToInsert: {
      name: string;
      description: string | null;
      chargeTypeId: string;
      rowNumber: number;
    }[] = [];

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const name = row.getCell(1).value?.toString().trim();
      const chargeTypeName = row.getCell(2).value?.toString().trim();
      const description = row.getCell(3).value?.toString() || null;

      if (!name && !chargeTypeName && !description) continue;

      if (!name || !chargeTypeName) {
        errors.push({
          row: rowNumber,
          error: "Name and Charge Type are required",
        });
        continue;
      }

      const nameKey = name.toLowerCase();

      if (excelNameSet.has(nameKey)) {
        errors.push({
          row: rowNumber,
          error: "Duplicate category in Excel",
        });
        continue;
      }

      if (dbNameSet.has(nameKey)) {
        errors.push({
          row: rowNumber,
          error: "Category already exists in database",
        });
        continue;
      }

      const chargeTypeId = chargeTypeMap.get(chargeTypeName.toLowerCase());
      if (!chargeTypeId) {
        errors.push({
          row: rowNumber,
          error: "Invalid charge type name",
        });
        continue;
      }

      excelNameSet.add(nameKey);

      rowsToInsert.push({
        name,
        description,
        chargeTypeId,
        rowNumber,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    let inserted = 0;

    for (const row of rowsToInsert) {
      await db.insert(chargeCategories).values({
        hospitalId: org.id,
        name: row.name,
        description: row.description,
        chargeTypeId: row.chargeTypeId,
      });

      inserted++;
    }

    return NextResponse.json({
      success: true,
      inserted,
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error("Charge Category Excel Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to process Excel file" },
      { status: 500 }
    );
  }
}
