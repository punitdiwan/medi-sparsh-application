import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index";
import { eq,and } from "drizzle-orm";
import * as schema from "@/drizzle/schema";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { ac, normal, secret, owner } from "./permissions";
import {
    ownerAc,
    adminAc,
    memberAc,
} from "better-auth/plugins/organization/access";
import { customSession } from "better-auth/plugins";
import { OWNER_ALL_PERMISSIONS } from "./allPermissions";


export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            dialect: "pg",
            schema: "public",
            ...schema,
        },
    }),
    //...other options
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
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
                            activeOrganizationId: organizationId,
                            // organization: organizationId
                            //activeTeamId: teamId?.team?.id
                        }
                    } as any;
                    return sessionData;
                },
            },
        }
    },
    trustedOrigins: ["http://localhost:3000", "*.medisparsh.com", "*.vercel.app"],
    plugins: [
        organization({
            ac, // Must be defined in order for dynamic access control to work
            roles: {
                owner,
                admin: adminAc,
                member: memberAc,
                normal,
            },
            dynamicAccessControl: {
                enabled: true,
            },
        }),
        customSession(async ({ user, session }) => {
            try {
                const organizationId = await getOrganisation(session.userId);

                if (!organizationId) {
                    return {
                        user,
                        session: {
                            ...session,
                            expiresAt:session.expiresAt instanceof Date? session.expiresAt.toISOString()
                                : session.expiresAt,
                            createdAt:session.createdAt instanceof Date? session.createdAt.toISOString()
                                : session.createdAt,
                            updatedAt:session.updatedAt instanceof Date? session.updatedAt.toISOString()
                                : session.updatedAt,
                            activeOrganizationId: null,
                        },
                    };
                }
                const permissions = await getRoleAndPermission(organizationId,session.userId);
                return {
                    user,
                    session: {
                        ...session,
                        expiresAt:session.expiresAt instanceof Date? session.expiresAt.toISOString()
                                : session.expiresAt,
                        createdAt:session.createdAt instanceof Date? session.createdAt.toISOString()
                                : session.createdAt,
                        updatedAt:session.updatedAt instanceof Date? session.updatedAt.toISOString()
                                : session.updatedAt,
                        activeOrganizationId: organizationId,
                        greeting: "hello",
                    },
                    permissionsData: permissions?.permission,
                    role:permissions?.role
                };
            } catch (error) {
                console.error("customSession error:", error);
                return {
                    user,
                    session,
                };
            }
        })
        ,
        nextCookies()
    ]
});

const getOrganisation = async (userId: string) => {
    const result = await db.select().from(schema.member).where(eq(schema.member.userId, userId)).limit(1);

    // console.log("Data from Result of getOrganisation", result);

    if (result.length > 0) {
        return result[0].organizationId;
    }

    return null;
}

const getRoleAndPermission = async (organizationId: string,userId: string) => {

  const member = await db.select({role: schema.member.role,}).from(schema.member).where(
      and(eq(schema.member.userId, userId),eq(schema.member.organizationId, organizationId)))
    .limit(1);

  if (!member.length) {
    return null;
  }

  const roleName = member[0].role;

  if (roleName === "owner") {
    return {
        role: "owner",
        permission: OWNER_ALL_PERMISSIONS,
    };
}

  const rolePermission = await db.select({
      role: schema.organizationRole.role,
      permission: schema.organizationRole.permission,
    }).from(schema.organizationRole).where(and(
        eq(schema.organizationRole.organizationId, organizationId),
        eq(schema.organizationRole.role, roleName)
      )
    )
    .limit(1);

  if (!rolePermission.length) {
    return null;
  }

  return rolePermission[0]; 
};
