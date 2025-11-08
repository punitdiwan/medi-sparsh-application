import { type FilterField } from "@/features/filterbar/FilterBar";

export const appointmentFilters: FilterField[] = [
  {
    key: "search",
    label: "Search Patient",
    type: "text",
    placeholder: "Search by name or ID...",
  },
  {
    key: "date",
    label: "Date",
    type: "date",
  },
  {
    key: "appointmentType",
    label: "Appointment Type",
    type: "select",
    options: [
      { label: "Consultation", value: "consultation" },
      { label: "Follow-up", value: "follow-up" },
      { label: "Check-up", value: "checkup" },
      { label: "Emergency", value: "emergency" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Scheduled", value: "scheduled" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
];

