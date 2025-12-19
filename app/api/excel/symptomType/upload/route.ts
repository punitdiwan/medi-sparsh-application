export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import ExcelJS from "exceljs"
import { createSymptomType } from "@/lib/actions/symptomTypes"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const sheet = workbook.worksheets[0]
    if (!sheet) {
      return NextResponse.json({ error: "Invalid Excel file" }, { status: 400 })
    }

    let inserted = 0
    const errors: { row: number; error: string }[] = []

    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i)
      const name = String(row.getCell(1).value || "").trim()

      try {
        if (!name) throw new Error("Symptom name is required")

        // 🔥 Reuse single-upload logic
        const result = await createSymptomType({ name })

        if (result?.error) {
          throw new Error(result.error)
        }

        inserted++
      } catch (err: any) {
        errors.push({
          row: i,
          error: err.message || "Failed to upload",
        })
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      failed: errors.length,
      errors,
    })
  } catch (error) {
    console.error("Symptom Type Excel Upload Error:", error)
    return NextResponse.json(
      { error: "Excel upload failed" },
      { status: 500 }
    )
  }
}
