// app/api/medicines/upload/route.ts
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db/index";
import { createMedicine } from "@/lib/actions/medicines";
import {
  medicineCategories,
  medicineCompanies,
  medicineUnits,
  medicineGroups
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Convert file to Buffer (correct type for ExcelJS in Node.js)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheet = workbook.worksheets[0]; // Get the first worksheet

    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch dropdown data from DB
    const [categories, companies, units, groups] = await Promise.all([
      db
        .select()
        .from(medicineCategories)
        .where(eq(medicineCategories.hospitalId, org.id)),
      db
        .select()
        .from(medicineCompanies)
        .where(eq(medicineCompanies.hospitalId, org.id)),
      db
        .select()
        .from(medicineUnits)
        .where(eq(medicineUnits.hospitalId, org.id)),
      db
        .select()
        .from(medicineGroups)
        .where(eq(medicineGroups.hospitalId, org.id)),
    ]);

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const medicineName = row.getCell(1).value?.toString().trim();
      const categoryName = row.getCell(2).value?.toString().trim();
      const companyName = row.getCell(3).value?.toString().trim();
      const unitName = row.getCell(4).value?.toString().trim();
      const groupName = row.getCell(5).value?.toString().trim();
      const notes = row.getCell(6).value?.toString() || null;

      if (!medicineName && !categoryName && !companyName && !unitName && !groupName) {
        continue; // Skip empty rows
      }

      if (!medicineName || !categoryName || !companyName || !unitName || !groupName) {
        errors.push({ row: rowNumber, error: "Missing required fields" });
        continue;
      }

      const category = categories.find((c) => c.name === categoryName);
      const company = companies.find((c) => c.name === companyName);
      const unit = units.find((u) => u.name === unitName);
      const group = groups.find((g) => g.name === groupName);

      if (!category || !company || !unit || !group) {
        errors.push({
          row: rowNumber,
          error: "Invalid category / company / unit / group name",
        });
        continue;
      }

      const result = await createMedicine({
        name: medicineName,
        categoryId: category.id,
        companyName: company.id,
        unitId: unit.id,
        groupId: group.id,
        notes,
      });

      if (result.error) {
        errors.push({ row: rowNumber, error: result.error });
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: "Upload completed",
      inserted: successCount,
      errors,
    });
  } catch (err) {
    console.error("Excel upload error:", err);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
