

export const ALL_PERMISSIONS: Record<string, string[]> = {
  project: ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  role: ["create", "read", "update", "delete"],
  patient: ["create", "read", "update", "delete"],
  prescription: ["create", "read", "update", "delete"],
  reports: ["read"],
  services: ["create", "read", "update", "delete"],
  members: ["create", "read", "update", "delete"],
  bed: ["create", "read", "update", "delete"],
  bedStatus:["update","read"],
  bedGroups:["create","update","delete","read"],
  bedType:["create","update","delete","read"],
  floor:["create","update","delete","read"],
  hospitalCharger: ["create", "read", "update", "delete"],
  ChargesCategory:["create", "read", "update", "delete"],
  ChargesType:["create", "read", "update", "delete"],
  TaxCategory:["create", "read", "update", "delete"],
  ChargesUnit:["create", "read", "update", "delete"],
  payment: [ "read", "update", "delete"],
  shifts: ["create", "read", "update", "delete"],
  vitals: ["create", "read", "update", "delete"],
  medicineRedord: ["create", "read", "update", "delete"],
  medicineCategory:["create", "read", "update", "delete"],
  medicineSupplier:["create", "read", "update", "delete"],
  medicineCompany:["create", "read", "update", "delete"],
  medicineUnit:["create", "read", "update", "delete"],
  medicineGroup:["create", "read", "update", "delete"],
  stats: [],
  billing: ["create", "read", "update", "delete"],
  pharmacyMedicine: ["create", "read", "update", "delete"],
  stock: ["create", "read", "update", "delete"],
};


export const OWNER_ALL_PERMISSIONS = ALL_PERMISSIONS;
