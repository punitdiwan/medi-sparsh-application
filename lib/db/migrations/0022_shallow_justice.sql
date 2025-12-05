ALTER TABLE "auth"."account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."invitation" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."organization" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."team" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."team_member" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."account" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."invitation" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."member" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."organization" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."session" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."team" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."team_member" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."user" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "auth"."verification" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "appointment_priorities" DROP CONSTRAINT "appointment_priorities_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "bed_groups" DROP CONSTRAINT "bed_groups_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "beds" DROP CONSTRAINT "beds_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "beds_types" DROP CONSTRAINT "beds_types_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_categories" DROP CONSTRAINT "charge_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charge_types" DROP CONSTRAINT "charge_types_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "charges" DROP CONSTRAINT "charges_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_shifts" DROP CONSTRAINT "doctor_shifts_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_slots" DROP CONSTRAINT "doctor_slots_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "floors" DROP CONSTRAINT "floors_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_categories" DROP CONSTRAINT "medicine_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_companies" DROP CONSTRAINT "medicine_companies_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicine_units" DROP CONSTRAINT "medicine_units_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "medicines" DROP CONSTRAINT "medicines_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "shifts" DROP CONSTRAINT "shifts_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "staff" DROP CONSTRAINT "staff_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "tax_categories" DROP CONSTRAINT "tax_categories_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "vitals" DROP CONSTRAINT "vitals_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "appointment_priorities" ADD CONSTRAINT "appointment_priorities_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_groups" ADD CONSTRAINT "bed_groups_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds_types" ADD CONSTRAINT "beds_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_categories" ADD CONSTRAINT "charge_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charge_types" ADD CONSTRAINT "charge_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charges" ADD CONSTRAINT "charges_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_shifts" ADD CONSTRAINT "doctor_shifts_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_slots" ADD CONSTRAINT "doctor_slots_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_categories" ADD CONSTRAINT "medicine_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_companies" ADD CONSTRAINT "medicine_companies_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_units" ADD CONSTRAINT "medicine_units_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_categories" ADD CONSTRAINT "tax_categories_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP SCHEMA "auth";
