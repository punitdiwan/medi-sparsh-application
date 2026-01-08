import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { bedsTypes, bedGroups, floors } from "@/db/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  const org = await getActiveOrganization();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hospitalId = org.id;

  // 🔹 Fetch dropdown data
  const bedTypeList = await db
    .select()
    .from(bedsTypes)
    .where(eq(bedsTypes.hospitalId, hospitalId));

  const bedGroupList = await db
    .select()
    .from(bedGroups)
    .where(eq(bedGroups.hospitalId, hospitalId));

  const floorList = await db
    .select()
    .from(floors)
    .where(eq(floors.hospitalId, hospitalId));

  // 📘 Workbook
  const workbook = new ExcelJS.Workbook();

  /* ===============================
      MAIN BED SHEET
  =============================== */
  const mainSheet = workbook.addWorksheet("Beds");

  mainSheet.addRow([
    "bed_name",
    "bed_type",
    "bed_group",
    "floor",
  ]);

  // Empty rows for user input
  for (let i = 0; i < 500; i++) {
    mainSheet.addRow([]);
  }

  /* ===============================
      DROPDOWN SHEETS
  =============================== */
  const bedTypeSheet = workbook.addWorksheet("BedTypes");
  bedTypeSheet.addRow(["name"]);
  bedTypeList.forEach((t) => bedTypeSheet.addRow([t.name]));

  const bedGroupSheet = workbook.addWorksheet("BedGroups");
  bedGroupSheet.addRow(["name"]);
  bedGroupList.forEach((g) => bedGroupSheet.addRow([g.name]));

  const floorSheet = workbook.addWorksheet("Floors");
  floorSheet.addRow(["name"]);
  floorList.forEach((f) => floorSheet.addRow([f.name]));

  /* ===============================
      APPLY DROPDOWNS
  =============================== */
  for (let row = 2; row <= 500; row++) {
    // Bed Type dropdown
    mainSheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`BedTypes!$A$2:$A$${bedTypeList.length + 1}`],
    };

    // Bed Group dropdown
    mainSheet.getCell(`C${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`BedGroups!$A$2:$A$${bedGroupList.length + 1}`],
    };

    // Floor dropdown
    mainSheet.getCell(`D${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Floors!$A$2:$A$${floorList.length + 1}`],
    };
  }

  // 📤 Export file
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="beds_template.xlsx"',
    },
  });
}
