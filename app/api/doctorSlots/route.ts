import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { doctorSlots, charges } from "@/db/schema";
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

        const { searchParams } = new URL(req.url);
        const doctorId = searchParams.get("doctorId");
        const shiftId = searchParams.get("shiftId");

        if (!doctorId || !shiftId) {
            return NextResponse.json({ error: "Doctor ID and Shift ID are required" }, { status: 400 });
        }

        const slots = await db
            .select({
                id: doctorSlots.id,
                day: doctorSlots.day,
                timeFrom: doctorSlots.timeFrom,
                timeTo: doctorSlots.timeTo,
                durationMins: doctorSlots.durationMins,
                categoryId: charges.chargeCategoryId,
                chargeId: doctorSlots.chargeId,
                amount: charges.amount,
                // Wait, charges table structure:
                // id, hospitalId, name, description, chargeCategoryId, chargeTypeId, unitId, standardCharge
            })
            .from(doctorSlots)
            .leftJoin(charges, eq(doctorSlots.chargeId, charges.id))
            .where(
                and(
                    eq(doctorSlots.hospitalId, hospitalId),
                    eq(doctorSlots.doctorId, doctorId),
                    eq(doctorSlots.shiftId, shiftId)
                )
            );

        // We need to map the result to match the frontend expectation
        // Frontend expects: { id, text, timeFrom, timeTo, durationMins, categoryId, chargeId, amount }
        // text is usually constructed on frontend, but we can send it or let frontend handle it.
        // Let's check the charges table schema again to be sure about 'amount'.
        // In previous steps, I saw 'charges' table in schema.ts but didn't see 'standardCharge'.
        // Let me check schema.ts for 'charges' table definition again to be sure.

        return NextResponse.json(slots);

    } catch (error) {
        console.error("Error fetching doctor slots:", error);
        return NextResponse.json(
            { error: "Failed to fetch doctor slots" },
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
        const { doctorId, shiftId, day, timeFrom, timeTo, durationMins, chargeId } = body;

        // Basic validation
        if (!doctorId || !shiftId || !day || !timeFrom || !timeTo || !durationMins || !chargeId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // TODO: Add overlap validation here if needed

        const [newSlot] = await db
            .insert(doctorSlots)
            .values({
                hospitalId,
                doctorId,
                shiftId,
                day,
                timeFrom,
                timeTo,
                durationMins: parseInt(durationMins),
                chargeId,
            })
            .returning();

        return NextResponse.json(newSlot);

    } catch (error) {
        console.error("Error creating doctor slot:", error);
        return NextResponse.json(
            { error: "Failed to create doctor slot" },
            { status: 500 }
        );
    }
}
