import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const domain = host.split(":")[0];
  
  // Add the domain to the request headers so it can be accessed in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-domain", domain);
  
  // You can add additional logic here to validate the domain
  // For example, check if the domain is registered in your system
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes should use the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Better Auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
