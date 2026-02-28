import { NextRequest, NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client, bucketName } from "@/lib/storage/s3-client";
import { getCurrentUser } from "@/lib/utils/auth-helpers";
import { db } from "@/db";
import { user } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
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

        const org = await getActiveOrganization();
        const orgFolder = org?.slug || org?.id || "default";

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${orgFolder}/${currentUser.id}/${Date.now()}-${file.name}`;

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
        // DigitalOcean Spaces URL format: https://bucketname.endpoint/key
        const endpoint = process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT?.replace("https://", "");
        const imageUrl = `https://${bucketName}.${endpoint}/${fileName}`;

        // Update the user table in the database
        await db
            .update(user)
            .set({ image: imageUrl })
            .where(eq(user.id, currentUser.id));

        return NextResponse.json({
            success: true,
            data: {
                imageUrl,
            },
        });
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to upload image",
            },
            { status: 500 }
        );
    }
}
