CREATE TABLE "radiology_parameters" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"description" text,
	"hospital_id" text NOT NULL,
	"param_name" text NOT NULL,
	"test_id" text NOT NULL,
	"from_range" text NOT NULL,
	"to_range" text NOT NULL,
	"unit_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radiology_tests" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"test_name" text NOT NULL,
	"short_name" text,
	"test_type" text,
	"description" text,
	"category_id" text NOT NULL,
	"sub_category_id" text,
	"report_hours" integer NOT NULL,
	"charge_category_id" text NOT NULL,
	"charge_id" text NOT NULL,
	"charge_name" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "radiology_parameters" ADD CONSTRAINT "radiology_parameters_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_parameters" ADD CONSTRAINT "radiology_parameters_test_id_radiology_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."radiology_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_parameters" ADD CONSTRAINT "radiology_parameters_unit_id_radiology_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."radiology_units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_tests" ADD CONSTRAINT "radiology_tests_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_tests" ADD CONSTRAINT "radiology_tests_category_id_radiology_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."radiology_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_tests" ADD CONSTRAINT "radiology_tests_charge_category_id_charge_categories_id_fk" FOREIGN KEY ("charge_category_id") REFERENCES "public"."charge_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_tests" ADD CONSTRAINT "radiology_tests_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE restrict ON UPDATE no action;