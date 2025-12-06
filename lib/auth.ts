import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { organization } from "better-auth/plugins"


const url = "https://abc.medisparsh.com";
export const auth = betterAuth({
   database: prismaAdapter(prisma, {
      provider: "postgresql"
   }),
   databaseHooks: {
      session: {
         create: {
            before: async (session, context) => {
               const organizationId = await getOrganisation(session.userId);
               //const teamId = await getTeam(session.userId);
               const sessionData = {
                  data: {
                     ...session,
                     expiresAt: session.expiresAt instanceof Date ? session.expiresAt.toISOString() : session.expiresAt,
                     createdAt: session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt,
                     updatedAt: session.updatedAt instanceof Date ? session.updatedAt.toISOString() : session.updatedAt,
                     activeOrganizationId: organizationId?.organization?.id,
                     organization: organizationId
                     //activeTeamId: teamId?.team?.id
                  }
               } as any;
               // console.log("Session Data:", sessionData);
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
   trustedOrigins: [url, "http://localhost:3000", "*.medisparsh.com", "*.vercel.app"],
   rateLimit: {
      window: 60, // time window in seconds
      max: 10,
   },
   plugins: [
      organization()
   ]
})

const getOrganisation = async (userId: string) => {
   const result = await prisma.member.findFirst({
      where: {
         userId: userId
      },
      include: {
         organization: true
      }
   });


   if (result) {
      return result;
   }

   return null;
}