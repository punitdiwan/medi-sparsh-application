import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { appointmentPriorities } from "@/drizzle/schema";
import { auth } from "@/lib/auth"; // Assuming auth helper exists, need to verify
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

        const priorities = await db
            .select()
            .from(appointmentPriorities)
            .where(
                and(
                    eq(appointmentPriorities.hospitalId, hospitalId),
                    eq(appointmentPriorities.isDeleted, false)
                )
            );

        return NextResponse.json(priorities);
    } catch (error) {
        console.error("Error fetching appointment priorities:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointment priorities" },
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
        const { priority } = body;

        if (!priority) {
            return NextResponse.json(
                { error: "Priority name is required" },
                { status: 400 }
            );
        }

        const newPriority = await db
            .insert(appointmentPriorities)
            .values({
                hospitalId,
                priority,
            })
            .returning();

        return NextResponse.json(newPriority[0]);
    } catch (error) {
        console.error("Error creating appointment priority:", error);
        return NextResponse.json(
            { error: "Failed to create appointment priority" },
            { status: 500 }
        );
    }
}
