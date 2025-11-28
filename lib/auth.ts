import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as authSchema from "./db/migrations/schema";
import { organization } from "better-auth/plugins";
import { memberInAuth as member, teamInAuth as team, teamMemberInAuth as teamMember } from "./db/migrations/schema";
import { eq } from "drizzle-orm";

const url = "https://abc.medisparsh.com";
export const auth = betterAuth({
  socialProviders: {
    google: {
      prompt: "select_account",
      accessType: "offline", 
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
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
          const organizationId = await getOrganisation(session.userId);
          const teamId = await getTeam(session.userId);
          return {
            data: {
              ...session,
              expiresAt: session.expiresAt instanceof Date ? session.expiresAt.toISOString() : session.expiresAt,
              createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
              updatedAt: session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt,
              activeOrganizationId: organizationId,
              activeTeamId: teamId?.team?.id
            } as any,
          }
        }
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false
  },

  trustedOrigins: [url, "http://localhost:3000", "*.medisparsh.com", "*.vercel.app"],
  baseURL: url,
  basePath: "/api/auth",
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "medisparsh",
  },
  plugins: [organization(
    {
      teams: {
        enabled: true,
        maximumTeams: 10, // Optional: limit teams per organization
        allowRemovingAllTeams: false, // Optional: prevent removing the last team
      }
    }
  )]
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

