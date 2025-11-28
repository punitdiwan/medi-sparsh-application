ALTER TABLE "auth"."verification" ALTER COLUMN "expiresAt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "createdAt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "createdAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "updatedAt" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "updatedAt" DROP DEFAULT;