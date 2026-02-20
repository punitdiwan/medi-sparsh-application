CREATE TABLE "master_permissions" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"subject" text NOT NULL,
	"action" text NOT NULL,
	"module_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "master_permissions" ADD CONSTRAINT "master_permissions_module_id_master_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."master_modules"("id") ON DELETE restrict ON UPDATE no action;