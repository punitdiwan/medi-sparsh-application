import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { operationCategories } from "@/drizzle/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  const org = await getActiveOrganization();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await db
    .select()
    .from(operationCategories)
    .where(
      and(
        eq(operationCategories.hospitalId, org.id),
        eq(operationCategories.isDeleted, false)
      )
    );

  const workbook = new ExcelJS.Workbook();

  // ================= MAIN SHEET =================
  const sheet = workbook.addWorksheet("Operations");

  sheet.addRow(["operation_name", "category_name"]);

  // pre-fill rows
  for (let i = 0; i < 500; i++) {
    sheet.addRow([]);
  }

  // ================= CATEGORY SHEET =================
  const catSheet = workbook.addWorksheet("Categories");
  catSheet.addRow(["name"]);

  categories.forEach((c) => {
    catSheet.addRow([c.name]);
  });

  // ================= DROPDOWN =================
  for (let row = 2; row <= 501; row++) {
    sheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Categories!$A$2:$A$${categories.length + 1}`],
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="operations_template.xlsx"',
    },
  });
}
