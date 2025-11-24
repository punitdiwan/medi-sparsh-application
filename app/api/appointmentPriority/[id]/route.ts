import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointmentPriorities } from "@/lib/db/migrations/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { priority } = body;

        if (!priority) {
            return NextResponse.json(
                { error: "Priority name is required" },
                { status: 400 }
            );
        }

        const updatedPriority = await db
            .update(appointmentPriorities)
            .set({ priority, updatedAt: new Date() })
            .where(eq(appointmentPriorities.id, id))
            .returning();

        if (updatedPriority.length === 0) {
            return NextResponse.json({ error: "Priority not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPriority[0]);
    } catch (error) {
        console.error("Error updating appointment priority:", error);
        return NextResponse.json(
            { error: "Failed to update appointment priority" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const deletedPriority = await db
            .update(appointmentPriorities)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(appointmentPriorities.id, id))
            .returning();

        if (deletedPriority.length === 0) {
            return NextResponse.json({ error: "Priority not found" }, { status: 404 });
        }

        return NextResponse.json(deletedPriority[0]);
    } catch (error) {
        console.error("Error deleting appointment priority:", error);
        return NextResponse.json(
            { error: "Failed to delete appointment priority" },
            { status: 500 }
        );
    }
}
