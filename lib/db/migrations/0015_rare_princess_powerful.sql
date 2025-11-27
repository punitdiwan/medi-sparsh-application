ALTER TABLE "vital_signs" RENAME TO "vitals";--> statement-breakpoint
ALTER TABLE "vitals" RENAME COLUMN "unit_id" TO "vitals_unit";--> statement-breakpoint
ALTER TABLE "vitals" DROP CONSTRAINT "vital_signs_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;