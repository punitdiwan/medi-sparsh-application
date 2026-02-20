import { NextResponse } from "next/server";
import { db } from "@/db";
import { modules } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

// data sending format
// send hospitalId as query param
// /api/hospitalModules?hospitalId=xyz

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hospitalId = searchParams.get("hospitalId");

    if (!hospitalId) {
      return NextResponse.json(
        { success: false, message: "hospitalId is required" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(modules)
      .where(
        and(
          eq(modules.hospitalId, hospitalId),
          eq(modules.isDeleted, false)
        )
      );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET modules error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

// data sending format
// {
//   "id": "module-id",
//   "isDeleted": true/false
// }


export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, isDeleted } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Module id is required" },
        { status: 400 }
      );
    }

    if (typeof isDeleted !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isDeleted must be boolean" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(modules)
      .set({
        isDeleted,
        updatedAt: new Date(),
      })
      .where(eq(modules.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated[0],
    });

  } catch (error) {
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}