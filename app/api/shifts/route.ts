import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shifts } from "@/lib/db/migrations/schema";
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
        const showDeleted = searchParams.get("showDeleted") === "true";

        const conditions = [eq(shifts.hospitalId, hospitalId)];

        // Filter by isDeleted status based on the showDeleted flag
        // If showDeleted is true, we want ONLY deleted items.
        // If showDeleted is false, we want ONLY non-deleted items.
        conditions.push(eq(shifts.isDeleted, showDeleted));

        const result = await db
            .select()
            .from(shifts)
            .where(and(...conditions));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching shifts:", error);
        return NextResponse.json(
            { error: "Failed to fetch shifts" },
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
        const { name, startTime, endTime } = body;

        if (!name || !startTime || !endTime) {
            return NextResponse.json(
                { error: "Name, Start Time, and End Time are required" },
                { status: 400 }
            );
        }

        const newShift = await db
            .insert(shifts)
            .values({
                hospitalId,
                name,
                startTime,
                endTime,
            })
            .returning();

        return NextResponse.json(newShift[0]);
    } catch (error) {
        console.error("Error creating shift:", error);
        return NextResponse.json(
            { error: "Failed to create shift" },
            { status: 500 }
        );
    }
}
