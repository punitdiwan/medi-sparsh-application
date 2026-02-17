CREATE TYPE "public"."ambulance_status" AS ENUM('active', 'inactive', 'maintenance');--> statement-breakpoint
CREATE TYPE "public"."ambulance_type" AS ENUM('rented', 'owned');--> statement-breakpoint
CREATE TABLE "ambulance" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"vehicle_number" text NOT NULL,
	"vehicle_type" "ambulance_type" NOT NULL,
	"vehicle_model" text NOT NULL,
	"vehicle_year" text NOT NULL,
	"driver_name" text NOT NULL,
	"driver_contact_no" text NOT NULL,
	"driver_license_no" text NOT NULL,
	"status" "ambulance_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ambulance" ADD CONSTRAINT "ambulance_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;