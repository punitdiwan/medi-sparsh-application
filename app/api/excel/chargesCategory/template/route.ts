import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { chargeTypes } from "@/db/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  const org = await getActiveOrganization();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hospitalId = org.id;

  const chargeTypeList = await db
    .select()
    .from(chargeTypes)
    .where(eq(chargeTypes.hospitalId, hospitalId));

  const workbook = new ExcelJS.Workbook();

  const mainSheet = workbook.addWorksheet("ChargeCategories");

  mainSheet.addRow([
    "name",
    "charge_type",
    "description",
  ]);

  for (let i = 0; i < 500; i++) {
    mainSheet.addRow([]);
  }

  const typeSheet = workbook.addWorksheet("ChargeTypes");
  typeSheet.addRow(["name"]);

  chargeTypeList.forEach((t) => {
    typeSheet.addRow([t.name]);
  });

  for (let row = 2; row <= 500; row++) {
    mainSheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`ChargeTypes!$A$2:$A$${chargeTypeList.length + 1}`],
    };
  }

  mainSheet.getRow(1).font = { bold: true };
  mainSheet.columns.forEach((col) => {
    col.width = 25;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="charge_categories_template.xlsx"',
    },
  });
}
