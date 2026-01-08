// lib/getActiveOrganization.ts
import { auth } from "./auth"
import { cookies } from "next/headers";

export async function getActiveOrganization() {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("better-auth.session_token") ??
      cookieStore.get("__Secure-better-auth.session_token");

    if (!token) {
        return null;
    }
    const cookieHeader = `${token.name}=${token.value}`;
    const session = await auth.api.getSession({
        headers: { cookie: cookieHeader },
    });
    if (!session?.user) return null

    // This comes from BetterAuth's built-in org plugin
    const org = await auth.api.getFullOrganization({
        query: {
            organizationId: session.session.activeOrganizationId || undefined,
        },
        headers: { cookie: cookieHeader },
    })

    return org
}
