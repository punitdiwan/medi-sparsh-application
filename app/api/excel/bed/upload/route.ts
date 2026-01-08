import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { beds, bedsTypes, bedGroups, floors } from "@/db/schema";

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

    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bedTypes, bedGroupList, floorList, existingBeds] =
      await Promise.all([
        db.select().from(bedsTypes).where(eq(bedsTypes.hospitalId, org.id)),
        db.select().from(bedGroups).where(eq(bedGroups.hospitalId, org.id)),
        db.select().from(floors).where(eq(floors.hospitalId, org.id)),
        db.select().from(beds).where(eq(beds.hospitalId, org.id)),
      ]);

    const dbNamesSet = new Set(
      existingBeds.map((b: any) => b.name.toLowerCase())
    );
    const excelNamesSet = new Set<string>();

    const errors: { row: number; error: string }[] = [];
    const rowsToInsert: any[] = [];

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const bedName = row.getCell(1).value?.toString().trim();
      const bedTypeName = row.getCell(2).value?.toString().trim();
      const bedGroupName = row.getCell(3).value?.toString().trim();
      const floorName = row.getCell(4).value?.toString().trim();

      // Skip empty rows
      if (!bedName && !bedTypeName && !bedGroupName && !floorName) continue;

      // Required validation
      if (!bedName || !bedTypeName || !bedGroupName || !floorName) {
        errors.push({ row: rowNumber, error: "Missing required fields" });
        continue;
      }

      // Excel duplicate check
      const key = bedName.toLowerCase();
      if (excelNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Duplicate bed in Excel" });
        continue;
      }

      // DB duplicate check
      if (dbNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Bed already exists in DB" });
        continue;
      }

      // Map NAME → ID (same as medicine logic)
      const bedType = bedTypes.find(t => t.name === bedTypeName);
      const bedGroup = bedGroupList.find(g => g.name === bedGroupName);
      const floor = floorList.find(f => f.name === floorName);

      if (!bedType || !bedGroup || !floor) {
        errors.push({
          row: rowNumber,
          error: "Invalid bed type / bed group / floor name",
        });
        continue;
      }

      excelNamesSet.add(key);

      rowsToInsert.push({
        name: bedName,
        bedTypeId: bedType.id,
        bedGroupId: bedGroup.id,
        floorId: floor.id,
        hospitalId: org.id,
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

    let insertedCount = 0;

    for (const row of rowsToInsert) {
      await db.insert(beds).values({
        name: row.name,
        bedTypeId: row.bedTypeId,
        bedGroupId: row.bedGroupId,
        hospitalId: row.hospitalId,
      });

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      failed: 0,
      errors: [],
    });
  } catch (err) {
    console.error("Bed Excel upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
