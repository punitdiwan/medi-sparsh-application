import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { medicineCompanies } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const org = await getActiveOrganization();
    if (!org) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 });
    }

    // ================= DB DATA =================
    const existingCompanies = await db
      .select({ name: medicineCompanies.name })
      .from(medicineCompanies)
      .where(eq(medicineCompanies.hospitalId, org.id));

    const dbNames = new Set(existingCompanies.map((c) => c.name.toLowerCase()));
    const excelNames = new Set<string>();

    const validRows: { name: string }[] = [];
    const errors: { row: number; error: string; data?: any }[] = [];

    // ================= PASS 1: VALIDATION =================
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const name = String(row.getCell(1).value || "").trim();

      // Ignore completely empty rows
      if (!name) continue;

      const key = name.toLowerCase();

      if (excelNames.has(key)) {
        errors.push({ row: i, error: "Duplicate company in Excel", data: { name } });
        continue;
      }

      if (dbNames.has(key)) {
        errors.push({ row: i, error: "Company already exists in database", data: { name } });
        continue;
      }

      excelNames.add(key);
      validRows.push({ name });
    }

    // ❌ ALL OR NOTHING
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    // ================= PASS 2: INSERT =================
    const insertedCompanies = await db
      .insert(medicineCompanies)
      .values(validRows.map((c) => ({ hospitalId: org.id, name: c.name })))
      .returning();

    return NextResponse.json({
      success: true,
      inserted: insertedCompanies.length,
      failed: 0,
      errors: [],
      data: insertedCompanies,
    });
  } catch (error) {
    console.error("Medicine Company Excel Upload Error:", error);
    return NextResponse.json({ error: "Excel upload failed" }, { status: 500 });
  }
}
