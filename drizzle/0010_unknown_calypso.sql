CREATE TABLE "pharmacy_purchase_item" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"purchase_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"quantity" numeric NOT NULL,
	"cost_price" numeric NOT NULL,
	"mrp" numeric NOT NULL,
	"discount" numeric,
	"gst_percent" numeric,
	"amount" numeric NOT NULL,
	"expiry_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pharmacy_batch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_medicine_id_pharmacy_medicines_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_batch_id_pharmacy_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_medicine_category_id_medicine_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_medicine_company_id_medicine_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" DROP CONSTRAINT "pharmacy_sales_items_batch_id_pharmacy_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales" ALTER COLUMN "discount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "pharmacy_sales" ALTER COLUMN "tax_amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_purchase_id_pharmacy_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."pharmacy_purchase"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP COLUMN "medicine_id";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP COLUMN "batch_id";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP COLUMN "medicine_category_id";--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP COLUMN "medicine_company_id";--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" DROP COLUMN "batch_id";--> statement-breakpoint
DROP TABLE "pharmacy_batch" CASCADE;