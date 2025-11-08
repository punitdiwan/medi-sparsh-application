import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Get the current session
 * Use this in server components or API routes
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  return session;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized - Please sign in");
  }
  
  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const session = await requireAuth();
  return session.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}
