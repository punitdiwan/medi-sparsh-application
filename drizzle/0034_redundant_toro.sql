ALTER TABLE "symptom_types" DROP CONSTRAINT "symptom_types_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "symptoms" DROP CONSTRAINT "symptoms_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "symptoms" DROP CONSTRAINT "symptoms_symptom_type_id_symptom_types_id_fk";
--> statement-breakpoint
ALTER TABLE "symptom_types" ADD CONSTRAINT "symptom_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_symptom_type_id_symptom_types_id_fk" FOREIGN KEY ("symptom_type_id") REFERENCES "public"."symptom_types"("id") ON DELETE restrict ON UPDATE no action;