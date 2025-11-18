ALTER TABLE "auth"."session" ALTER COLUMN "expiresAt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth"."session" ALTER COLUMN "createdAt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth"."session" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "auth"."session" ALTER COLUMN "updatedAt" SET DATA TYPE text;