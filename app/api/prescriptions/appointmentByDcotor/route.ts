import { NextRequest, NextResponse } from "next/server";
import { getCurrentHospital } from "@/lib/tenant";
import { db } from "@/lib/db";
import { prescriptions, patients, user } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const hospital = await getCurrentHospital();

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("appointmentId");

    console.log("🚀 appointmentId from API:", appointmentId);

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: "Missing appointmentId" },
        { status: 400 }
      );
    }

    // Fetch prescription with patient and doctor details
    const result = await db
      .select()
      .from(prescriptions)
      .innerJoin(patients, eq(prescriptions.patientId, patients.id))
      .innerJoin(user, eq(prescriptions.doctorUserId, user.id))
      .where(
        and(
          eq(prescriptions.appointmentId, appointmentId),
          eq(prescriptions.hospitalId, hospital.hospitalId)
        )
      );

    console.log("📝 Raw DB result:", result);

    if (!result || result.length === 0) {
      console.log("⚠️ No prescription found for this appointment.");
      return NextResponse.json({ success: true, data: [] });
    }

    // Map result
    const prescriptionData = result.map((row) => ({
      id: row.prescriptions.id,
      patientId: row.prescriptions.patientId,
      patientName: row.patients.name,
      doctorName: row.user.name,
      diagnosis: row.prescriptions.diagnosis,
      vitals: row.prescriptions.vitals,
      symptoms: row.prescriptions.symptoms,
      medicines: row.prescriptions.medicines,
      labTests: row.prescriptions.labTests,
      followUpRequired: row.prescriptions.followUpRequired,
      followUpDate: row.prescriptions.followUpDate,
      followUpNotes: row.prescriptions.followUpNotes,
      additionalNotes: row.prescriptions.additionalNotes,
      createdAt: row.prescriptions.createdAt,
    }));

    console.log("✅ Mapped prescription data:", prescriptionData);

    return NextResponse.json({ success: true, data: prescriptionData });
  } catch (error) {
    console.error("❌ Error fetching prescription by appointmentId:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch prescription",
      },
      { status: 500 }
    );
  }
}
