import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as authSchema from "./db/migrations/schema";
import { organization } from "better-auth/plugins";
import { memberInAuth as member } from "./db/migrations/schema";
import { eq } from "drizzle-orm";

const url = "https://abc.medisparsh.com";
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      dialect: "pg",
      schema: "auth",
      organization: authSchema.organizationInAuth,
      user: authSchema.userInAuth,
      member: authSchema.memberInAuth,
      session: authSchema.sessionInAuth,
      account: authSchema.accountInAuth,
      verification: authSchema.verificationInAuth,
    },
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          console.log("before Session Creation", session);
          const organizationId = await getOrganisation(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organizationId
            },
          }
        }
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },

  trustedOrigins: [url, "http://localhost:3000","*.medisparsh.com", "*.vercel.app"],
  baseURL: url,
  basePath: "/api/auth",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "medisparsh",
  },
  plugins: [organization()]
});

const getOrganisation = async (userId: string) => {
  const result = await db.select().from(member).where(eq(member.userId, userId)).limit(1);
  
  console.log("Data from Result of getOrganisation", result);

  if (result.length > 0) {
    return result[0].organizationId;
  }
  
  return null;
}
  
