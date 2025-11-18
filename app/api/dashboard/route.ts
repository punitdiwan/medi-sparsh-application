import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { getCurrentHospital } from "@/lib/tenant";
import { getUserRole } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { appointments, patients, userInAuth as userTable } from "@/lib/db/migrations/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { cookies } from "next/headers";

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {

  try {
    // const cookieStore = await cookies();
    // const userCookie = cookieStore.get("userData");
    // console.log("userCookie",userCookie);
    const currentUser = await getCurrentUser();
    const hospital = await getCurrentHospital();

    // Get user's role in the organization
    const userRole = await getUserRole(currentUser.id, hospital.hospitalId);

    // Determine if we should filter by doctor
    const filterByDoctor = userRole === "doctor";
    const doctorUserId = filterByDoctor ? currentUser.id : null;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build base query conditions
    const baseConditions = doctorUserId
      ? and(
          eq(appointments.hospitalId, hospital.hospitalId),
          eq(appointments.doctorUserId, doctorUserId)
        )
      : eq(appointments.hospitalId, hospital.hospitalId);

    // Get today's appointments count
    const todayAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          baseConditions,
          gte(appointments.appointmentDate, today.toISOString().split("T")[0]),
          lte(appointments.appointmentDate, today.toISOString().split("T")[0])
        )
      );

    // Get total appointments count
    const totalAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(baseConditions);

    // Get completed appointments count
    const completedAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(and(baseConditions, eq(appointments.status, "completed")));

    // Get pending appointments count
    const pendingAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(
        and(
          baseConditions,
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      );

    // Get upcoming appointments for today
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientName: patients.name,
        doctorName: userTable.name,
        purpose: appointments.reason,
        time: appointments.appointmentTime,
        date: appointments.appointmentDate,
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .innerJoin(userTable, eq(appointments.doctorUserId, userTable.id))
      .where(
        and(
          baseConditions,
          gte(appointments.appointmentDate, today.toISOString().split("T")[0]),
          sql`${appointments.status} IN ('scheduled', 'confirmed')`
        )
      )
      .orderBy(appointments.appointmentDate, appointments.appointmentTime)
      .limit(5);

    // Get monthly appointment trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await db
      .select({
        month: sql<string>`TO_CHAR(${appointments.appointmentDate}::date, 'Month')`,
        consultations: sql<number>`COUNT(CASE WHEN ${appointments.isFollowUp} = false THEN 1 END)`,
        followups: sql<number>`COUNT(CASE WHEN ${appointments.isFollowUp} = true THEN 1 END)`,
      })
      .from(appointments)
      .where(
        and(
          baseConditions,
          gte(appointments.appointmentDate, sixMonthsAgo.toISOString().split("T")[0])
        )
      )
      .groupBy(sql`TO_CHAR(${appointments.appointmentDate}::date, 'Month')`)
      .orderBy(sql`MIN(${appointments.appointmentDate})`);

    // Get appointment distribution by status
    const statusDistribution = await db
      .select({
        type: appointments.status,
        count: sql<number>`count(*)`,
      })
      .from(appointments)
      .where(baseConditions)
      .groupBy(appointments.status);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          todayPatients: Number(todayAppointments[0]?.count || 0),
          totalAppointments: Number(totalAppointments[0]?.count || 0),
          completed: Number(completedAppointments[0]?.count || 0),
          pending: Number(pendingAppointments[0]?.count || 0),
        },
        upcomingAppointments: upcomingAppointments.map((apt) => ({
          id: apt.id,
          patientId: apt.patientId,
          patientName: apt.patientName,
          doctorName: apt.doctorName,
          purpose: apt.purpose || "General Consultation",
          time: apt.time,
          date: apt.date,
        })),
        monthlyTrends: monthlyTrends.map((trend) => ({
          month: trend.month.trim(),
          consultations: Number(trend.consultations),
          followups: Number(trend.followups),
        })),
        statusDistribution: statusDistribution.map((item) => ({
          type: item.type,
          count: Number(item.count),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
