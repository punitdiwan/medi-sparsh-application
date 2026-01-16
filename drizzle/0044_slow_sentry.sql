ALTER TABLE "ipd_payments" ADD COLUMN "reference_id" text;--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD COLUMN "to_credit" boolean DEFAULT false;