ALTER TABLE "ipd_charges" DROP CONSTRAINT "ipd_charges_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_charges" DROP CONSTRAINT "ipd_charges_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_charges" DROP CONSTRAINT "ipd_charges_charge_type_id_charge_types_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_charges" DROP CONSTRAINT "ipd_charges_charge_category_id_charge_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_charges" DROP CONSTRAINT "ipd_charges_charge_id_charges_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_consultation" DROP CONSTRAINT "ipd_consultation_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_consultation" DROP CONSTRAINT "ipd_consultation_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_consultation" DROP CONSTRAINT "ipd_consultation_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_operations" DROP CONSTRAINT "ipd_operations_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_operations" DROP CONSTRAINT "ipd_operations_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_operations" DROP CONSTRAINT "ipd_operations_operation_id_operations_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_payments" DROP CONSTRAINT "ipd_payments_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_payments" DROP CONSTRAINT "ipd_payments_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" DROP CONSTRAINT "ipd_prescriptions_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" DROP CONSTRAINT "ipd_prescriptions_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_vitals" DROP CONSTRAINT "ipd_vitals_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_vitals" DROP CONSTRAINT "ipd_vitals_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_type_id_charge_types_id_fk" FOREIGN KEY ("charge_type_id") REFERENCES "public"."charge_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_category_id_charge_categories_id_fk" FOREIGN KEY ("charge_category_id") REFERENCES "public"."charge_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_charges" ADD CONSTRAINT "ipd_charges_charge_id_charges_id_fk" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_consultation" ADD CONSTRAINT "ipd_consultation_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_operations" ADD CONSTRAINT "ipd_operations_operation_id_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD CONSTRAINT "ipd_payments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_payments" ADD CONSTRAINT "ipd_payments_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_vitals" ADD CONSTRAINT "ipd_vitals_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_vitals" ADD CONSTRAINT "ipd_vitals_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;