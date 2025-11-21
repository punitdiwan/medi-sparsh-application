CREATE TABLE "bed_groups" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"floor_id" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"bed_type_id" text NOT NULL,
	"bed_group_id" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beds_types" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "floors" (
	"id" text PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"hospital_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "prescriptions" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "services" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT uuidv7();--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "services" jsonb;--> statement-breakpoint
ALTER TABLE "bed_groups" ADD CONSTRAINT "bed_groups_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bed_groups" ADD CONSTRAINT "bed_groups_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_bed_type_id_beds_types_id_fk" FOREIGN KEY ("bed_type_id") REFERENCES "public"."beds_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds" ADD CONSTRAINT "beds_bed_group_id_bed_groups_id_fk" FOREIGN KEY ("bed_group_id") REFERENCES "public"."bed_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beds_types" ADD CONSTRAINT "beds_types_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "floors" ADD CONSTRAINT "floors_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "auth"."organization"("id") ON DELETE cascade ON UPDATE no action;