import { NextRequest, NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import { s3Client, bucketName } from "@/lib/storage/s3-client";
import { getActiveOrganization } from "@/lib/getActiveOrganization";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    try {
        const org = await getActiveOrganization();
        if (!org) {
            return NextResponse.json(
                { success: false, error: "Organization not found" },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const patientId = formData.get("patientId") as string | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        if (!patientId) {
            return NextResponse.json(
                { success: false, error: "Patient ID is required" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Only JPEG, PNG, and PDF files are allowed" },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "File size must be less than 10MB" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Use organization slug for the path
        const orgSlug = org.slug || org.name?.replace(/[^a-zA-Z0-9.-]/g, "_") || "organization";
        
        // Create unique filename to avoid conflicts
        const timestamp = Date.now();
        const key = `${orgSlug}/pathology_report/${patientId}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                ACL: "public-read",
            },
        });

        await upload.done();

        // Construct the public URL
        const endpoint = process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT?.replace("https://", "");
        const fileUrl = `https://${bucketName}.${endpoint}/${key}`;

        return NextResponse.json({
            success: true,
            data: {
                fileUrl,
                fileName: file.name,
            },
        });
    } catch (error) {
        console.error("Error uploading pathology report:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to upload report",
            },
            { status: 500 }
        );
    }
}
