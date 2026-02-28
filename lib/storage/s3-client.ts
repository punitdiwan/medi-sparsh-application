import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT || "";
const region = process.env.NEXT_PUBLIC_DO_SPACES_REGION || "us-east-1";
const accessKeyId = process.env.DO_SPACES_ACCESS_KEY || "";
const secretAccessKey = process.env.DO_SPACES_SECRET_KEY || "";

export const s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    // Required for DigitalOcean Spaces
    forcePathStyle: false,
});

export const bucketName = process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || "";
