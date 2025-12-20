export const runtime = "nodejs";

import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { symptomTypes } from "@/db/schema";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function GET() {
  const org = await getActiveOrganization();
  if (!org) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hospitalId = org.id;

  // 👉 Fetch symptom types
  const types = await db
    .select()
    .from(symptomTypes)
    .where(
      and(
        eq(symptomTypes.hospitalId, hospitalId),
        eq(symptomTypes.isDeleted, false)
      )
    );

  const workbook = new ExcelJS.Workbook();

  /* ===============================
     Main Sheet : Symptoms
  =============================== */
  const mainSheet = workbook.addWorksheet("Symptoms");

  // Header row
  mainSheet.addRow([
    "name",              // Symptom Name
    "symptom_type_name", // Dropdown
    "description",       // Description
  ]);

  // Empty rows for user input
  for (let i = 0; i < 500; i++) {
    mainSheet.addRow([]);
  }

  /* ===============================
     Helper Sheet : Symptom Types
  =============================== */
  const typeSheet = workbook.addWorksheet("SymptomTypes");
  typeSheet.addRow(["name"]);

  types.forEach((t) => {
    typeSheet.addRow([t.name]);
  });

  /* ===============================
     Dropdown Validation
  =============================== */
  for (let row = 2; row <= 501; row++) {
    // Symptom Type dropdown (Column B)
    mainSheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`SymptomTypes!$A$2:$A$${types.length + 1}`],
      showErrorMessage: true,
      errorTitle: "Invalid Symptom Type",
      error: "Please select a symptom type from the list",
    };
  }

  /* ===============================
     Column Widths (UI friendly)
  =============================== */
  mainSheet.columns = [
    { width: 30 }, // name
    { width: 25 }, // symptom type
    { width: 60 }, // description
  ];

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="symptoms_template.xlsx"',
    },
  });
}
