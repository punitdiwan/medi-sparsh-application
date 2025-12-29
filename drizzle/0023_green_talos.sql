CREATE TABLE "ipd_consultation" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"doctor_id" text,
	"applied_date" timestamp with time zone DEFAULT now() NOT NULL,
	"consultation_date" timestamp with time zone DEFAULT now() NOT NULL,
	"consultation_time" timestamp with time zone DEFAULT now() NOT NULL,
	"consultation_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;