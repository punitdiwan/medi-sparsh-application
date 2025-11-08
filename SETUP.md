# MediSparsh Hospital Management System - Setup Guide

## Overview

MediSparsh is a multi-tenant hospital management system built with:
- **Frontend**: Next.js 16 with shadcn/ui
- **Backend**: Drizzle ORM with PostgreSQL
- **Auth**: Better Auth with shared schema
- **Multi-tenancy**: Domain-based tenant isolation

## Architecture

### Multi-Tenant Design

Each hospital operates on a separate domain (e.g., `hospital1.medisparsh.com`) while sharing a common authentication schema. This ensures:

1. **Shared Auth Schema**: All users authenticate through a shared `auth` schema in PostgreSQL
2. **Tenant Isolation**: Each hospital's data is isolated using the `hospital_id` column
3. **Cross-Hospital Patients**: Patients can belong to multiple hospitals simultaneously
4. **Role-Based Access**: Users can have different roles (patient, doctor, staff, admin) per hospital

### Database Schema

#### Auth Schema (Shared)
- `auth.user` - User accounts (shared across all hospitals)
- `auth.session` - Active sessions
- `auth.account` - OAuth and password accounts
- `auth.verification` - Email/phone verification tokens

#### Public Schema (Multi-Tenant)
- `hospitals` - Hospital/tenant registry
- `user_hospitals` - User-to-hospital mapping with roles
- `patients` - Patient records (linked to hospitals)
- `staff` - Staff members (doctors, receptionists, admins)
- `doctors` - Doctor-specific information
- `specializations` - Medical specializations
- `appointments` - Patient appointments
- `prescriptions` - Prescriptions linked to appointments
- `medical_history` - Patient medical history

## Prerequisites

1. **Node.js** 18+ or **Bun** runtime
2. **PostgreSQL** 14+ database
3. **Environment variables** configured

## Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/medisparsh

# Better Auth
BETTERAUTH_ORIGIN=http://localhost:3000
BETTERAUTH_SECRET=your-secret-key-here

# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Installation Steps

### 1. Install Dependencies

```bash
bun install
```

### 2. Generate Database Migrations

This will create SQL migration files based on your schema:

```bash
bun run db:generate
```

### 3. Push Schema to Database

This will create all tables in your PostgreSQL database:

```bash
bun run db:push
```

### 4. Seed Initial Data

This will populate specializations and create a sample hospital:

```bash
bun run db:seed
```

### 5. Run Development Server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## Database Scripts

| Command | Description |
|---------|-------------|
| `bun run db:generate` | Generate migration files from schema |
| `bun run db:push` | Push schema changes to database |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio (database GUI) |
| `bun run db:seed` | Seed database with initial data |

## Multi-Tenant Configuration

### Adding a New Hospital

1. Insert a new record in the `hospitals` table:

```sql
INSERT INTO hospitals (hospital_id, name, domain, address, phone, email, is_active)
VALUES ('hospital-002', 'City Hospital', 'city.medisparsh.com', '456 Health Ave', '+91-9876543210', 'contact@cityhospital.com', true);
```

2. Configure DNS to point the domain to your application
3. Users can now access this hospital at `city.medisparsh.com`

### Assigning Users to Hospitals

When a user signs up or is added to a hospital:

```typescript
import { db } from "@/lib/db";
import { userHospitals } from "@/lib/db/schema";

await db.insert(userHospitals).values({
  userId: "user_123",
  hospitalId: "hospital-002",
  role: "doctor", // or 'patient', 'staff', 'admin'
  isActive: true,
});
```

## User Roles

- **Patient**: Can book appointments, view prescriptions, manage profile
- **Doctor**: Can view appointments, write prescriptions, manage patient records
- **Staff/Receptionist**: Can schedule appointments, register patients
- **Admin**: Full access to hospital management

## Key Features

### 1. Authentication
- Email/password authentication via Better Auth
- Shared auth schema across all hospitals
- Session management with secure cookies

### 2. Patient Management
- Patients can belong to multiple hospitals
- Unique patient ID across the system
- Medical history tracking
- Appointment scheduling

### 3. Appointments
- Schedule appointments with specific doctors
- Follow-up appointment tracking
- Appointment status management
- Link to prescriptions

### 4. Prescriptions
- Linked to specific appointments
- Medicine management with dosage/frequency
- Lab test recommendations
- Follow-up scheduling

### 5. Multi-Tenancy
- Domain-based tenant identification
- Automatic tenant resolution via middleware
- Isolated data per hospital
- Shared user authentication

## Development Tips

### Accessing Current Hospital

```typescript
import { getCurrentHospital } from "@/lib/tenant";

// In a Server Component or API route
const hospital = await getCurrentHospital();
console.log(hospital.name, hospital.hospitalId);
```

### Validating User Access

```typescript
import { validateUserHospitalAccess } from "@/lib/tenant";

const hasAccess = await validateUserHospitalAccess(
  userId,
  hospitalId,
  "doctor" // optional role check
);
```

### Using Drizzle ORM

```typescript
import { db } from "@/lib/db";
import { patients, appointments } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Query patients for a specific hospital
const hospitalPatients = await db
  .select()
  .from(patients)
  .where(
    and(
      eq(patients.hospitalId, hospitalId),
      eq(patients.isDeleted, false)
    )
  );
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Check database user has necessary permissions

### Migration Errors
- Delete `lib/db/migrations` folder and regenerate
- Ensure schema changes are compatible
- Check for naming conflicts

### Multi-Tenant Issues
- Verify hospital domain is registered in `hospitals` table
- Check middleware is properly configured
- Ensure user-hospital mappings exist in `user_hospitals`

## Next Steps

1. Configure your domains for production hospitals
2. Implement role-based access control in your components
3. Add email verification and password reset flows
4. Set up automated backups for your database
5. Configure SSL certificates for production domains

## Support

For issues or questions, please refer to the documentation:
- [Better Auth Docs](https://better-auth.com)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Next.js Docs](https://nextjs.org/docs)
