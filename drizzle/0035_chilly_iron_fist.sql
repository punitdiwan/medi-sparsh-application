ALTER TABLE "charge_categories" DROP CONSTRAINT "charge_categories_charge_type_id_charge_types_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_categories" DROP CONSTRAINT "charge_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_types" DROP CONSTRAINT "charge_types_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_charge_category_id_charge_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_charge_type_id_charge_types_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_unit_id_units_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_tax_category_id_tax_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "tax_categories" DROP CONSTRAINT "tax_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_categories" ADD CONSTRAINT "charge_categories_charge_type_id_charge_types_id_fk" FOREIGN KEY ("charge_type_id") REFERENCES "public"."charge_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_categories" ADD CONSTRAINT "charge_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_types" ADD CONSTRAINT "charge_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_charge_category_id_charge_categories_id_fk" FOREIGN KEY ("charge_category_id") REFERENCES "public"."charge_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_charge_type_id_charge_types_id_fk" FOREIGN KEY ("charge_type_id") REFERENCES "public"."charge_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_tax_category_id_tax_categories_id_fk" FOREIGN KEY ("tax_category_id") REFERENCES "public"."tax_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_categories" ADD CONSTRAINT "tax_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;