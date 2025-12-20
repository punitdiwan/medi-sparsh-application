import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { symptoms, symptomTypes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

    // Load symptom types once
    const types = await db
      .select()
      .from(symptomTypes)
      .where(
        and(
          eq(symptomTypes.hospitalId, org.id),
          eq(symptomTypes.isDeleted, false)
        )
      );

    const errors: { row: number; error: string }[] = [];
    let successCount = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const symptomName = row.getCell(1).text.trim();
      const symptomTypeName = row.getCell(2).text.trim();
      const description = row.getCell(3).text.trim();

      // Skip empty rows
      if (!symptomName && !symptomTypeName && !description) {
        continue;
      }

      if (!symptomName || !symptomTypeName) {
        errors.push({
          row: rowNumber,
          error: "Symptom name and symptom type are required",
        });
        continue;
      }

      const symptomType = types.find(
        (t) => t.name === symptomTypeName
      );

      if (!symptomType) {
        errors.push({
          row: rowNumber,
          error: `Invalid symptom type: ${symptomTypeName}`,
        });
        continue;
      }

      try {
        await db.insert(symptoms).values({
          hospitalId: org.id,
          name: symptomName,
          symptomTypeId: symptomType.id,
          description: description || "",
        });

        successCount++;
      } catch (e) {
        errors.push({
          row: rowNumber,
          error: "Duplicate or database error",
        });
      }
    }

    return NextResponse.json({
      message: "Upload completed",
      inserted: successCount,
      errors,
    });
  } catch (error) {
    console.error("Symptom excel upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
