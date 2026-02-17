CREATE TYPE "public"."pathology_bills_status" AS ENUM('pending', 'paid', 'partially_paid', 'refunded');--> statement-breakpoint
CREATE TABLE "pathology_bills" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_id" text NOT NULL,
	"bill_date" timestamp with time zone DEFAULT now() NOT NULL,
	"bill_discount" numeric NOT NULL,
	"bill_total_amount" numeric NOT NULL,
	"bill_net_amount" numeric NOT NULL,
	"bill_status" "pathology_bills_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_bills_items" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"bill_id" text NOT NULL,
	"order_test_id" text NOT NULL,
	"test_name" text NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_order_tests" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_id" text NOT NULL,
	"test_id" text NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_orders" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"doctor_id" text,
	"doctor_name" text,
	"order_date" timestamp with time zone DEFAULT now() NOT NULL,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_payments" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"bill_id" text NOT NULL,
	"payment_date" timestamp with time zone DEFAULT now() NOT NULL,
	"payment_amount" numeric NOT NULL,
	"payment_mode" text NOT NULL,
	"reference_no" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_result_values" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"result_id" text NOT NULL,
	"parameter_id" text NOT NULL,
	"result_value" text NOT NULL,
	"unit" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_results" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_test_id" text NOT NULL,
	"result_date" timestamp with time zone DEFAULT now() NOT NULL,
	"remarks" text NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pathology_samples" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_test_id" text NOT NULL,
	"sample_number" text NOT NULL,
	"sample_type" text NOT NULL,
	"sample_date" timestamp with time zone DEFAULT now() NOT NULL,
	"sample_status" text NOT NULL,
	"collected_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pathology_bills" ADD CONSTRAINT "pathology_bills_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_bills" ADD CONSTRAINT "pathology_bills_order_id_pathology_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."pathology_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_bills_items" ADD CONSTRAINT "pathology_bills_items_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_bills_items" ADD CONSTRAINT "pathology_bills_items_bill_id_pathology_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."pathology_bills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_bills_items" ADD CONSTRAINT "pathology_bills_items_order_test_id_pathology_order_tests_id_fk" FOREIGN KEY ("order_test_id") REFERENCES "public"."pathology_order_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_order_tests" ADD CONSTRAINT "pathology_order_tests_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_order_tests" ADD CONSTRAINT "pathology_order_tests_order_id_pathology_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."pathology_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_order_tests" ADD CONSTRAINT "pathology_order_tests_test_id_pathology_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."pathology_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_orders" ADD CONSTRAINT "pathology_orders_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_orders" ADD CONSTRAINT "pathology_orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_payments" ADD CONSTRAINT "pathology_payments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_payments" ADD CONSTRAINT "pathology_payments_bill_id_pathology_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."pathology_bills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_result_values" ADD CONSTRAINT "pathology_result_values_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_result_values" ADD CONSTRAINT "pathology_result_values_result_id_pathology_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."pathology_results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_result_values" ADD CONSTRAINT "pathology_result_values_parameter_id_pathology_parameters_id_fk" FOREIGN KEY ("parameter_id") REFERENCES "public"."pathology_parameters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_results" ADD CONSTRAINT "pathology_results_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_results" ADD CONSTRAINT "pathology_results_order_test_id_pathology_order_tests_id_fk" FOREIGN KEY ("order_test_id") REFERENCES "public"."pathology_order_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_samples" ADD CONSTRAINT "pathology_samples_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathology_samples" ADD CONSTRAINT "pathology_samples_order_test_id_pathology_order_tests_id_fk" FOREIGN KEY ("order_test_id") REFERENCES "public"."pathology_order_tests"("id") ON DELETE restrict ON UPDATE no action;