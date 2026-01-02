CREATE TABLE "ipd_payments" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"payment_mode" text NOT NULL,
	"payment_amount" numeric NOT NULL,
	"payment_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD CONSTRAINT "ipd_payments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD CONSTRAINT "ipd_payments_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;