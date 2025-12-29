ALTER TABLE "ipd_admission" ADD COLUMN "discharge_date" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "is_admitted" boolean DEFAULT false;