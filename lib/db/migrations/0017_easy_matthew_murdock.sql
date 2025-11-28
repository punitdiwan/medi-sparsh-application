CREATE TABLE "medicine_companies" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medicine_companies" ADD CONSTRAINT "medicine_companies_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;