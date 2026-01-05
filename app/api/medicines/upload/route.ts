// app/api/medicines/upload/route.ts
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db/index";
import { createMedicine } from "@/lib/actions/medicines";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { medicineCategories, medicineCompanies, medicineUnits, medicineGroups } from "@/db/schema";
import { medicines } from "@/drizzle/schema";

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
    if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch master data from DB
    const [categories, companies, units, groups, existingMedicines] = await Promise.all([
      db.select().from(medicineCategories).where(eq(medicineCategories.hospitalId, org.id)),
      db.select().from(medicineCompanies).where(eq(medicineCompanies.hospitalId, org.id)),
      db.select().from(medicineUnits).where(eq(medicineUnits.hospitalId, org.id)),
      db.select().from(medicineGroups).where(eq(medicineGroups.hospitalId, org.id)),
      db.select().from(medicines).where(eq(medicines.hospitalId, org.id)),
    ]);

    const dbNamesSet = new Set(existingMedicines.map((m: any) => m.name.toLowerCase()));
    const excelNamesSet = new Set<string>();

    const errors: { row: number; error: string }[] = [];
    const rowsToInsert: any[] = [];

    // Iterate Excel rows
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const medicineName = row.getCell(1).value?.toString().trim();
      const categoryName = row.getCell(2).value?.toString().trim();
      const companyName = row.getCell(3).value?.toString().trim();
      const unitName = row.getCell(4).value?.toString().trim();
      const groupName = row.getCell(5).value?.toString().trim();
      const notes = row.getCell(6).value?.toString() || null;

      // Skip completely empty rows
      if (!medicineName && !categoryName && !companyName && !unitName && !groupName) continue;

      // Required validation
      if (!medicineName || !categoryName || !companyName || !unitName || !groupName) {
        errors.push({ row: rowNumber, error: "Missing required fields" });
        continue;
      }

      // Excel duplicates
      const key = medicineName.toLowerCase();
      if (excelNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Duplicate medicine in Excel" });
        continue;
      }

      // DB duplicates
      if (dbNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Medicine already exists in DB" });
        continue;
      }

      // Map names to IDs
      const category = categories.find(c => c.name === categoryName);
      const company = companies.find(c => c.name === companyName);
      const unit = units.find(u => u.name === unitName);
      const group = groups.find(g => g.name === groupName);

      if (!category || !company || !unit || !group) {
        errors.push({ row: rowNumber, error: "Invalid category / company / unit / group name" });
        continue;
      }

      excelNamesSet.add(key);
      rowsToInsert.push({
        name: medicineName,
        categoryId: category.id,
        companyName: company.id,
        unitId: unit.id,
        groupId: group.id,
        notes,
        rowNumber,
      });
    }

    // If any row has errors, stop and return
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    // Insert all rows
    let insertedCount = 0;
    for (const row of rowsToInsert) {
      const result = await createMedicine({
        name: row.name,
        categoryId: row.categoryId,
        companyName: row.companyName,
        unitId: row.unitId,
        groupId: row.groupId,
        notes: row.notes,
      });

      if (result.error) {
        errors.push({ row: row.rowNumber, error: result.error });
      } else {
        insertedCount++;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      inserted: insertedCount,
      failed: errors.length,
      errors,
    });
  } catch (err) {
    console.error("Excel upload error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
