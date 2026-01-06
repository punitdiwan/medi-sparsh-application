export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { operations, operationCategories } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
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

    // ================= DB DATA =================
    const categories = await db
      .select()
      .from(operationCategories)
      .where(
        and(
          eq(operationCategories.hospitalId, org.id),
          eq(operationCategories.isDeleted, false)
        )
      );

    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );

    const existingOps = await db
      .select({ name: operations.name })
      .from(operations)
      .where(eq(operations.hospitalId, org.id));

    const dbNames = new Set(existingOps.map(o => o.name.toLowerCase()));
    const excelNames = new Set<string>();

    const validRows: {
      name: string;
      operationCategoryId: string;
    }[] = [];

    const errors: {
      row: number;
      error: string;
      data?: any;
    }[] = [];

    // ================= PASS 1: VALIDATION =================
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const name = String(row.getCell(1).value || "").trim();
      const categoryName = String(row.getCell(2).value || "").trim();

      // ✅ ignore empty rows
      if (!name && !categoryName) continue;

      if (!name) {
        errors.push({ row: i, error: "Operation name is required" });
        continue;
      }

      if (!categoryName) {
        errors.push({ row: i, error: "Category is required", data: { name } });
        continue;
      }

      const key = name.toLowerCase();

      if (excelNames.has(key)) {
        errors.push({
          row: i,
          error: "Duplicate operation in Excel",
          data: { name },
        });
        continue;
      }

      if (dbNames.has(key)) {
        errors.push({
          row: i,
          error: "Operation already exists",
          data: { name },
        });
        continue;
      }

      const categoryId = categoryMap.get(categoryName.toLowerCase());
      if (!categoryId) {
        errors.push({
          row: i,
          error: "Invalid category",
          data: { categoryName },
        });
        continue;
      }

      excelNames.add(key);
      validRows.push({
        name,
        operationCategoryId: categoryId,
      });
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
    for (const row of validRows) {
      await db.insert(operations).values({
        hospitalId: org.id,
        name: row.name,
        operationCategoryId: row.operationCategoryId,
      });
    }

    return NextResponse.json({
      success: true,
      inserted: validRows.length,
      failed: 0,
      errors: [],
    });

  } catch (error) {
    console.error("Operation Excel Upload Error:", error);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
