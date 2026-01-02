CREATE TABLE "ipd_prescriptions" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"symptoms" text,
	"note" text,
	"medicines" jsonb NOT NULL,
	"attachments" text,
	"prescribeBy" text,
	"prescribe_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_prescribeBy_doctors_id_fk" FOREIGN KEY ("prescribeBy") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;