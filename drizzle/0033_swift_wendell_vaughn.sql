ALTER TABLE "bed_groups" DROP CONSTRAINT "bed_groups_floor_id_floors_id_fk";
--> statement-breakpoint
ALTER TABLE "bed_groups" DROP CONSTRAINT "bed_groups_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "beds" DROP CONSTRAINT "beds_bed_type_id_beds_types_id_fk";
--> statement-breakpoint
ALTER TABLE "beds" DROP CONSTRAINT "beds_bed_group_id_bed_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "beds" DROP CONSTRAINT "beds_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "beds_types" DROP CONSTRAINT "beds_types_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "floors" DROP CONSTRAINT "floors_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "bed_groups" ADD CONSTRAINT "bed_groups_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_groups" ADD CONSTRAINT "bed_groups_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_bed_type_id_beds_types_id_fk" FOREIGN KEY ("bed_type_id") REFERENCES "public"."beds_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_bed_group_id_bed_groups_id_fk" FOREIGN KEY ("bed_group_id") REFERENCES "public"."bed_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds_types" ADD CONSTRAINT "beds_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;