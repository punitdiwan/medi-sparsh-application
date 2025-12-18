import type {
  user,
  session ,
  organization,
  member,
  patients,
  staff,
  doctors,
  specializations,
  appointments,
  prescriptions,
} from "@/drizzle/schema";

// Infer types from Drizzle schemas (Better Auth)
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;

export type Doctor = typeof doctors.$inferSelect;
export type NewDoctor = typeof doctors.$inferInsert;

export type Specialization = typeof specializations.$inferSelect;
export type NewSpecialization = typeof specializations.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;

// Note: Medical history types removed as table is commented out in schema

// Role types
export type UserRole = "patient" | "doctor" | "staff" | "admin";
export type StaffRole = "doctor" | "receptionist" | "admin";
export type Gender = "male" | "female" | "other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export type CustomeSession = {
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    };
    session: {
        expiresAt: string;
        createdAt: string;
        updatedAt: string;
        activeOrganizationId: string;
        id: string;
        userId: string;
        token: string;
        ipAddress?: string | null | undefined;
        userAgent?: string | undefined;
    };
    permissionsData?: undefined;
    role?: undefined;
}


// Medicine type for prescriptions
export type Medicine = {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
};

// Lab test type
export type LabTest = {
  name: string;
  description?: string;
};

// Allergy type
export type Allergy = {
  name: string;
  severity: "mild" | "moderate" | "severe";
  notes?: string;
};

// Chronic condition type
export type ChronicCondition = {
  condition: string;
  diagnosedDate?: string;
  notes?: string;
};

// Surgery type
export type Surgery = {
  surgery: string;
  date?: string;
  hospital?: string;
  notes?: string;
};

// Family history type
export type FamilyHistory = {
  relation: string;
  condition: string;
  notes?: string;
};

// Current medication type
export type CurrentMedication = {
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
};
