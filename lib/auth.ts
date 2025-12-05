import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as authSchema from "./db/migrations/schema";
import { organization } from "better-auth/plugins";
import { memberInAuth as member, teamInAuth as team, teamMemberInAuth as teamMember } from "./db/migrations/schema";
import { eq } from "drizzle-orm";

const url = "https://abc.medisparsh.com";
export const auth = betterAuth({
  
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      dialect: "pg",
      schema: "auth",
      organization: authSchema.organizationInAuth,
      team: authSchema.teamInAuth,
      teamMember: authSchema.teamMemberInAuth,
      invitation: authSchema.invitationInAuth,
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
        before: async (session, context) => {
          console.log("Creating session for user:", session);
          const organizationId = await getOrganisation(session.userId);

          const sessionData = {data: {
              ...session,
              activeOrganizationId: organizationId,
            } as any,};
            console.log("Session Data:", sessionData);
            return sessionData;
        }
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // trustedOrigins: [url, "http://localhost:3000", "*.medisparsh.com", "*.vercel.app"],
  //baseURL: url,
  // basePath: "/api/auth",
  // advanced: {
  //   useSecureCookies: process.env.NODE_ENV === "production",
  //   cookiePrefix: "medisparsh",
  // },
  rateLimit: {
      window: 60, // time window in seconds
      max: 10,
   },
  plugins: [organization()]
});

const getTeam = async (userId: string) => {
  const result = await db.select().from(team)
    .innerJoin(teamMember, eq(team.id, teamMember.teamId))
    .where(eq(teamMember.userId, userId)).limit(1);


  if (result.length > 0) {
    return result[0];
  }

  return null;
}

const getOrganisation = async (userId: string) => {
  const result = await db.select().from(member).where(eq(member.userId, userId)).limit(1);

  console.log("Data from Result of getOrganisation", result);

  if (result.length > 0) {
    return result[0].organizationId;
  }

  return null;
}

