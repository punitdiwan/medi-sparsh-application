ALTER TABLE "ipd_medications" DROP CONSTRAINT "ipd_medications_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_medications" DROP CONSTRAINT "ipd_medications_ipd_admission_id_ipd_admission_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_medications" DROP CONSTRAINT "ipd_medications_medicine_id_medicines_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_ipd_admission_id_ipd_admission_id_fk" FOREIGN KEY ("ipd_admission_id") REFERENCES "public"."ipd_admission"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ipd_medications" ADD CONSTRAINT "ipd_medications_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE restrict ON UPDATE no action;