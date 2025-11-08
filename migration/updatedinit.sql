-- ======================
-- Create Schema
-- ======================
CREATE SCHEMA IF NOT EXISTS medisparsh;

COMMENT ON SCHEMA medisparsh IS 'Main schema for Medisparsh EMR application';

-- ======================
-- Shared Function: Update `updated_at` on record changes
-- ======================
CREATE OR REPLACE FUNCTION medisparsh.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================
-- 1️⃣ Staffs Table (Base Table)
-- ======================
CREATE TABLE IF NOT EXISTS medisparsh.staffs (
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
    created_by TEXT REFERENCES medisparsh.staffs(user_id) ON DELETE SET NULL,
    isDeleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for Staffs
DROP TRIGGER IF EXISTS staffs_set_updated_at ON medisparsh.staffs;
CREATE TRIGGER staffs_set_updated_at
BEFORE UPDATE ON medisparsh.staffs
FOR EACH ROW
EXECUTE FUNCTION medisparsh.set_updated_at();

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE medisparsh.staffs TO anon;

-- ======================
-- 2️⃣ Specializations Table
-- ======================
CREATE TABLE IF NOT EXISTS medisparsh.specializations (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE medisparsh.specializations TO anon;
GRANT USAGE, SELECT ON SEQUENCE medisparsh.specializations_id_seq TO anon;

-- ======================
-- 3️⃣ Doctors Table (Depends on Staffs)
-- ======================
CREATE TABLE IF NOT EXISTS medisparsh.doctors (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE 
        REFERENCES medisparsh.staffs(user_id) 
        ON DELETE RESTRICT,  -- prevent deleting staff if doctor exists
    specialization JSONB NOT NULL,  -- [{ name, description }]
    qualification TEXT NOT NULL,
    experience TEXT NOT NULL,
    consultation_fee TEXT NOT NULL,
    availability TEXT,
    isDeleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for Doctors
DROP TRIGGER IF EXISTS doctors_set_updated_at ON medisparsh.doctors;
CREATE TRIGGER doctors_set_updated_at
BEFORE UPDATE ON medisparsh.doctors
FOR EACH ROW
EXECUTE FUNCTION medisparsh.set_updated_at();

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE medisparsh.doctors TO anon;
GRANT USAGE, SELECT ON SEQUENCE medisparsh.doctors_id_seq TO anon;

-- ======================
-- 4️⃣ Patients Table (Independent, but references doctors optionally)
-- ======================
CREATE TABLE IF NOT EXISTS medisparsh.patients (
    id SERIAL PRIMARY KEY,
    patient_id CHAR(12) UNIQUE NOT NULL,

    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    dob DATE,
    age INT GENERATED ALWAYS AS (
        DATE_PART('year', AGE(CURRENT_DATE, dob))
    ) STORED,

    email TEXT UNIQUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    mobile_number TEXT UNIQUE NOT NULL,
    is_mobile_verified BOOLEAN DEFAULT FALSE,

    address TEXT,
    city TEXT,
    state TEXT,
    area_or_pin TEXT,

    blood_group TEXT CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    ),

    referred_by_dr TEXT REFERENCES medisparsh.doctors(user_id) ON DELETE SET NULL,
    scheduled_by TEXT REFERENCES medisparsh.staffs(user_id) ON DELETE SET NULL,

    preferred_language TEXT,
    isDeleted BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for Patients
DROP TRIGGER IF EXISTS patients_set_updated_at ON medisparsh.patients;
CREATE TRIGGER patients_set_updated_at
BEFORE UPDATE ON medisparsh.patients
FOR EACH ROW
EXECUTE FUNCTION medisparsh.set_updated_at();

GRANT TRIGGER, UPDATE, REFERENCES, TRUNCATE, DELETE, INSERT, SELECT ON TABLE medisparsh.patients TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA medisparsh TO anon;
