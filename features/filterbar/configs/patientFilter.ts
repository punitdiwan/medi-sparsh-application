import { type FilterField } from "@/features/filterbar/FilterBar";

export const patientFilters: FilterField[] = [
  {
    key: "search",
    label: "Search Patient",
    type: "text",
    placeholder: "Search by name or ID...",
  },
  {
    key: "dateCheckIn",
    label: "Date Check-In",
    type: "date",
  },
  
  // {
  //   key: "visitPurpose",
  //   label: "Visit Purpose",
  //   type: "select",
  //   options: [
  //     { label: "Consultation", value: "Consultation" },
  //     { label: "Follow-up", value: "Follow-up" },
  //     { label: "Emergency", value: "Emergency" },
  //   ],
  // },
  // {
  //   key: "disease",
  //   label: "Disease",
  //   type: "select",
  //   options: [
  //     { label: "Allergies & Asthma", value: "Allergies & Asthma" },
  //     { label: "Cold & Flu", value: "Cold & Flu" },
  //     { label: "Sleep Problem", value: "Sleep Problem" },
  //   ],
  // },
  // {
  //   key: "status",
  //   label: "Patient Status",
  //   type: "select",
  //   options: [
  //     { label: "New patient", value: "New patient" },
  //     { label: "Recovered", value: "Recovered" },
  //     { label: "In Treatment", value: "In Treatment" },
  //   ],
  // },
];
