# 🏥 MediSparsh - Multi-Tenant Hospital Management System

A comprehensive, multi-tenant hospital management system built with modern technologies.

## 🚀 Tech Stack

- **Frontend**: Next.js 16 with React 19
- **UI Components**: shadcn/ui with Radix UI
- **Styling**: Tailwind CSS 4
- **Backend**: Drizzle ORM with PostgreSQL
- **Authentication**: Better Auth with shared schema
- **Multi-Tenancy**: Domain-based tenant isolation
- **Type Safety**: TypeScript throughout

## ✨ Features

### Multi-Tenant Architecture
- 🏢 **Domain-based isolation**: Each hospital operates on its own domain
- 🔐 **Shared authentication**: Single auth schema for all hospitals
- 👥 **Cross-hospital users**: Patients can belong to multiple hospitals
- 🎭 **Role-based access**: Different roles per hospital (patient, doctor, staff, admin)

### Core Functionality
- 📋 **Patient Management**: Registration, profiles, medical history
- 📅 **Appointment Scheduling**: Book, manage, and track appointments
- 💊 **Prescription System**: Digital prescriptions linked to appointments
- 👨‍⚕️ **Doctor Management**: Profiles, specializations, availability
- 🏥 **Staff Management**: Receptionists, admins, and other staff
- 📊 **Medical History**: Comprehensive patient medical records

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Complete Setup Guide](./SETUP.md)** - Detailed setup and configuration
- **[API Documentation](./API.md)** - API endpoints and usage examples

## 🏁 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL 14+
- Database created

### Installation

```bash
# Install dependencies
bun install

# Configure environment
cp env.template .env
# Edit .env with your database credentials

# Setup database
bun run db:push

# Seed initial data
bun run db:seed

# Start development server
bun run dev
```

Visit `http://localhost:3000` 🎉

## 📁 Project Structure

```
medi-sparsh-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Better Auth endpoints
│   │   ├── patients/     # Patient management
│   │   ├── appointments/ # Appointment management
│   │   └── prescriptions/# Prescription management
│   ├── doctor/           # Doctor dashboard
│   └── receptionist/     # Receptionist dashboard
├── lib/
│   ├── db/               # Database layer
│   │   ├── schema/       # Drizzle schemas
│   │   ├── queries.ts    # Database queries
│   │   └── types.ts      # TypeScript types
│   ├── auth.ts           # Better Auth configuration
│   ├── auth-client.ts    # Client-side auth
│   └── tenant.ts         # Multi-tenant utilities
├── components/           # React components
├── middleware.ts         # Tenant resolution middleware
└── drizzle.config.ts     # Drizzle configuration
```

## 🗄️ Database Schema

### Auth Schema (Shared)
- `auth.user` - User accounts
- `auth.session` - Active sessions
- `auth.account` - Authentication providers
- `auth.verification` - Verification tokens

### Public Schema (Multi-Tenant)
- `hospitals` - Hospital registry
- `user_hospitals` - User-hospital mappings
- `patients` - Patient records
- `staff` - Staff members
- `doctors` - Doctor profiles
- `appointments` - Appointment records
- `prescriptions` - Prescription records
- `medical_history` - Patient medical history
- `specializations` - Medical specializations

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run db:generate` | Generate migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:migrate` | Run migrations |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:seed` | Seed initial data |

## 🔑 Key Concepts

### Multi-Tenancy
Each hospital has a unique domain (e.g., `hospital1.medisparsh.com`). The middleware automatically identifies the tenant from the request domain.

```typescript
import { getCurrentHospital } from "@/lib/tenant";

const hospital = await getCurrentHospital();
console.log(hospital.name); // Current hospital
```

### Authentication
Better Auth provides shared authentication across all hospitals with a separate `auth` schema.

```typescript
import { getCurrentUser } from "@/lib/utils/auth-helpers";

const user = await getCurrentUser();
```

### Database Queries
Use pre-built query functions for common operations:

```typescript
import { getPatientsByHospital } from "@/lib/db/queries";

const patients = await getPatientsByHospital(hospitalId);
```

## 🎯 Next Steps

1. ✅ Backend setup complete
2. ⏳ Create authentication UI pages
3. ⏳ Build role-based dashboards
4. ⏳ Implement appointment booking flow
5. ⏳ Create prescription management UI
6. ⏳ Add medical history interface

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📄 License

Private - All Rights Reserved

## 🆘 Support

- Check [SETUP.md](./SETUP.md) for detailed setup instructions
- Review [API.md](./API.md) for API documentation
- See [QUICKSTART.md](./QUICKSTART.md) for quick setup guide
