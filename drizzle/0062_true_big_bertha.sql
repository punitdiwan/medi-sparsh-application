CREATE TABLE "master_modules" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "master_modules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "modules" DROP CONSTRAINT "modules_hospital_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "module_id" text;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_module_id_master_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."master_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;