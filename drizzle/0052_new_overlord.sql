CREATE TABLE "radiology_categories" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radiology_units" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "radiology_categories" ADD CONSTRAINT "radiology_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_units" ADD CONSTRAINT "radiology_units_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;