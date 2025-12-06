import { cookies } from "next/headers";
import { auth } from "./auth";

export async function validateServerSession() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("better-auth.session_token")?.value ||
      cookieStore.get("__Secure-session_token")?.value;

    if (!token) return null;

    const cookieHeader =
      cookieStore.get("__Secure-session_token")
        ? `__Secure-session_token=${token}`
        : `better-auth.session_token=${token}`;
        
    // Validate the session
    const sessionData = await auth.api.getSession({
      headers: { cookie: cookieHeader },
    });

    if (!sessionData || !sessionData.session) {
      return null;
    }
    return sessionData;
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
