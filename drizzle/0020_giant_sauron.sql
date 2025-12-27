CREATE TABLE "ipd_admission" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"case_id" text,
	"case_details" text,
	"diagnosis" jsonb,
	"casuality" boolean DEFAULT false,
	"credit_limit" numeric DEFAULT '0' NOT NULL,
	"refrence_from" text,
	"doctor_id" text,
	"bed_group_id" text,
	"bed_id" text,
	"notes" text,
	"medical_history" text,
	"admission_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_doctor_id_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_bed_group_id_bed_groups_id_fk" FOREIGN KEY ("bed_group_id") REFERENCES "public"."bed_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE cascade ON UPDATE no action;