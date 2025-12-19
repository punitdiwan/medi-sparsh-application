CREATE TABLE "symptom_types" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"symptom_type_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ALTER COLUMN "batch_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "symptom_types" ADD CONSTRAINT "symptom_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_symptom_type_id_symptom_types_id_fk" FOREIGN KEY ("symptom_type_id") REFERENCES "public"."symptom_types"("id") ON DELETE cascade ON UPDATE no action;