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

type RowError = {
  row: number;
  error: string;
  data: {
    medicineName: string;
    categoryName: string;
    companyName: string;
    unitName: string;
    groupName: string;
  };
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    const org = await getActiveOrganization();
    if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [categories, companies, units, groups, existingMedicines] = await Promise.all([
      db.select().from(medicineCategories).where(eq(medicineCategories.hospitalId, org.id)),
      db.select().from(medicineCompanies).where(eq(medicineCompanies.hospitalId, org.id)),
      db.select().from(medicineUnits).where(eq(medicineUnits.hospitalId, org.id)),
      db.select().from(medicineGroups).where(eq(medicineGroups.hospitalId, org.id)),
      db.select({ name: pharmacyMedicines.name }).from(pharmacyMedicines)
        .where(eq(pharmacyMedicines.hospitalId, org.id)),
    ]);

    const excelDuplicateSet = new Set<string>();
    const dbDuplicateSet = new Set(
      existingMedicines.map(m => m.name.toLowerCase())
    );

    const rowsToInsert: any[] = [];
    const errors: RowError[] = [];

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const medicineName = row.getCell(1).text.trim();
      const categoryName = row.getCell(2).text.trim();
      const companyName = row.getCell(3).text.trim();
      const unitName = row.getCell(4).text.trim();
      const groupName = row.getCell(5).text.trim();

      if (!medicineName && !categoryName && !companyName && !unitName && !groupName) continue;

      const rowData = { medicineName, categoryName, companyName, unitName, groupName };

      if (!medicineName || !categoryName || !companyName || !unitName || !groupName) {
        errors.push({ row: rowNumber, error: "Missing required fields", data: rowData });
        continue;
      }

      const category = categories.find(c => c.name === categoryName);
      const company = companies.find(c => c.name === companyName);
      const unit = units.find(u => u.name === unitName);
      const group = groups.find(g => g.name === groupName);

      if (!category || !company || !unit || !group) {
        errors.push({ row: rowNumber, error: "Invalid category / company / unit / group", data: rowData });
        continue;
      }

      const key = medicineName.toLowerCase();

      if (excelDuplicateSet.has(key)) {
        errors.push({ row: rowNumber, error: "Duplicate medicine in Excel", data: rowData });
        continue;
      }

      if (dbDuplicateSet.has(key)) {
        errors.push({ row: rowNumber, error: "Medicine already exists in DB", data: rowData });
        continue;
      }

      rowsToInsert.push({
        hospitalId: org.id,
        name: medicineName,
        categoryId: category.id,
        companyId: company.id,
        unitId: unit.id,
        groupId: group.id,
      });

      excelDuplicateSet.add(key);
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    await db.insert(pharmacyMedicines).values(rowsToInsert);

    return NextResponse.json({
      success: true,
      inserted: rowsToInsert.length,
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error("🔥 Excel upload error:", error);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
