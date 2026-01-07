ALTER TABLE "operations" DROP CONSTRAINT "operations_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "operations" DROP CONSTRAINT "operations_operation_category_id_operation_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operations" ADD CONSTRAINT "operations_operation_category_id_operation_categories_id_fk" FOREIGN KEY ("operation_category_id") REFERENCES "public"."operation_categories"("id") ON DELETE restrict ON UPDATE no action;