CREATE TYPE "public"."radiology_bills_status" AS ENUM('pending', 'paid', 'partially_paid', 'refunded');--> statement-breakpoint
CREATE TABLE "radiology_bills" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_id" text NOT NULL,
	"bill_date" timestamp with time zone DEFAULT now() NOT NULL,
	"bill_discount" numeric NOT NULL,
	"bill_total_amount" numeric NOT NULL,
	"bill_net_amount" numeric NOT NULL,
	"bill_status" "radiology_bills_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radiology_order_tests" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"hospital_id" text NOT NULL,
	"order_id" text NOT NULL,
	"test_id" text NOT NULL,
	"price" numeric NOT NULL,
	"tax" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radiology_orders" (
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
CREATE TABLE "radiology_payments" (
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
CREATE TABLE "radiology_result_values" (
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
CREATE TABLE "radiology_results" (
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
ALTER TABLE "radiology_bills" ADD CONSTRAINT "radiology_bills_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_bills" ADD CONSTRAINT "radiology_bills_order_id_radiology_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."radiology_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_order_tests" ADD CONSTRAINT "radiology_order_tests_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_order_tests" ADD CONSTRAINT "radiology_order_tests_order_id_radiology_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."radiology_orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_order_tests" ADD CONSTRAINT "radiology_order_tests_test_id_radiology_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."radiology_tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_orders" ADD CONSTRAINT "radiology_orders_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_payments" ADD CONSTRAINT "radiology_payments_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_payments" ADD CONSTRAINT "radiology_payments_bill_id_radiology_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."radiology_bills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_result_values" ADD CONSTRAINT "radiology_result_values_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_result_values" ADD CONSTRAINT "radiology_result_values_result_id_radiology_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."radiology_results"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_result_values" ADD CONSTRAINT "radiology_result_values_parameter_id_radiology_parameters_id_fk" FOREIGN KEY ("parameter_id") REFERENCES "public"."radiology_parameters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_results" ADD CONSTRAINT "radiology_results_hospital_id_organization_id_fk" FOREIGN KEY ("hospital_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radiology_results" ADD CONSTRAINT "radiology_results_order_test_id_radiology_order_tests_id_fk" FOREIGN KEY ("order_test_id") REFERENCES "public"."radiology_order_tests"("id") ON DELETE restrict ON UPDATE no action;