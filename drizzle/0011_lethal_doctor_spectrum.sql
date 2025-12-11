ALTER TABLE "pharmacy_purchase" ADD COLUMN "discount" numeric;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD COLUMN "gst_percent" numeric;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP COLUMN "discount";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP COLUMN "gst_percent";