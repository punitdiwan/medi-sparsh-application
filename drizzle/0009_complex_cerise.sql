CREATE TABLE "pharmacy_batch" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_number" text NOT NULL,
	"cost_price" numeric NOT NULL,
	"selling_price" numeric NOT NULL,
	"expiry_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_medicines" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text NOT NULL,
	"company_id" text NOT NULL,
	"group_id" text NOT NULL,
	"unit_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_purchase" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"supplier_id" text NOT NULL,
	"medicine_category_id" text NOT NULL,
	"medicine_company_id" text NOT NULL,
	"bill_number" text NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"purchase_amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_sales" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"bill_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"total_amount" numeric NOT NULL,
	"discount" numeric DEFAULT 0 NOT NULL,
	"tax_amount" numeric DEFAULT 0 NOT NULL,
	"net_amount" numeric NOT NULL,
	"payment_mode" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_sales_items" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"bill_id" text NOT NULL,
	"batch_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_price" numeric NOT NULL,
	"total_amount" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pharmacy_stock" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"low_stock_alert" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pharmacy_batch" ADD CONSTRAINT "pharmacy_batch_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_batch" ADD CONSTRAINT "pharmacy_batch_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_category_id_medicine_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."medicine_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_company_id_medicine_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."medicine_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_group_id_medicine_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."medicine_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_unit_id_medicine_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."medicine_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_batch_id_pharmacy_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."pharmacy_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_supplier_id_medicine_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."medicine_suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_medicine_category_id_medicine_categories_id_fk" FOREIGN KEY ("medicine_category_id") REFERENCES "public"."medicine_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_medicine_company_id_medicine_companies_id_fk" FOREIGN KEY ("medicine_company_id") REFERENCES "public"."medicine_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales" ADD CONSTRAINT "pharmacy_sales_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_bill_id_pharmacy_sales_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."pharmacy_sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_batch_id_pharmacy_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."pharmacy_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE cascade ON UPDATE no action;