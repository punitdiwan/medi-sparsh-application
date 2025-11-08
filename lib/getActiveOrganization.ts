// lib/getActiveOrganization.ts
import { auth } from "./auth"
import { cookies } from "next/headers";

export async function getActiveOrganization() {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("medisparsh.session_token"))?.value;
    const session = await auth.api.getSession({
        headers: { cookie: `medisparsh.session_token=${token}` },
    });
    if (!session?.user) return null

    // This comes from BetterAuth's built-in org plugin
    const org = await auth.api.getFullOrganization({
        query: {
            organizationId: session.session.activeOrganizationId || undefined,
        },
        headers: { cookie: `medisparsh.session_token=${token}` },
    })

    return org
}
