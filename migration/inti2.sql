-- DROP SCHEMA medisparsh;

CREATE SCHEMA medisparsh AUTHORIZATION postgres;

-- DROP SEQUENCE medisparsh.appointments_id_seq;

CREATE SEQUENCE medisparsh.appointments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE medisparsh.doctors_id_seq;

CREATE SEQUENCE medisparsh.doctors_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE medisparsh.patients_id_seq;

CREATE SEQUENCE medisparsh.patients_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE medisparsh.prescriptions_id_seq;

CREATE SEQUENCE medisparsh.prescriptions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE medisparsh.specializations_id_seq;

CREATE SEQUENCE medisparsh.specializations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- medisparsh.specializations definition

-- Drop table

-- DROP TABLE medisparsh.specializations;

CREATE TABLE medisparsh.specializations (
	id serial4 NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT specializations_name_key UNIQUE (name),
	CONSTRAINT specializations_pkey PRIMARY KEY (id)
);


-- medisparsh.staffs definition

-- Drop table

-- DROP TABLE medisparsh.staffs;

CREATE TABLE medisparsh.staffs (
	user_id text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	email text NOT NULL,
	"number" text NULL,
	gender text NULL,
	dob date NULL,
	department text NULL,
	joining_date date NULL,
	address text NULL,
	created_by text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	isdeleted bool DEFAULT false NULL,
	CONSTRAINT staffs_email_key UNIQUE (email),
	CONSTRAINT staffs_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text]))),
	CONSTRAINT staffs_pkey PRIMARY KEY (user_id),
	CONSTRAINT staffs_role_check CHECK ((role = ANY (ARRAY['doctor'::text, 'receptionist'::text, 'admin'::text])))
);

-- Table Triggers

create trigger staffs_set_updated_at before
update
    on
    medisparsh.staffs for each row execute function medisparsh.set_updated_at();


-- medisparsh.doctors definition

-- Drop table

-- DROP TABLE medisparsh.doctors;

CREATE TABLE medisparsh.doctors (
	id serial4 NOT NULL,
	user_id text NOT NULL,
	specialization jsonb NOT NULL,
	qualification text NOT NULL,
	experience text NOT NULL,
	consultation_fee text NOT NULL,
	availability text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	isdeleted bool DEFAULT false NULL,
	CONSTRAINT doctors_pkey PRIMARY KEY (id),
	CONSTRAINT doctors_user_id_key UNIQUE (user_id),
	CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES medisparsh.staffs(user_id) ON DELETE CASCADE
);


-- medisparsh.patients definition

-- Drop table

-- DROP TABLE medisparsh.patients;

CREATE TABLE medisparsh.patients (
	id text DEFAULT nextval('medisparsh.patients_id_seq'::regclass) NOT NULL,
	full_name text NOT NULL,
	email text NULL,
	gender text NULL,
	dob date NULL,
	mobile_number text NOT NULL,
	city text NULL,
	area_or_pin text NULL,
	blood_group text NULL,
	referred_by_dr text NULL,
	address text NULL,
	state text NULL,
	patient_id bpchar(12) NULL,
	is_email_verified bool DEFAULT false NULL,
	is_mobile_verified bool DEFAULT false NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	scheduled_by text NULL,
	isdeleted bool DEFAULT false NULL,
	CONSTRAINT patients_pkey PRIMARY KEY (id),
	CONSTRAINT unique_patient_id UNIQUE (patient_id),
	CONSTRAINT patients_scheduled_by_fkey FOREIGN KEY (scheduled_by) REFERENCES medisparsh.staffs(user_id) ON DELETE SET NULL
);

-- Table Triggers

create trigger patients_set_updated_at before
update
    on
    medisparsh.patients for each row execute function medisparsh.set_updated_at();


-- medisparsh.appointments definition

-- Drop table

-- DROP TABLE medisparsh.appointments;

CREATE TABLE medisparsh.appointments (
	id serial4 NOT NULL,
	patient_id text NOT NULL,
	doctor_id text NOT NULL,
	created_by text NOT NULL,
	appointment_date text NOT NULL,
	appointment_time text NOT NULL,
	purpose text NULL,
	appointment_type text DEFAULT 'consultation'::text NULL,
	status text DEFAULT 'scheduled'::text NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT appointments_pkey PRIMARY KEY (id),
	CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES medisparsh.staffs(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_doctor FOREIGN KEY (doctor_id) REFERENCES medisparsh.doctors(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES medisparsh.patients(id) ON DELETE RESTRICT ON UPDATE CASCADE
);


-- medisparsh.prescriptions definition

-- Drop table

-- DROP TABLE medisparsh.prescriptions;

CREATE TABLE medisparsh.prescriptions (
	id serial4 NOT NULL,
	appointment_id int4 NOT NULL,
	patient_id text NOT NULL,
	doctor_id text NOT NULL,
	vitals jsonb NULL,
	diagnosis text NULL,
	symptoms text NULL,
	medicines jsonb NULL,
	notes text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
	CONSTRAINT prescriptions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES medisparsh.appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES medisparsh.doctors(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES medisparsh.patients(id) ON DELETE CASCADE ON UPDATE CASCADE
);



-- DROP FUNCTION medisparsh.set_updated_at();

CREATE OR REPLACE FUNCTION medisparsh.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;