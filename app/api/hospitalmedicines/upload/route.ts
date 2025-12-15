import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import {
  medicineCategories,
  medicineCompanies,
  medicineUnits,
  medicineGroups,
  pharmacyMedicines,
} from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [categories, companies, units, groups] = await Promise.all([
      db.select().from(medicineCategories).where(eq(medicineCategories.hospitalId, org.id)),
      db.select().from(medicineCompanies).where(eq(medicineCompanies.hospitalId, org.id)),
      db.select().from(medicineUnits).where(eq(medicineUnits.hospitalId, org.id)),
      db.select().from(medicineGroups).where(eq(medicineGroups.hospitalId, org.id)),
    ]);

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const medicineName = row.getCell(1).text.trim();
      const categoryName = row.getCell(2).text.trim();
      const companyName = row.getCell(3).text.trim();
      const unitName = row.getCell(4).text.trim();
      const groupName = row.getCell(5).text.trim();

      if (!medicineName && !categoryName && !companyName && !unitName && !groupName) {
        continue;
      }

      if (!medicineName || !categoryName || !companyName || !unitName || !groupName) {
        errors.push({ row: rowNumber, error: "Missing required fields" });
        continue;
      }

      const category = categories.find(c => c.name === categoryName);
      const company = companies.find(c => c.name === companyName);
      const unit = units.find(u => u.name === unitName);
      const group = groups.find(g => g.name === groupName);

      if (!category || !company || !unit || !group) {
        errors.push({
          row: rowNumber,
          error: "Invalid category / company / unit / group",
        });
        continue;
      }

      try {
        await db.insert(pharmacyMedicines).values({
          hospitalId: org.id,
          name: medicineName,
          categoryId: category.id,
          companyId: company.id,
          unitId: unit.id,
          groupId: group.id,
        });

        successCount++;
      } catch (e) {
        errors.push({ row: rowNumber, error: "Duplicate or DB error" });
      }
    }

    return NextResponse.json({
      message: "Upload completed",
      inserted: successCount,
      errors,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
