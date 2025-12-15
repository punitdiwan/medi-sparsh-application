export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createPatient } from "@/db/queries";

const getValue = (val: any): string | null => {
  if (val === undefined || val === null) return null;
  const v = String(val).trim();
  return v === "" ? null : v;
};

const getEmail = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === "object" && val.text) return val.text.trim();
  return String(val).trim();
};

const getDate = (val: any): string | null => {
  if (!val) return null;

  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }

  if (typeof val === "number") {
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toISOString().split("T")[0];
  }

  if (typeof val === "string") {
    return val.trim();
  }

  return null;
};


export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const hospital = await getCurrentHospital();


    if (!user || !hospital) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
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


    let successCount = 0;
    const errors: { row: number; error: string }[] = [];

    /* ---------------- ROW ITERATION ---------------- */

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const values = row.values as any[];

      try {
        const name = getValue(values[1]);
        const gender = getValue(values[2]);
        const mobileNumber = getValue(values[5]);
        const email = getEmail(values[4]);

        console.log("🧍 Patient data:", {
          name,
          gender,
          mobileNumber,
          email,
        });
        if (!name || !gender || !mobileNumber) {
          throw new Error("Name, Gender and Mobile Number are required");
        }

        await createPatient({
          hospitalId: hospital.hospitalId,
          userId: null,

          name,
          gender,
          mobileNumber,
          email,

          dob: getDate(values[3]),
          address: getValue(values[6]),
          city: getValue(values[7]),
          state: getValue(values[8]),
          areaOrPin: getValue(values[9]),
          bloodGroup: getValue(values[10]),
          referredByDr: getValue(values[11]),

          scheduledBy: user.id,
          isDeleted: false,
        });

        successCount++;
      } catch (err: any) {
        console.error(` Row ${rowNumber} failed:`, err.message);
        errors.push({
          row: rowNumber,
          error: err.message || "Failed to create patient",
        });
      }
    }

    return NextResponse.json({
      success: true,
      inserted: successCount,
      failed: errors.length,
      errors,
    });
  } catch (err) {
    console.error("🔥 Patient Excel Upload Error:", err);
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    );
  }
}
