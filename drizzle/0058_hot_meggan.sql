CREATE TYPE "public"."payment_mode" AS ENUM('cash', 'card', 'upi', 'cheque', 'dd');--> statement-breakpoint
CREATE TABLE "ambulance_booking" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"ambulance_id" text NOT NULL,
	"charge_category" text NOT NULL,
	"charge_id" text NOT NULL,
	"standard_charge" numeric NOT NULL,
	"tax_percent" numeric NOT NULL,
	"discount_percent" numeric NOT NULL,
	"payment_mode" "payment_mode" NOT NULL,
	"reference_no" text,
	"pickup_location" text NOT NULL,
	"drop_location" text NOT NULL,
	"booking_date" date NOT NULL,
	"booking_time" time NOT NULL,
	"driver_name" text NOT NULL,
	"driver_contact_no" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD CONSTRAINT "ambulance_booking_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD CONSTRAINT "ambulance_booking_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD CONSTRAINT "ambulance_booking_ambulance_id_ambulance_id_fk" FOREIGN KEY ("ambulance_id") REFERENCES "public"."ambulance"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD CONSTRAINT "ambulance_booking_charge_category_charge_categories_id_fk" FOREIGN KEY ("charge_category") REFERENCES "public"."charge_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance_booking" ADD CONSTRAINT "ambulance_booking_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambulance" DROP COLUMN "is_deleted";