DROP TABLE "pharmacy_stock" CASCADE;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD COLUMN "quantity" numeric DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD COLUMN "low_stock_alert" integer DEFAULT 10 NOT NULL;