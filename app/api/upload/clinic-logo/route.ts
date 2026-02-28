import { NextRequest, NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client, bucketName } from "@/lib/storage/s3-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { db } from "@/db";
import { organization } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getUserRole } from "@/db/queries";

export async function POST(req: NextRequest) {
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
                    error: "Only organization owners can update clinic logo"
                },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "Only image files are allowed" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const orgFolder = org?.slug || org?.id || "default";
        const fileName = `${orgFolder}/avtar/${org.id}-${Date.now()}-${file.name}`;

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
                ACL: "public-read",
            },
        });

        await upload.done();

        // Construct the public URL
        const endpoint = process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT?.replace("https://", "");
        const imageUrl = `https://${bucketName}.${endpoint}/${fileName}`;

        // Update the organization table in the database
        await db
            .update(organization)
            .set({ logo: imageUrl })
            .where(eq(organization.id, org.id));

        return NextResponse.json({
            success: true,
            data: {
                imageUrl,
            },
        });
    } catch (error) {
        console.error("Error uploading clinic logo:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to upload logo",
            },
            { status: 500 }
        );
    }
}
