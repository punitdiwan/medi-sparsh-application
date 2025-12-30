CREATE TABLE "ipd_operations" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"ipd_admission_id" text NOT NULL,
	"operation_id" text NOT NULL,
	"operation_date" timestamp with time zone DEFAULT now() NOT NULL,
	"doctors" jsonb NOT NULL,
	"operation_time" timestamp with time zone DEFAULT now() NOT NULL,
	"operation_details" text,
	"support_staff" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_operation_id_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE cascade ON UPDATE no action;