import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { doctors, shifts, doctorShifts, staff, userInAuth } from "@/lib/db/migrations/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, session: sessionData } = session;
        const hospitalId = sessionData.activeOrganizationId;

        if (!hospitalId) {
            return NextResponse.json({ error: "Hospital ID not found in session" }, { status: 400 });
        }

        // 1. Fetch all doctors for the hospital
        // We need to join doctors -> staff -> user to get the name
        const doctorsList = await db
            .select({
                doctorId: doctors.id,
                name: userInAuth.name,
            })
            .from(doctors)
            .innerJoin(staff, eq(doctors.staffId, staff.id))
            .innerJoin(userInAuth, eq(staff.userId, userInAuth.id))
            .where(and(eq(doctors.hospitalId, hospitalId), eq(doctors.isDeleted, false)));

        // 2. Fetch all active shifts for the hospital
        const shiftsList = await db
            .select()
            .from(shifts)
            .where(and(eq(shifts.hospitalId, hospitalId), eq(shifts.isDeleted, false)));

        // 3. Fetch all existing doctor_shift assignments
        const assignments = await db
            .select()
            .from(doctorShifts)
            .where(eq(doctorShifts.hospitalId, hospitalId));

        // 4. Structure the response
        // We want to return:
        // - doctors: { id, name, shifts: { [shiftId]: boolean } }[]
        // - shifts: { id, name, startTime, endTime }[]

        const doctorsWithShifts = doctorsList.map((doc) => {
            const docAssignments = assignments.filter((a) => a.doctorUserId === doc.doctorId);
            const shiftsMap: Record<string, boolean> = {};

            shiftsList.forEach((shift) => {
                shiftsMap[shift.id] = docAssignments.some((a) => a.shiftId === shift.id);
            });

            return {
                doctorId: doc.doctorId,
                doctorName: doc.name,
                shifts: shiftsMap,
            };
        });

        return NextResponse.json({
            doctors: doctorsWithShifts,
            shifts: shiftsList,
        });

    } catch (error) {
        console.error("Error fetching doctor shifts:", error);
        return NextResponse.json(
            { error: "Failed to fetch doctor shifts" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, session: sessionData } = session;
        const hospitalId = sessionData.activeOrganizationId;

        if (!hospitalId) {
            return NextResponse.json({ error: "Hospital ID not found in session" }, { status: 400 });
        }

        const body = await req.json();
        const { doctorId, shiftId, assigned } = body;

        if (!doctorId || !shiftId || typeof assigned !== 'boolean') {
            return NextResponse.json(
                { error: "Doctor ID, Shift ID, and Assigned status are required" },
                { status: 400 }
            );
        }

        if (assigned) {
            // Create assignment if it doesn't exist
            // Use onConflict do nothing to avoid duplicates if race condition
            await db
                .insert(doctorShifts)
                .values({
                    hospitalId,
                    doctorUserId: doctorId,
                    shiftId,
                })
                .onConflictDoNothing();
        } else {
            // Delete assignment
            await db
                .delete(doctorShifts)
                .where(
                    and(
                        eq(doctorShifts.doctorUserId, doctorId),
                        eq(doctorShifts.shiftId, shiftId),
                        eq(doctorShifts.hospitalId, hospitalId)
                    )
                );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error updating doctor shift:", error);
        return NextResponse.json(
            { error: "Failed to update doctor shift" },
            { status: 500 }
        );
    }
}
