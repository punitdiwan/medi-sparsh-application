CREATE TABLE "doctor_shifts" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"doctor_user_id" text NOT NULL,
	"shift_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "doctor_shift_unique" UNIQUE("doctor_user_id","shift_id")
);
--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_doctor_user_id_doctors_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE cascade ON UPDATE no action;