CREATE TABLE "slot_bookings" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"slot_id" text NOT NULL,
	"appointment_id" text NOT NULL,
	"appointment_date" date NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_active_slot_booking" UNIQUE("slot_id","appointment_date","status")
);
--> statement-breakpoint
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_slot_id_doctor_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."doctor_slots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "slot_bookings_appointment_idx" ON "slot_bookings" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "slot_bookings_slot_date_idx" ON "slot_bookings" USING btree ("slot_id","appointment_date");