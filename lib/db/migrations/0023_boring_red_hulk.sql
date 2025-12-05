ALTER TABLE "session" ALTER COLUMN "expiresAt" TYPE timestamptz USING ("expiresAt"::timestamptz);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" TYPE timestamptz USING ("createdAt"::timestamptz);--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" TYPE timestamptz USING ("updatedAt"::timestamptz);