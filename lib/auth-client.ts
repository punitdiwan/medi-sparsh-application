import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const origin =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: `${origin}/api/auth`,
  plugins: [
    organizationClient({
      teams: {
        enabled: true,
      },
    }),
  ]
});

export const { useSession } = authClient;