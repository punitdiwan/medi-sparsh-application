ALTER TABLE "beds" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'active' NOT NULL;
--> statement-breakpoint
UPDATE "beds" SET "status" = 'occupied' WHERE "is_occupied" = true;
