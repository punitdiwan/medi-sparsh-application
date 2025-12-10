import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserRole } from "@/db/queries";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { db } from "@/db/index";
import { organization } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/clinic - Get current organization/clinic details
export async function GET(request: NextRequest) {
    try {
        const org = await getActiveOrganization();

        if (!org) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse metadata if it's a string
        let metadata = null;
        if (org.metadata) {
            try {
                metadata = typeof org.metadata === "string"
                    ? JSON.parse(org.metadata)
                    : org.metadata;
            } catch (e) {
                console.error("Error parsing metadata:", e);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                id: org.id,
                name: org.name,
                logo: org.logo,
                metadata: metadata || {},
            },
        });
    } catch (error) {
        console.error("Error fetching clinic details:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch clinic details",
            },
            { status: 500 }
        );
    }
}

// PUT /api/clinic - Update organization/clinic details (owner only)
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const org = await getActiveOrganization();

        if (!org) {
            return NextResponse.json(
                { success: false, error: "Organization not found" },
                { status: 404 }
            );
        }

        // Check if user has owner role
        const userRole = await getUserRole(session.user.id, org.id);

        if (userRole !== "owner") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Only organization owners can update clinic details"
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { name, email, phone, address } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { success: false, error: "Clinic name is required" },
                { status: 400 }
            );
        }

        // Parse existing metadata
        interface ClinicMetadata {
            email?: string;
            phone?: string;
            address?: string;
            [key: string]: any;
        }

        let existingMetadata: ClinicMetadata = {};
        if (org.metadata) {
            try {
                existingMetadata = typeof org.metadata === "string"
                    ? JSON.parse(org.metadata)
                    : org.metadata;
            } catch (e) {
                console.error("Error parsing existing metadata:", e);
            }
        }

        // Merge new metadata with existing
        const updatedMetadata = {
            ...existingMetadata,
            email: email || existingMetadata.email || "",
            phone: phone || existingMetadata.phone || "",
            address: address || existingMetadata.address || "",
        };

        // Update organization in database
        const updated = await db
            .update(organization)
            .set({
                name,
                metadata: JSON.stringify(updatedMetadata),
            })
            .where(eq(organization.id, org.id))
            .returning();

        if (!updated || updated.length === 0) {
            return NextResponse.json(
                { success: false, error: "Failed to update clinic details" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: updated[0].id,
                name: updated[0].name,
                logo: updated[0].logo,
                metadata: updatedMetadata,
            },
        });
    } catch (error) {
        console.error("Error updating clinic details:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update clinic details",
            },
            { status: 500 }
        );
    }
}
