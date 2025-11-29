import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { medicineCategories, medicineCompanies, medicineUnits } from "@/lib/db/migrations/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  const org = await getActiveOrganization();
    if (!org) {
        return { error: "Unauthorized" };
    }
  const hospitalId = org.id;

  const categories = await db
    .select()
    .from(medicineCategories)
    .where(eq(medicineCategories.hospitalId, hospitalId));
  const companies = await db
    .select()
    .from(medicineCompanies)
    .where(eq(medicineCompanies.hospitalId, hospitalId));
  const units = await db
    .select()
    .from(medicineUnits)
    .where(eq(medicineUnits.hospitalId, hospitalId));

  const workbook = new ExcelJS.Workbook();

  const mainSheet = workbook.addWorksheet("Medicines");

  mainSheet.addRow([
    "name",
    "category_name",
    "company_name",
    "unit_name",
    "notes",
  ]);

  for (let i = 0; i < 500; i++) {
    mainSheet.addRow([]);
  }

  const catSheet = workbook.addWorksheet("Categories");
  catSheet.addRow(["name"]);
  categories.forEach((c) => catSheet.addRow([c.name]));

  const compSheet = workbook.addWorksheet("Companies");
  compSheet.addRow(["name"]);
  companies.forEach((c) => compSheet.addRow([c.name]));

  const unitSheet = workbook.addWorksheet("Units");
  unitSheet.addRow(["name"]);
  units.forEach((u) => unitSheet.addRow([u.name]));

  for (let row = 2; row <= 500; row++) {
    mainSheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Categories!$A$2:$A$${categories.length + 1}`],
    };

    mainSheet.getCell(`C${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Companies!$A$2:$A$${companies.length + 1}`],
    };

    mainSheet.getCell(`D${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Units!$A$2:$A$${units.length + 1}`],
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="medicines_template.xlsx"',
    },
  });
}