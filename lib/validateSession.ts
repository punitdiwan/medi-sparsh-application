import { cookies } from "next/headers";
import { auth } from "./auth";

export async function validateServerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("medisparsh.session_token")?.value;

    if (!token) return null;

    // Validate the session
    const sessionData = await auth.api.getSession({
      headers: { cookie: `medisparsh.session_token=${token}` },
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
