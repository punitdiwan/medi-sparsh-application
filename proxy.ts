import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only protect doctor routes
  if (!path.startsWith("/doctor")) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  let permissions: Record<string, string[]> = {};
  try {
    permissions =
      typeof session.permissionsData === "string"
        ? JSON.parse(session.permissionsData)
        : session.permissionsData || {};
  } catch {
    permissions = {};
  }

  const normalizedPermissions: Record<string, string[]> = {};
  for (const key in permissions) {
    normalizedPermissions[key.toLowerCase()] = permissions[key];
  }

  const segments = path.split("/").filter(Boolean);
  const permissionSegments = segments.slice(1);
  
  if (permissionSegments.length === 0) {
    const response = NextResponse.next();
    // SECURITY: Store full session in HTTP-only cookie (secure, server-side only)
    response.cookies.set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    // Store permissions in HTTP-only cookie
    response.cookies.set("permissions", JSON.stringify(permissions), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  for (const rawSegment of permissionSegments) {
    const segment = rawSegment.toLowerCase(); 

    const allowed = normalizedPermissions?.[segment]?.includes("read");

    if (!allowed) {
      return NextResponse.rewrite(new URL("/no-permission", req.url));
    }
  }

  const response = NextResponse.next();
  // SECURITY: Store full session in HTTP-only cookie (secure, server-side only)
  response.cookies.set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  // Store permissions in HTTP-only cookie
  response.cookies.set("permissions", JSON.stringify(permissions), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export const config = {
  matcher: ["/doctor/:path*"],
};
