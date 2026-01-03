CREATE TYPE "public"."discharge_status" AS ENUM('pending', 'normal', 'referal', 'death');--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD COLUMN "discharge_status" "discharge_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD COLUMN "discharge_info" jsonb;