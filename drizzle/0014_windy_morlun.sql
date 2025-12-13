CREATE TABLE "pharmacy_stock" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"quantity" numeric DEFAULT '0' NOT NULL,
	"low_stock_alert" integer DEFAULT 10 NOT NULL,
	"cost_price" numeric NOT NULL,
	"mrp" numeric NOT NULL,
	"selling_price" numeric DEFAULT '0' NOT NULL,
	"expiry_date" date NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ALTER COLUMN "selling_price" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP COLUMN "quantity";--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP COLUMN "low_stock_alert";