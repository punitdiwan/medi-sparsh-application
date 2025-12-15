ALTER TABLE "pharmacy_purchase" ADD COLUMN IF NOT EXISTS "discount" numeric;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD COLUMN IF NOT EXISTS "gst_percent" numeric;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP COLUMN IF EXISTS "discount";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP COLUMN IF EXISTS "gst_percent";