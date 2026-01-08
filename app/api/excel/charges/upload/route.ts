import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { charges, chargeCategories, chargeTypes, units, taxCategories } from "@/db/schema";
import { createCharge } from "@/db/queries";

export async function POST(req: Request) {
  try {
    const org = await getActiveOrganization();
    if (!org) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    const [typeList, categoryList, unitList, taxList, existingCharges] = await Promise.all([
      db.select().from(chargeTypes).where(eq(chargeTypes.hospitalId, org.id)),
      db.select().from(chargeCategories).where(eq(chargeCategories.hospitalId, org.id)),
      db.select().from(units),
      db.select().from(taxCategories).where(eq(taxCategories.hospitalId, org.id)),
      db.select().from(charges).where(eq(charges.hospitalId, org.id)),
    ]);

    const dbNamesSet = new Set(existingCharges.map(c => c.name.toLowerCase()));
    const excelNamesSet = new Set<string>();
    const rowsToInsert: any[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const name = row.getCell(1).value?.toString().trim();
      const typeName = row.getCell(2).value?.toString().trim();
      const categoryName = row.getCell(3).value?.toString().trim();
      const unitName = row.getCell(4).value?.toString().trim();
      const taxName = row.getCell(5).value?.toString().trim();
      const amountValue = row.getCell(6).value;
      const description = row.getCell(7).value?.toString() || null;

      if (!name && !typeName && !categoryName && !unitName && !taxName && !amountValue) continue;
      if (!name || !typeName || !categoryName || !unitName || !taxName || amountValue === undefined) {
        errors.push({ row: rowNumber, error: "Missing required fields" });
        continue;
      }

      const key = name.toLowerCase();
      if (excelNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Duplicate name in Excel" });
        continue;
      }
      if (dbNamesSet.has(key)) {
        errors.push({ row: rowNumber, error: "Charge already exists in DB" });
        continue;
      }

      const type = typeList.find(t => t.name === typeName);
      const category = categoryList.find(c => c.name === categoryName);
      const unit = unitList.find(u => u.name === unitName);
      const tax = taxList.find(t => t.name === taxName);

      if (!type || !category || !unit || !tax) {
        errors.push({
          row: rowNumber,
          error: `Invalid reference: ${!type ? "Type " : ""}${!category ? "Category " : ""}${!unit ? "Unit " : ""}${!tax ? "Tax " : ""}`.trim(),
        });
        continue;
      }

      excelNamesSet.add(key);

      rowsToInsert.push({
        name,
        chargeTypeId: type.id,
        chargeCategoryId: category.id,
        unitId: unit.id,
        taxCategoryId: tax.id,
        amount: Number(amountValue),
        description,
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
      await createCharge({
        hospitalId: org.id,
        ...row,
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
    console.error("Charges Excel upload error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}
