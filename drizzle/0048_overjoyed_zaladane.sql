ALTER TABLE "pathology_tests" RENAME COLUMN "test_type" TO "sample_type";--> statement-breakpoint
ALTER TABLE "pathology_tests" RENAME COLUMN "report_days" TO "report_hours";--> statement-breakpoint
ALTER TABLE "pathology_tests" DROP CONSTRAINT "pathology_tests_unit_id_pathology_units_id_fk";
--> statement-breakpoint
ALTER TABLE "pathology_parameters" ADD COLUMN "test_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pathology_parameters" ADD CONSTRAINT "pathology_parameters_test_id_pathology_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."pathology_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_tests" DROP COLUMN "test_parameters";--> statement-breakpoint
ALTER TABLE "pathology_tests" DROP COLUMN "unit_id";