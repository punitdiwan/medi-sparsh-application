CREATE TABLE "module_permissions" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"module_id" text NOT NULL,
	"permission_id" text NOT NULL,
	CONSTRAINT "module_permissions_module_id_permission_id_unique" UNIQUE("module_id","permission_id")
);
--> statement-breakpoint
ALTER TABLE "module_permissions" ADD CONSTRAINT "module_permissions_module_id_master_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."master_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_permissions" ADD CONSTRAINT "module_permissions_permission_id_master_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."master_permissions"("id") ON DELETE restrict ON UPDATE no action;