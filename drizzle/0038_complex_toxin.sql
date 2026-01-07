ALTER TABLE "medicine_categories" DROP CONSTRAINT "medicine_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_companies" DROP CONSTRAINT "medicine_companies_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_groups" DROP CONSTRAINT "medicine_groups_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_suppliers" DROP CONSTRAINT "medicine_suppliers_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_units" DROP CONSTRAINT "medicine_units_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_group_id_medicine_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_category_id_medicine_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_company_name_medicine_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_unit_id_medicine_units_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP CONSTRAINT "pharmacy_medicines_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP CONSTRAINT "pharmacy_medicines_category_id_medicine_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP CONSTRAINT "pharmacy_medicines_company_id_medicine_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP CONSTRAINT "pharmacy_medicines_group_id_medicine_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" DROP CONSTRAINT "pharmacy_medicines_unit_id_medicine_units_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" DROP CONSTRAINT "pharmacy_purchase_supplier_id_medicine_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP CONSTRAINT "pharmacy_purchase_item_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP CONSTRAINT "pharmacy_purchase_item_purchase_id_pharmacy_purchase_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" DROP CONSTRAINT "pharmacy_purchase_item_medicine_id_pharmacy_medicines_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales" DROP CONSTRAINT "pharmacy_sales_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" DROP CONSTRAINT "pharmacy_sales_items_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" DROP CONSTRAINT "pharmacy_sales_items_bill_id_pharmacy_sales_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" DROP CONSTRAINT "pharmacy_sales_items_medicine_id_pharmacy_medicines_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_stock" DROP CONSTRAINT "pharmacy_stock_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "pharmacy_stock" DROP CONSTRAINT "pharmacy_stock_medicine_id_pharmacy_medicines_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_categories" ADD CONSTRAINT "medicine_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_companies" ADD CONSTRAINT "medicine_companies_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_groups" ADD CONSTRAINT "medicine_groups_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_suppliers" ADD CONSTRAINT "medicine_suppliers_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_units" ADD CONSTRAINT "medicine_units_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_group_id_medicine_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."medicine_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_category_id_medicine_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."medicine_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_company_name_medicine_companies_id_fk" FOREIGN KEY ("company_name") REFERENCES "public"."medicine_companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_unit_id_medicine_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."medicine_units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_category_id_medicine_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."medicine_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_company_id_medicine_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."medicine_companies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_group_id_medicine_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."medicine_groups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_medicines" ADD CONSTRAINT "pharmacy_medicines_unit_id_medicine_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."medicine_units"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase" ADD CONSTRAINT "pharmacy_purchase_supplier_id_medicine_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."medicine_suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_purchase_id_pharmacy_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."pharmacy_purchase"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_purchase_item" ADD CONSTRAINT "pharmacy_purchase_item_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales" ADD CONSTRAINT "pharmacy_sales_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_bill_id_pharmacy_sales_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."pharmacy_sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_sales_items" ADD CONSTRAINT "pharmacy_sales_items_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pharmacy_stock" ADD CONSTRAINT "pharmacy_stock_medicine_id_pharmacy_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."pharmacy_medicines"("id") ON DELETE restrict ON UPDATE no action;