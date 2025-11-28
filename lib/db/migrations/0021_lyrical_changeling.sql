ALTER TABLE "auth"."verification" ALTER COLUMN "value" TYPE jsonb USING "value"::jsonb;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "expiresAt" TYPE timestamp USING "expiresAt"::timestamp;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "createdAt" TYPE timestamp USING "createdAt"::timestamp;--> statement-breakpoint
ALTER TABLE "auth"."verification" ALTER COLUMN "updatedAt" TYPE timestamp USING "updatedAt"::timestamp;--> statement-breakpoint