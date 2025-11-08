CREATE SCHEMA public;

CREATE TABLE public.patients (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT ,
    gender TEXT,
    dob DATE,
    mobile_number TEXT NOT NULL,
    city TEXT,
    area_or_pin TEXT,
    blood_group TEXT,
    referred_by_dr TEXT,
    address TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.patients TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

ALTER TABLE public.patients
ADD COLUMN state TEXT;


ALTER TABLE public.patients
ADD COLUMN patient_id CHAR(12) UNIQUE;

ALTER TABLE public.patients
ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN is_mobile_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE patients
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();






CREATE TABLE public.staffs (
    user_id TEXT PRIMARY KEY,  
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('doctor', 'receptionist', 'admin')) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    number TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    dob DATE,
    department TEXT,
    joining_date DATE,
    address TEXT,
    created_by UUID REFERENCES public.staffs(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staffs_set_updated_at
BEFORE UPDATE ON public.staffs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();


CREATE TRIGGER patients_set_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.staffs TO anon;


ALTER TABLE staffs
ALTER COLUMN created_by TYPE text
USING created_by::text;

CREATE TABLE specializations (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES staffs(user_id) ON DELETE CASCADE,
  
  specialization JSONB NOT NULL, 
  
  qualification TEXT NOT NULL,
  experience TEXT NOT NULL,
  consultation_fee TEXT NOT NULL,
  availability TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


ALTER TABLE doctors
RENAME COLUMN specialization_ids_old TO specialization_ids;

ALTER TABLE doctors DROP CONSTRAINT fk_doctor_specialization;

ALTER TABLE doctors
ALTER COLUMN specialization_ids TYPE JSONB
USING to_jsonb(ARRAY[specialization_ids]);

ALTER TABLE doctors
ALTER COLUMN specialization_ids SET DEFAULT '[]';


GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.specializations TO anon;

GRANT USAGE, SELECT ON SEQUENCE public.specializations_id_seq TO anon;

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.doctors TO anon;

GRANT USAGE, SELECT ON SEQUENCE public.doctors_id_seq TO anon;

ALTER TABLE public.staffs
ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT FALSE;

ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS isDeleted BOOLEAN DEFAULT FALSE;

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS scheduled_by TEXT REFERENCES public.staffs(user_id) ON DELETE SET NULL;



CREATE TABLE public.appointments (
    id SERIAL PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    purpose TEXT,
    appointment_type TEXT DEFAULT 'consultation',
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.appointments
ADD CONSTRAINT fk_patient
FOREIGN KEY (patient_id)
REFERENCES public.patients (id)
ON DELETE RESTRICT
ON UPDATE CASCADE;


ALTER TABLE public.appointments
ADD CONSTRAINT fk_doctor
FOREIGN KEY (doctor_id)
REFERENCES public.doctors (user_id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE public.appointments
ADD CONSTRAINT fk_created_by
FOREIGN KEY (created_by)
REFERENCES public.staffs (user_id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.appointments TO anon;

GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.appointments_id_seq TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.appointments TO authenticated;


GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;


CREATE TABLE public.prescriptions (
  id SERIAL PRIMARY KEY,
  
  appointment_id INTEGER NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE ON UPDATE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES public.doctors(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  
  vitals JSONB,
  diagnosis TEXT,
  symptoms TEXT,
  medicines JSONB,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE public.prescriptions TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;