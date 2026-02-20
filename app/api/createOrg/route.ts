import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { auth } from "@/lib/auth";
import {
  user,
  organization,
  member,
  masterModules,
  modules
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface CreateOrgRequest {
  userName: string;
  email: string;
  password: string;
  orgName: string;
  orgSlug: string;
  orgLogo?: string;
  metadata?: {
    address?: string;
    phone?: string;
    email?: string;
    subdomain?: string;
    orgMode?: string;
    [key: string]: any;
  };
}

interface CreateOrgResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
  error?: string;
}

/**
 * POST /api/createOrg
 * 
 * Creates a new user and organization together.
 * If organization creation fails, user is rolled back.
 * 
 * Request body:
 * {
 *   "userName": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securePassword123",
 *   "orgName": "Medisparsh Hospital",
 *   "orgSlug": "medisparsh-hospital",
 *   "orgLogo": "https://example.com/logo.png",
 *   "metadata": {
 *     "address": "123 Medical Street, City",
 *     "phone": "+91-1234567890",
 *     "email": "contact@medisparsh.com",
 *     "subdomain": "medisparsh.com",
 *     "orgMode":"hospital"
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateOrgResponse>> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (token !== process.env.BETTER_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }
    const body = await request.json() as CreateOrgRequest;

    // Validate required fields
    if (!body.userName || !body.email || !body.password || !body.orgName || !body.orgSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "userName, email, password, orgName, and orgSlug are required",
        },
        { status: 400 }
      );
    }

    if (!body.metadata?.orgMode) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization mode is required",
          error: "orgMode must be 'hospital' or 'clinic'",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
          error: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Weak password",
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
    if (!slugRegex.test(body.orgSlug)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid slug format",
          error: "Slug must contain only lowercase letters, numbers, and hyphens",
        },
        { status: 400 }
      );
    }

    let createdUser: any;
    let createdOrganization: any;
    let createdMember: any;

    const result = await db.transaction(async (tx) => {
      try {

        const existingUser = await tx
          .select()
          .from(user)
          .where(eq(user.email, body.email))
          .limit(1);

        if (existingUser.length > 0) {
          throw new Error("Email already registered");
        }

        const existingOrg = await tx
          .select()
          .from(organization)
          .where(eq(organization.slug, body.orgSlug))
          .limit(1);

        if (existingOrg.length > 0) {
          throw new Error("Organization slug already exists");
        }

        const userResponse = await auth.api.signUpEmail({
          body: {
            name: body.userName,
            email: body.email,
            password: body.password,
          },
        });

        if (!userResponse || !userResponse.user) {
          throw new Error("Failed to create user account");
        }

        createdUser = userResponse.user;

        const orgMetadata = body.metadata || {
          address: "",
          phone: "",
          email: "",
          subdomain: "",
        };

        const org = await auth.api.createOrganization({
          body: {
            name: body.orgName,
            slug: body.orgSlug,
            userId: createdUser.id,
            logo: body.orgLogo || "",
            metadata: orgMetadata,
          },
        });

        if (!org) {
          throw new Error("Failed to create organization");
        }

        createdOrganization = org;

        const orgMode = body.metadata?.orgMode;

        if (orgMode === "hospital") {
          const allMasterModules = await tx
            .select()
            .from(masterModules);

          if (allMasterModules.length > 0) {

            const moduleInserts = allMasterModules.map((m) => ({
              name: m.name,
              hospitalId: createdOrganization.id,
              moduleId: m.id,
            }));

            await tx.insert(modules).values(moduleInserts);
          }
        }

        return {
          success: true,
          user: createdUser,
          organization: createdOrganization,
          member: createdMember,
        };
      } catch (error) {
        throw error;
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "User and organization successfully created",
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
          },
          organization: {
            id: result.organization.id,
            name: result.organization.name,
            slug: result.organization.slug,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Create Org API Error]:", error);

    // Determine error type and return appropriate response
    let statusCode = 500;
    let errorMessage = "Failed to create user and organization";

    if (error.message.includes("Email already registered")) {
      statusCode = 409;
      errorMessage = "Email already registered";
    } else if (error.message.includes("slug already exists")) {
      statusCode = 409;
      errorMessage = "Organization slug already exists";
    } else if (error.message.includes("Failed to create user")) {
      statusCode = 400;
      errorMessage = "Failed to create user account";
    } else if (error.message.includes("Invalid email")) {
      statusCode = 400;
      errorMessage = "Invalid email format";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message || "An error occurred",
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/createOrg
 * 
 * Fetches all organizations in the system with their associated members and users
 * Returns a list of all organization details including name, slug, logo, metadata, and member info
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 🔐 Bearer auth
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (token !== process.env.BETTER_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // 📌 Read optional id param
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("id");

    // 🔎 Build query conditionally
    let organizationsQuery: any = db
      .select()
      .from(organization)
      .innerJoin(member, eq(organization.id, member.organizationId))
      .innerJoin(user, eq(member.userId, user.id));

    if (orgId) {
      organizationsQuery = organizationsQuery.where(
        eq(organization.id, orgId)
      );
    }

    const organizations = await organizationsQuery;

    if (!organizations || organizations.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: orgId
            ? "Organization not found"
            : "No organizations found",
        },
        { status: orgId ? 404 : 200 }
      );
    }

    // 🧠 Group organizations
    const orgMap = new Map<string, any>();

    organizations.forEach((row: any) => {
      const org = row.organization;
      const memberData = row.member;
      const userData = row.user;

      if (!orgMap.has(org.id)) {
        let metadata = {};

        if (org.metadata) {
          try {
            metadata =
              typeof org.metadata === "string"
                ? JSON.parse(org.metadata)
                : org.metadata;
          } catch (e) {
            console.error("Error parsing metadata for org:", org.id, e);
          }
        }

        orgMap.set(org.id, {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          createdAt: org.createdAt,
          metadata,
          members: [],
        });
      }

      orgMap.get(org.id).members.push({
        memberId: memberData.id,
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
        role: memberData.role,
        memberCreatedAt: memberData.createdAt,
      });
    });

    const parsedOrganizations = Array.from(orgMap.values());

    return NextResponse.json(
      {
        success: true,
        data: orgId ? parsedOrganizations[0] : parsedOrganizations,
        total: orgId ? 1 : parsedOrganizations.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Get Organizations Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch organizations",
      },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 🔐 API key check
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (token !== process.env.BETTER_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // 📌 Get organization id from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Organization id is required" },
        { status: 400 }
      );
    }

    // 📦 Get update data from body
    const body = await request.json();

    // (Optional) Prevent updating restricted fields
    delete body.id;
    delete body.createdAt;

    // 🧠 If metadata is an object, stringify it
    if (body.metadata && typeof body.metadata === "object") {
      body.metadata = JSON.stringify(body.metadata);
    }

    // 🔄 Update organization
    const updatedOrg = await db
      .update(organization)
      .set({
        ...body,
      })
      .where(eq(organization.id, id))
      .returning();

    if (!updatedOrg || updatedOrg.length === 0) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization updated successfully",
        data: updatedOrg[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Update Organization Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update organization",
      },
      { status: 500 }
    );
  }
}

