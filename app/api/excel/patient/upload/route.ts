export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { createPatient } from "@/db/queries";
import { z } from "zod";

const patientRowSchema = z.object({
  name: z.string().min(2, "Name is required"),
  gender: z
    .string()
    .transform((v) => v.toLowerCase())
    .refine((v) => ["male", "female", "other"].includes(v), {
      message: "Gender must be male, female or other",
    }),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address").optional().nullable(),
  dob: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  areaOrPin: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  referredByDr: z.string().optional().nullable(),
});

type RowError = {
  row: number;
  error: string;
  data?: Record<string, any>; 
};

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

    const rowsData: any[] = [];
    const errors: { row: number; error: string }[] = [];

    // ---------------- ROW ITERATION ----------------
    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);
      const values = row.values as any[];
       if (
          values.slice(1, 12).every(
            (val) => val === null || val === undefined || String(val).trim() === ""
          )
        ) {
          continue; 
        }

      const rawData = {
        name: getValue(values[1]),
        gender: getValue(values[2])?.toLowerCase(),
        dob: getDate(values[3]),
        email: getEmail(values[4]),
        mobileNumber: getValue(values[5]),
        address: getValue(values[6]),
        city: getValue(values[7]),
        state: getValue(values[8]),
        areaOrPin: getValue(values[9]),
        bloodGroup: getValue(values[10]),
        referredByDr: getValue(values[11]),
      };

      const parsed = patientRowSchema.safeParse(rawData);

      if (!parsed.success) {

        const message = parsed.error.issues.map((e:any) => e.message).join(", ");
        errors.push({
          row: rowNumber,
          error: message,
          data: rawData, 
        } as RowError);
      } else {
        rowsData.push(parsed.data);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        inserted: 0,
        failed: errors.length,
        errors,
      });
    }

    // ---------------- INSERT ALL ----------------
    for (const data of rowsData) {
      await createPatient({
        hospitalId: hospital.hospitalId,
        userId: null,
        name: data.name,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        email: data.email,
        dob: data.dob,
        address: data.address,
        city: data.city,
        state: data.state,
        areaOrPin: data.areaOrPin,
        bloodGroup: data.bloodGroup,
        referredByDr: data.referredByDr,
        scheduledBy: user.id,
        isDeleted: false,
      });
    }

    return NextResponse.json({
      success: true,
      inserted: rowsData.length,
      failed: 0,
      errors: [],
    });

  } catch (err) {
    console.error(" Patient Excel Upload Error:", err);
    return NextResponse.json({ error: "Excel upload failed" }, { status: 500 });
  }
}

