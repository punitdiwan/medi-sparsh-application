ALTER TABLE "ipd_prescriptions" DROP CONSTRAINT "ipd_prescriptions_prescribeBy_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_prescriptions" ADD CONSTRAINT "ipd_prescriptions_prescribeBy_doctors_id_fk" FOREIGN KEY ("prescribeBy") REFERENCES "public"."doctors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;