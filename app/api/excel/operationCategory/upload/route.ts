export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { operationCategories } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

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

    // 🔹 DB existing categories
    const existing = await db
      .select({ name: operationCategories.name })
      .from(operationCategories)
      .where(
        and(
          eq(operationCategories.hospitalId, org.id),
          eq(operationCategories.isDeleted, false)
        )
      );

    const dbNames = new Set(existing.map(e => e.name.toLowerCase()));
    const excelNames = new Set<string>();

    const validRows: { name: string }[] = [];
    const errors: {
      row: number;
      error: string;
      data?: { name: string };
    }[] = [];

    // ======================
    // PASS 1 → VALIDATION
    // ======================
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const name = String(row.getCell(1).value || "").trim();

      // ✅ EMPTY ROW → SKIP
      if (!name) continue;

      const key = name.toLowerCase();

      if (excelNames.has(key)) {
        errors.push({
          row: i,
          error: "Duplicate category in Excel file",
          data: { name },
        });
        continue;
      }

      if (dbNames.has(key)) {
        errors.push({
          row: i,
          error: "Category already exists",
          data: { name },
        });
        continue;
      }

      excelNames.add(key);
      validRows.push({ name });
    }

    // ❌ IF ANY ERROR → NO INSERT
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    // ======================
    // PASS 2 → INSERT
    // ======================
    for (const row of validRows) {
      await db.insert(operationCategories).values({
        hospitalId: org.id,
        name: row.name,
      });
    }

    return NextResponse.json({
      success: true,
      inserted: validRows.length,
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error("Operation Category Excel Upload Error:", error);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
