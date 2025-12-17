

export const ALL_PERMISSIONS: Record<string, string[]> = {
  project: ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  patient: ["create", "read", "update", "delete"],
  prescription: ["create", "read", "update", "delete"],
  reports: ["create", "read", "update", "delete"],
  services: ["create", "read", "update", "delete"],
  members: ["create", "read", "update", "delete"],
  bed: ["create", "read", "update", "delete"],
  hospitalCharger: ["create", "read", "update", "delete"],
  payment: ["create", "read", "update", "delete"],
  shifts: ["create", "read", "update", "delete"],
  vitals: ["create", "read", "update", "delete"],
  medicineRedord: ["create", "read", "update", "delete"],
  stats: ["create", "read", "update", "delete"],
  billing: ["create", "read", "update", "delete"],
  pharmacyMedicine: ["create", "read", "update", "delete"],
  stock: ["create", "read", "update", "delete"],
};


export const OWNER_ALL_PERMISSIONS = ALL_PERMISSIONS;
