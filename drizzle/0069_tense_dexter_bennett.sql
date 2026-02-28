ALTER TABLE "slot_bookings" DROP CONSTRAINT IF EXISTS "unique_active_slot_booking";--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD COLUMN "is_deleted" boolean DEFAULT false;