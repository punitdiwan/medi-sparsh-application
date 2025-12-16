import { organizationClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { ac, normal, owner, secret } from "./permissions";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "http://localhost:3000"
    plugins: [
        organizationClient({
            ac, // Must be defined in order for dynamic access control to work
            roles: {
                normal,
                secret,
                owner
            },
            dynamicAccessControl: { 
              enabled: true, 
            }, 
        })
    ]
})

export const { useSession } = authClient;