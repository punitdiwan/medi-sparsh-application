CREATE TABLE "settings" (
	"organization_id" varchar(256) NOT NULL,
	"key" varchar(256) NOT NULL,
	"value" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settings_key_unique" PRIMARY KEY("key","organization_id")
);
