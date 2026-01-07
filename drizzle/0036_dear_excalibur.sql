ALTER TABLE "appointment_priorities" DROP CONSTRAINT "appointment_priorities_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_shifts" DROP CONSTRAINT "doctor_shifts_doctor_user_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_shifts" DROP CONSTRAINT "doctor_shifts_shift_id_shifts_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_shifts" DROP CONSTRAINT "doctor_shifts_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_slots" DROP CONSTRAINT "doctor_slots_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_slots" DROP CONSTRAINT "doctor_slots_shift_id_shifts_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_slots" DROP CONSTRAINT "doctor_slots_charge_id_charges_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_slots" DROP CONSTRAINT "doctor_slots_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "appointment_priorities" ADD CONSTRAINT "appointment_priorities_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_doctor_user_id_doctors_id_fk" FOREIGN KEY ("doctor_user_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;