import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { shifts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

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
        const { name, startTime, endTime, isDeleted } = body;

        // If restoring (isDeleted is explicitly false), we don't strictly require other fields if they are not provided
        // However, for a general update, we might want to keep validation. 
        // Let's assume for restore we just toggle the flag, but we can also update fields if provided.

        const updateData: any = { updatedAt: new Date() };
        if (name) updateData.name = name;
        if (startTime) updateData.startTime = startTime;
        if (endTime) updateData.endTime = endTime;
        if (typeof isDeleted === 'boolean') updateData.isDeleted = isDeleted;

        // If it's a normal update (not just restore), ensure required fields are present if we were creating, 
        // but for update we usually allow partial updates or expect full payload. 
        // The previous logic enforced name, startTime, endTime. Let's keep it if we are NOT just restoring.
        // Actually, simpler logic: if we are updating, we update whatever is provided.

        if (!name && !startTime && !endTime && typeof isDeleted === 'undefined') {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        const updatedShift = await db
            .update(shifts)
            .set(updateData)
            .where(eq(shifts.id, id))
            .returning();

        if (updatedShift.length === 0) {
            return NextResponse.json({ error: "Shift not found" }, { status: 404 });
        }

        return NextResponse.json(updatedShift[0]);
    } catch (error) {
        console.error("Error updating shift:", error);
        return NextResponse.json(
            { error: "Failed to update shift" },
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
        const { searchParams } = new URL(req.url);
        const permanent = searchParams.get("permanent") === "true";

        if (permanent) {
            // Hard delete
            const deletedShift = await db
                .delete(shifts)
                .where(eq(shifts.id, id))
                .returning();

            if (deletedShift.length === 0) {
                return NextResponse.json({ error: "Shift not found" }, { status: 404 });
            }
            return NextResponse.json(deletedShift[0]);
        } else {
            // Soft delete
            const deletedShift = await db
                .update(shifts)
                .set({ isDeleted: true, updatedAt: new Date() })
                .where(eq(shifts.id, id))
                .returning();

            if (deletedShift.length === 0) {
                return NextResponse.json({ error: "Shift not found" }, { status: 404 });
            }
            return NextResponse.json(deletedShift[0]);
        }

    } catch (error) {
        console.error("Error deleting shift:", error);
        return NextResponse.json(
            { error: "Failed to delete shift" },
            { status: 500 }
        );
    }
}
