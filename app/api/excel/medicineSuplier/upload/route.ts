import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/db";
import { medicineSuppliers } from "@/drizzle/schema";
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
    const existingSuppliers = await db
      .select({ supplierName: medicineSuppliers.supplierName })
      .from(medicineSuppliers)
      .where(eq(medicineSuppliers.hospitalId, org.id));

    const dbNamesSet = new Set(existingSuppliers.map((s) => s.supplierName.toLowerCase()));
    const excelNamesSet = new Set<string>();

    const validRows: {
      supplierName: string;
      contactNumber: string;
      address: string;
      contactPerson: string;
      contactPersonNumber: string;
      drugLicenseNumber: string;
    }[] = [];

    const errors: { row: number; error: string; data?: any }[] = [];

    // ================= PASS 1: VALIDATION =================
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const supplierName = String(row.getCell(1).value || "").trim();
      const contactNumber = String(row.getCell(2).value || "").trim();
      const address = String(row.getCell(3).value || "").trim();
      const contactPerson = String(row.getCell(4).value || "").trim();
      const contactPersonNumber = String(row.getCell(5).value || "").trim();
      const drugLicenseNumber = String(row.getCell(6).value || "").trim();

      // Ignore empty rows
      if (!supplierName && !contactNumber && !address && !contactPerson && !contactPersonNumber && !drugLicenseNumber) continue;

      // Validation
      if (!supplierName) {
        errors.push({ row: i, error: "Supplier name is required" });
        continue;
      }
      if (!contactNumber) {
        errors.push({ row: i, error: "Contact number is required", data: { supplierName } });
        continue;
      }
      if (!address) {
        errors.push({ row: i, error: "Address is required", data: { supplierName } });
        continue;
      }
      if (!contactPerson) {
        errors.push({ row: i, error: "Contact person is required", data: { supplierName } });
        continue;
      }
      if (!contactPersonNumber) {
        errors.push({ row: i, error: "Contact person number is required", data: { supplierName } });
        continue;
      }
      if (!drugLicenseNumber) {
        errors.push({ row: i, error: "Drug license number is required", data: { supplierName } });
        continue;
      }

      const key = supplierName.toLowerCase();

      if (excelNamesSet.has(key)) {
        errors.push({ row: i, error: "Duplicate supplier in Excel", data: { supplierName } });
        continue;
      }

      if (dbNamesSet.has(key)) {
        errors.push({ row: i, error: "Supplier already exists in database", data: { supplierName } });
        continue;
      }

      excelNamesSet.add(key);

      validRows.push({
        supplierName,
        contactNumber,
        address,
        contactPerson,
        contactPersonNumber,
        drugLicenseNumber,
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
    if (validRows.length === 0) {
        return NextResponse.json({
            success: false,
            inserted: 0,
            failed: errors.length || 0,
            errors: errors.length ? errors : [{ row: 0, error: "Atleast One data is required" }]
        });
        }

    // ================= PASS 2: INSERT =================
    const insertedSuppliers = await db
      .insert(medicineSuppliers)
      .values(validRows.map((s) => ({
        hospitalId: org.id,
        ...s,
        isDeleted: false,
      })))
      .returning();

    return NextResponse.json({
      success: true,
      inserted: insertedSuppliers.length,
      failed: 0,
      errors: [],
      data: insertedSuppliers,
    });
  } catch (error) {
    console.error("Medicine Supplier Excel Upload Error:", error);
    return NextResponse.json({ error: "Excel upload failed" }, { status: 500 });
  }
}
