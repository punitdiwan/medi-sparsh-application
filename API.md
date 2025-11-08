# MediSparsh API Documentation

## Overview

All API routes are authenticated and tenant-aware. They automatically identify the hospital based on the domain and require user authentication via Better Auth.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication. Include the session cookie in your requests.

### Using from Client Components

```typescript
import { authClient } from "@/lib/auth-client";

// The authClient automatically handles cookies
const response = await fetch('/api/patients', {
  method: 'GET',
  credentials: 'include', // Important: include cookies
});
```

## Endpoints

### Patients

#### Get All Patients

```http
GET /api/patients
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "patientId": "PABCDEFGHIJ",
      "name": "John Doe",
      "gender": "male",
      "dob": "1990-01-01",
      "email": "john@example.com",
      "mobileNumber": "+91-9876543210",
      "hospitalId": "hospital-001",
      ...
    }
  ]
}
```

#### Create Patient

```http
POST /api/patients
```

**Request Body:**

```json
{
  "name": "John Doe",
  "gender": "male",
  "dob": "1990-01-01",
  "email": "john@example.com",
  "mobileNumber": "+91-9876543210",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "areaOrPin": "400001",
  "bloodGroup": "O+",
  "preferredLanguage": "English"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "patientId": "PABCDEFGHIJ",
    "name": "John Doe",
    ...
  }
}
```

### Appointments

#### Create Appointment

```http
POST /api/appointments
```

**Request Body:**

```json
{
  "patientId": "PABCDEFGHIJ",
  "doctorUserId": "doctor_123",
  "appointmentDate": "2024-11-05",
  "appointmentTime": "10:00 AM",
  "reason": "Regular checkup",
  "notes": "Patient has mild fever",
  "isFollowUp": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "appointmentId": "APTXYZ123456",
    "status": "scheduled",
    ...
  }
}
```

### Prescriptions

#### Create Prescription

```http
POST /api/prescriptions
```

**Request Body:**

```json
{
  "appointmentId": "APTXYZ123456",
  "patientId": "PABCDEFGHIJ",
  "diagnosis": "Common cold with mild fever",
  "symptoms": "Runny nose, sore throat, body ache",
  "medicines": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "1 tablet",
      "frequency": "Three times a day",
      "duration": "5 days",
      "instructions": "Take after meals"
    },
    {
      "name": "Cetirizine 10mg",
      "dosage": "1 tablet",
      "frequency": "Once daily",
      "duration": "3 days",
      "instructions": "Take at bedtime"
    }
  ],
  "labTests": [
    {
      "name": "Complete Blood Count",
      "description": "To check for infection"
    }
  ],
  "followUpRequired": true,
  "followUpDate": "2024-11-12",
  "followUpNotes": "Review blood test results",
  "additionalNotes": "Drink plenty of fluids and rest"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "prescriptionId": "RXABC1234567",
    "diagnosis": "Common cold with mild fever",
    ...
  }
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User doesn't have access to this hospital
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Client-Side Usage Examples

### Creating a Patient

```typescript
async function createPatient(data: PatientData) {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}
```

### Fetching Patients

```typescript
async function getPatients() {
  const response = await fetch('/api/patients', {
    credentials: 'include',
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}
```

### Creating an Appointment

```typescript
async function createAppointment(data: AppointmentData) {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}
```

## Server Component Usage

You can also use the database queries directly in Server Components:

```typescript
import { getPatientsByHospital } from "@/lib/db/queries";
import { getCurrentHospital } from "@/lib/tenant";

export default async function PatientsPage() {
  const hospital = await getCurrentHospital();
  const patients = await getPatientsByHospital(hospital.hospitalId);
  
  return (
    <div>
      <h1>Patients at {hospital.name}</h1>
      {/* Render patients */}
    </div>
  );
}
```

## Multi-Tenant Considerations

1. **Automatic Tenant Resolution**: The middleware automatically identifies the hospital based on the domain
2. **User-Hospital Access**: Ensure users are mapped to hospitals in the `user_hospitals` table
3. **Cross-Hospital Patients**: Patients can exist across multiple hospitals with the same `patientId`

## Database Queries

For direct database access, use the query functions from `@/lib/db/queries`:

```typescript
import {
  getPatientById,
  getPatientsByHospital,
  createPatient,
  getAppointmentsByDoctor,
  createPrescription,
  // ... more functions
} from "@/lib/db/queries";
```

## Type Safety

All database operations are fully typed. Import types from `@/lib/db/types`:

```typescript
import type {
  Patient,
  NewPatient,
  Appointment,
  NewAppointment,
  Prescription,
  Medicine,
} from "@/lib/db/types";
```
