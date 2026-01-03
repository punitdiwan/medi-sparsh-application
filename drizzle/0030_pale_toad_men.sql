CREATE TABLE "ipd_medications" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"medicine_id" text NOT NULL,
	"dose" jsonb NOT NULL,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;