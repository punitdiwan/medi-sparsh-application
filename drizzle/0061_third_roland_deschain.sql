ALTER TYPE "public"."payment_status" ADD VALUE 'partially_paid';--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD COLUMN "paid_amount" numeric DEFAULT '0' NOT NULL;