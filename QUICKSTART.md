# Quick Start Guide

Get your MediSparsh Hospital Management System up and running in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ or Bun installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Database created (e.g., `medisparsh`)

## Step-by-Step Setup

### 1. Clone & Install

```bash
cd medi-sparsh-app
bun install
```

### 2. Configure Environment

Copy the environment template and edit it:

```bash
cp env.template .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/medisparsh
BETTERAUTH_ORIGIN=http://localhost:3000
BETTERAUTH_SECRET=your-secret-key-change-this
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Setup Database

Push the schema to your database:

```bash
bun run db:push
```

This will create:
- `auth` schema with Better Auth tables
- `public` schema with all hospital management tables

### 4. Seed Initial Data

Add specializations and a sample hospital:

```bash
bun run db:seed
```

This creates:
- 10 medical specializations
- A sample hospital with domain `localhost:3000`

### 5. Start Development Server

```bash
bun run dev
```

Visit `http://localhost:3000` to see your application!

## What's Next?

### Create Your First Admin User

1. Navigate to `/sign-up` (you'll need to create this page)
2. Register with email and password
3. Manually add the user to the hospital in the database:

```sql
-- Get the user ID from auth.user table
SELECT id, email FROM auth.user;

-- Add user to hospital as admin
INSERT INTO user_hospitals (user_id, hospital_id, role, is_active)
VALUES ('user_id_from_above', 'hospital-001', 'admin', true);

-- Create staff record
INSERT INTO staff (user_id, hospital_id, name, role, email, is_active)
VALUES ('user_id_from_above', 'hospital-001', 'Admin Name', 'admin', 'admin@email.com', true);
```

### Database Management

```bash
# View your database in a GUI
bun run db:studio

# Generate new migrations after schema changes
bun run db:generate

# Apply migrations
bun run db:migrate
```

### Testing Multi-Tenancy

To test multi-tenant functionality:

1. Add a new hospital in the database:

```sql
INSERT INTO hospitals (hospital_id, name, domain, email, is_active)
VALUES ('hospital-002', 'Test Hospital', 'test.localhost:3000', 'test@hospital.com', true);
```

2. Update your `/etc/hosts` file:

```
127.0.0.1 test.localhost
```

3. Access `http://test.localhost:3000`

## Common Tasks

### Add a Doctor

```sql
-- 1. Create user account (via sign-up page or manually)
-- 2. Add to hospital
INSERT INTO user_hospitals (user_id, hospital_id, role, is_active)
VALUES ('doctor_user_id', 'hospital-001', 'doctor', true);

-- 3. Create staff record
INSERT INTO staff (user_id, hospital_id, name, role, email, gender, department)
VALUES ('doctor_user_id', 'hospital-001', 'Dr. Smith', 'doctor', 'smith@hospital.com', 'male', 'Cardiology');

-- 4. Create doctor record
INSERT INTO doctors (user_id, hospital_id, specialization, qualification, experience, consultation_fee)
VALUES (
  'doctor_user_id',
  'hospital-001',
  '[{"name": "Cardiology", "description": "Heart specialist"}]'::jsonb,
  'MBBS, MD (Cardiology)',
  '10 years',
  '500'
);
```

### Add a Patient

Use the API endpoint or manually:

```sql
INSERT INTO patients (
  patient_id, hospital_id, name, gender, dob,
  mobile_number, email, blood_group
)
VALUES (
  'P' || upper(substring(md5(random()::text) from 1 for 10)),
  'hospital-001',
  'John Doe',
  'male',
  '1985-05-15',
  '+91-9876543210',
  'john@example.com',
  'O+'
);
```

## Troubleshooting

### "Hospital not found" Error

Make sure you have a hospital with domain matching your current URL:

```sql
SELECT * FROM hospitals WHERE domain = 'localhost:3000';
```

If not found, insert one:

```sql
INSERT INTO hospitals (hospital_id, name, domain, is_active)
VALUES ('hospital-001', 'Main Hospital', 'localhost:3000', true);
```

### Database Connection Error

- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Ensure database exists: `psql -l`

### Auth Not Working

- Clear browser cookies
- Check BETTERAUTH_SECRET is set in `.env`
- Verify auth schema exists: `\dn` in psql

## Development Workflow

1. **Make Schema Changes**: Edit files in `lib/db/schema/`
2. **Generate Migration**: `bun run db:generate`
3. **Review Migration**: Check `lib/db/migrations/`
4. **Apply Changes**: `bun run db:push` (dev) or `bun run db:migrate` (prod)

## Useful SQL Queries

### View All Users and Their Hospitals

```sql
SELECT 
  u.email,
  uh.role,
  h.name as hospital_name,
  h.domain
FROM auth.user u
JOIN user_hospitals uh ON u.id = uh.user_id
JOIN hospitals h ON uh.hospital_id = h.hospital_id
WHERE uh.is_active = true;
```

### View All Appointments for Today

```sql
SELECT 
  a.appointment_id,
  p.name as patient_name,
  s.name as doctor_name,
  a.appointment_time,
  a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN staff s ON a.doctor_user_id = s.user_id
WHERE a.appointment_date = CURRENT_DATE
AND a.hospital_id = 'hospital-001'
ORDER BY a.appointment_time;
```

### View Patient Prescription History

```sql
SELECT 
  pr.prescription_id,
  pr.diagnosis,
  pr.created_at,
  s.name as doctor_name,
  pr.medicines
FROM prescriptions pr
JOIN staff s ON pr.doctor_user_id = s.user_id
WHERE pr.patient_id = 'PATIENT_ID_HERE'
ORDER BY pr.created_at DESC;
```

## Next Steps

1. ✅ Database setup complete
2. ⏳ Create authentication pages (sign-in, sign-up)
3. ⏳ Build dashboard for each role (patient, doctor, staff)
4. ⏳ Implement appointment booking UI
5. ⏳ Create prescription management interface
6. ⏳ Add medical history tracking
7. ⏳ Implement role-based access control

## Resources

- [Full Setup Guide](./SETUP.md)
- [API Documentation](./API.md)
- [Better Auth Docs](https://better-auth.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)

## Need Help?

Check the detailed [SETUP.md](./SETUP.md) for comprehensive documentation.
