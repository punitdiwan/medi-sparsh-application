ALTER TABLE "ipd_admission" DROP CONSTRAINT "ipd_admission_doctor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ipd_admission" ADD CONSTRAINT "ipd_admission_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;