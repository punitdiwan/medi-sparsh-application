CREATE TABLE "ipd_charges" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"charge_type_id" text NOT NULL,
	"charge_category_id" text NOT NULL,
	"charge_id" text NOT NULL,
	"qty" integer NOT NULL,
	"standard_charge" numeric NOT NULL,
	"total_amount" numeric NOT NULL,
	"discount_percent" numeric NOT NULL,
	"tax_percent" numeric NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_type_id_charge_types_id_fk" FOREIGN KEY ("charge_type_id") REFERENCES "public"."charge_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_category_id_charge_categories_id_fk" FOREIGN KEY ("charge_category_id") REFERENCES "public"."charge_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;