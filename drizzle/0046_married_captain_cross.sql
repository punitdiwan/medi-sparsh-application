CREATE TABLE "pathology_tests" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"test_name" text NOT NULL,
	"short_name" text,
	"test_type" text NOT NULL,
	"description" text,
	"category_id" text NOT NULL,
	"sub_category_id" text,
	"method" text,
	"report_days" integer NOT NULL,
	"charge_category_id" text NOT NULL,
	"charge_id" text NOT NULL,
	"charge_name" text NOT NULL,
	"test_parameters" jsonb NOT NULL,
	"unit_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pathology_tests" ADD CONSTRAINT "pathology_tests_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_tests" ADD CONSTRAINT "pathology_tests_category_id_pathology_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."pathology_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_tests" ADD CONSTRAINT "pathology_tests_charge_category_id_charge_categories_id_fk" FOREIGN KEY ("charge_category_id") REFERENCES "public"."charge_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_tests" ADD CONSTRAINT "pathology_tests_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_tests" ADD CONSTRAINT "pathology_tests_unit_id_pathology_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."pathology_units"("id") ON DELETE restrict ON UPDATE no action;