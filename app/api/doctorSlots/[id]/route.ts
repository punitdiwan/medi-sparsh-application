import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { doctorSlots } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import type { CustomeSession } from "@/db/types";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session:CustomeSession = await auth.api.getSession({
            headers: await headers()
        }) as CustomeSession;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, session: sessionData } = session;
        const hospitalId = sessionData.activeOrganizationId;

        if (!hospitalId) {
            return NextResponse.json({ error: "Hospital ID not found in session" }, { status: 400 });
        }

        const { id } = await params;
        const body = await req.json();
        const { day, timeFrom, timeTo, durationMins, chargeId } = body;

        // Basic validation
        if (!day || !timeFrom || !timeTo || !durationMins || !chargeId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        const [updatedSlot] = await db
            .update(doctorSlots)
            .set({
                day,
                timeFrom,
                timeTo,
                durationMins: parseInt(durationMins),
                chargeId,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(doctorSlots.id, id),
                    eq(doctorSlots.hospitalId, hospitalId)
                )
            )
            .returning();

        if (!updatedSlot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSlot);

    } catch (error) {
        console.error("Error updating doctor slot:", error);
        return NextResponse.json(
            { error: "Failed to update doctor slot" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session:CustomeSession = await auth.api.getSession({
            headers: await headers()
        }) as CustomeSession;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, session: sessionData } = session;
        const hospitalId = sessionData.activeOrganizationId;

        if (!hospitalId) {
            return NextResponse.json({ error: "Hospital ID not found in session" }, { status: 400 });
        }

        const { id } = await params;

        const [deletedSlot] = await db
            .delete(doctorSlots)
            .where(
                and(
                    eq(doctorSlots.id, id),
                    eq(doctorSlots.hospitalId, hospitalId)
                )
            )
            .returning();

        if (!deletedSlot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting doctor slot:", error);
        return NextResponse.json(
            { error: "Failed to delete doctor slot" },
            { status: 500 }
        );
    }
}
