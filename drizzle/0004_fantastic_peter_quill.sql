CREATE TABLE "appointments" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"doctor_user_id" text NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" text NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"reason" text,
	"notes" text,
	"is_follow_up" boolean DEFAULT false,
	"previous_appointment_id" text,
	"scheduled_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"services" jsonb
);
--> statement-breakpoint
CREATE TABLE "doctor_slots" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"doctor_id" text NOT NULL,
	"shift_id" text NOT NULL,
	"day" text NOT NULL,
	"time_from" text NOT NULL,
	"time_to" text NOT NULL,
	"duration_mins" integer NOT NULL,
	"charge_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"appointment_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"doctor_user_id" text NOT NULL,
	"diagnosis" text NOT NULL,
	"symptoms" text,
	"medicines" jsonb NOT NULL,
	"lab_tests" jsonb,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" date,
	"follow_up_notes" text,
	"additional_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"vitals" jsonb
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;