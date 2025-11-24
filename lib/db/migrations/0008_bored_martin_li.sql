CREATE TABLE "appointment_priorities" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"priority" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment_priorities" ADD CONSTRAINT "appointment_priorities_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;