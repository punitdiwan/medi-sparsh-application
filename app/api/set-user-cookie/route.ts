// app/api/set-user-cookie/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { userData } = await request.json();

    // set cookie (object signature)
    (await
          // set cookie (object signature)
          cookies()).set({
      name: "userData",
      value: JSON.stringify(userData),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("set-user-cookie error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
