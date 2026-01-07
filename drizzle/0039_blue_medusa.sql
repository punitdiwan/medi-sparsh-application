ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_bed_group_id_bed_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_bed_id_beds_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_appointment_id_appointments_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_appointment_id_appointments_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "vitals" DROP CONSTRAINT "vitals_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_bed_group_id_bed_groups_id_fk" FOREIGN KEY ("bed_group_id") REFERENCES "public"."bed_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_bed_id_beds_id_fk" FOREIGN KEY ("bed_id") REFERENCES "public"."beds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;