import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { ac,owner ,doctor } from "./permissions";
import { customSessionClient } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "http://localhost:3000"
    plugins: [
        organizationClient({
            ac, // Must be defined in order for dynamic access control to work
            roles: {
                owner,
                doctor
            },
            dynamicAccessControl: { 
              enabled: true, 
            }, 
        }),
        customSessionClient<typeof auth>()
    ]
})

export const { useSession } = authClient;