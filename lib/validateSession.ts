import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export async function validateServerSession() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("medisparsh.session_token")?.value ||
      cookieStore.get("__Secure-medisparsh.session_token")?.value;

    if (!token) return null;

    const cookieHeader =
      cookieStore.get("__Secure-medisparsh.session_token")
        ? `__Secure-medisparsh.session_token=${token}`
        : `medisparsh.session_token=${token}`;
        
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
