import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { charges, chargeCategories, chargeTypes, units, taxCategories } from "@/db/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitalId = org.id;

    /* ===============================
        Fetch dropdown data
    =============================== */
    const [typeList, categoryList, unitList, taxList] = await Promise.all([
      db.select().from(chargeTypes).where(eq(chargeTypes.hospitalId, hospitalId)),
      db.select().from(chargeCategories).where(eq(chargeCategories.hospitalId, hospitalId)),
      db.select().from(units),
      db.select().from(taxCategories).where(eq(taxCategories.hospitalId, hospitalId)),
    ]);

    /* ===============================
        Workbook
    =============================== */
    const workbook = new ExcelJS.Workbook();

    /* ===============================
        MAIN SHEET
    =============================== */
    const mainSheet = workbook.addWorksheet("Charges");

    // Header row
    mainSheet.addRow([
      "name",
      "charge_type",
      "charge_category",
      "unit",
      "tax_category",
      "amount",
      "description",
    ]);

    // Empty rows for user input
    for (let i = 0; i < 500; i++) {
      mainSheet.addRow([]);
    }

    /* ===============================
        DROPDOWN SHEETS
    =============================== */
    const typeSheet = workbook.addWorksheet("ChargeTypes");
    typeSheet.addRow(["name"]);
    typeList.forEach((t) => typeSheet.addRow([t.name]));

    const categorySheet = workbook.addWorksheet("ChargeCategories");
    categorySheet.addRow(["name"]);
    categoryList.forEach((c) => categorySheet.addRow([c.name]));

    const unitSheet = workbook.addWorksheet("Units");
    unitSheet.addRow(["name"]);
    unitList.forEach((u) => unitSheet.addRow([u.name]));

    const taxSheet = workbook.addWorksheet("TaxCategories");
    taxSheet.addRow(["name"]);
    taxList.forEach((t) => taxSheet.addRow([t.name]));

    /* ===============================
        Apply dropdowns
    =============================== */
    for (let row = 2; row <= 500; row++) {
      mainSheet.getCell(`B${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`ChargeTypes!$A$2:$A$${typeList.length + 1}`],
      };

      mainSheet.getCell(`C${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`ChargeCategories!$A$2:$A$${categoryList.length + 1}`],
      };

      mainSheet.getCell(`D${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`Units!$A$2:$A$${unitList.length + 1}`],
      };

      mainSheet.getCell(`E${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`TaxCategories!$A$2:$A$${taxList.length + 1}`],
      };
    }

    /* ===============================
        Export file
    =============================== */
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="charges_template.xlsx"',
      },
    });
  } catch (error) {
    console.error("Charges template generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
