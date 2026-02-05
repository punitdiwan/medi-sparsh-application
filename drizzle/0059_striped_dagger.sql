CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid');--> statement-breakpoint
ALTER TABLE "ambulance_booking" RENAME COLUMN "discount_percent" TO "discount_amt";--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD COLUMN "total_amount" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD COLUMN "payment_status" "payment_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD COLUMN "booking_status" "booking_status" NOT NULL;