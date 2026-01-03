export type BedStatus = "EMPTY" | "OCCUPIED" | "CLEANING";

export type PatientInfo = {
  patientId: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  phone: string;
  guardianName: string;
  admissionDate: string;
  consultant: string;
};

export type Bed = {
  id: string;
  bedNo: string;
  status: BedStatus;
  patient?: PatientInfo;
};

export type Ward = {
  id: string;
  name: "ICU" | "NCU" | "VIP" | "GENERAL";
  beds: Bed[];
};

export type Floor = {
  id: string;
  floorName: string;
  wards: Ward[];
};
