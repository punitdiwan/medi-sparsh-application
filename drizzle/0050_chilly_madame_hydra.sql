ALTER TABLE "pathology_orders" ADD COLUMN "is_sample_at_home" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pathology_orders" ADD COLUMN "sample_data" jsonb;