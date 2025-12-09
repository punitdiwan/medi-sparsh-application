CREATE TABLE "medicine_groups" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medicine_suppliers" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"hospital_id" text NOT NULL,
	"supplier_name" text NOT NULL,
	"contact_number" text NOT NULL,
	"address" text NOT NULL,
	"contact_person" text NOT NULL,
	"contact_person_number" text NOT NULL,
	"drug_license_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"hospital_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expiresAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updatedAt" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "medicines" ADD COLUMN "group_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "medicine_groups" ADD CONSTRAINT "medicine_groups_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicine_suppliers" ADD CONSTRAINT "medicine_suppliers_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_group_id_medicine_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."medicine_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" DROP CONSTRAINT "settings_key_unique";
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_key_unique" PRIMARY KEY("key","organization_id");--> statement-breakpoint
DROP SCHEMA "auth";
