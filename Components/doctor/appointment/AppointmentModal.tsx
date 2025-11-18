"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import PatientSearchBox from "./searchPatient";
import { toast } from "sonner";
import MaskedInput from "@/components/InputMask";

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  mobile_number: z.string().min(10, "Mobile number is required"),
  doctorUserId: z.string().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  email: z
    .string()
    .email()
    .or(z.literal("").transform(() => undefined))
    .or(z.literal("N/A").transform(() => undefined))
    .optional(),
  patientId: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  services: z.array(z.string()).optional(),

});

type AppointmentFormType = z.infer<typeof formSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AppointmentModal({
  open,
  onOpenChange,
  onSuccess,
}: AppointmentModalProps) {
  const form = useForm<AppointmentFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      mobile_number: "",
      doctorUserId: "",
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
    },
  });

  const [doctors, setDoctors] = useState<any[]>([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/employees");
        const result = await response.json();

        if (result.success) {
          // Filter only doctors (those with doctorData)
          const doctorsList = result.data.filter((emp: any) => emp.doctorData);
          console.log("Doctors:", doctorsList);
          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
      }
    };

    if (open) {
      fetchDoctors();
    }
  }, [open]);

  const handlePatientSelect = (patient: any) => {
    form.setValue("patientName", patient.name || "");
    form.setValue("email", patient.email || "N/A");
    form.setValue("mobile_number", patient.mobileNumber || "");
    form.setValue("patientId", patient.id?.toString() || "");
  };

  const onSubmit = async (values: AppointmentFormType) => {
    try {
      setSubmitting(true);

      // Validate that we have a patient ID
      if (!values.patientId) {
        toast.error("Please select a patient from the search results");
        return;
      }

      const appointmentData = {
        patientId: values.patientId,
        doctorUserId: values.doctorUserId,
        appointmentDate: values.appointmentDate,
        appointmentTime: values.appointmentTime,
        reason: values.reason || "",
        notes: values.notes || "",
        isFollowUp: false,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Appointment booked successfully!");
        form.reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };
  const allServices = [
  "General Checkup",
  "Blood Test",
  "X-Ray",
  "ECG",
  "Ultrasound",
  "Nutrition Consultation",
  "Vaccination",
];
const [showServicesDropdown, setShowServicesDropdown] = useState(false);
const [serviceSearch, setServiceSearch] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Search Box */}
          <PatientSearchBox onSelect={handlePatientSelect} />

          {/* Appointment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input
                        readOnly
                        placeholder="Enter Full Name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Email (optional)"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <MaskedInput
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(-10)
                            )
                          }
                          placeholder="Mobile Number"
                          readOnly
                        />

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="doctorUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between"
                          onClick={() => setShowDoctorDropdown((prev) => !prev)}
                        >
                          {doctors.find((d: any) => d.user.id === field.value)
                            ?.user.name || "Select doctor"}
                        </Button>

                        {showDoctorDropdown && (
                          <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
                            <Command>
                              <CommandInput
                                placeholder="Search doctor..."
                                className="h-9 px-3 text-sm"
                                value={doctorSearch}
                                onValueChange={(val) => setDoctorSearch(val)}
                              />

                              <CommandList className="max-h-60 overflow-auto">
                                <CommandEmpty>No doctors found.</CommandEmpty>
                                <CommandGroup>
                                  {doctors
                                    .filter((doc: any) =>
                                      doctorSearch
                                        ? doc.user.name
                                          .toLowerCase()
                                          .includes(doctorSearch.toLowerCase())
                                        : true
                                    )
                                    .map((doc: any) => (
                                      <CommandItem
                                        key={doc.user.id}
                                        value={doc.user.id}
                                        onSelect={() => {
                                          field.onChange(doc.user.id);
                                          setShowDoctorDropdown(false);
                                          setDoctorSearch("");
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">
                                            {doc.user.name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {doc.doctorData?.specialization?.[0]
                                              ?.name || "General"}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Select the doctor for this appointment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
  control={form.control}
  name="services"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Services</FormLabel>
      <FormControl>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowServicesDropdown(prev => !prev)}
          >
            {field.value?.length
              ? `${field.value.length} selected`
              : "Select services"}
          </Button>

          {showServicesDropdown && (
            <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg z-50">
              <Command>
                <CommandInput
                  placeholder="Search service..."
                  value={serviceSearch}
                  onValueChange={setServiceSearch}
                />

                <CommandList className="max-h-60 overflow-auto">
                  <CommandEmpty>No service found.</CommandEmpty>

                  <CommandGroup>
                    {allServices
                      .filter(s =>
                        s.toLowerCase().includes(serviceSearch.toLowerCase())
                      )
                      .map(service => {
                        const isSelected = field.value?.includes(service);
                        const currentValues = field.value ?? [];
                        return (
                          <CommandItem
                            key={service}
                            onSelect={() => {
                              let updated = [];

                              if (isSelected) {
                                updated = currentValues.filter(
                                  item => item !== service
                                );
                              } else {
                                updated = [...(field.value ?? []), service];
                              }

                              field.onChange(updated);
                            }}
                          >
                            <div className="flex gap-2 items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                              />
                              <span>{service}</span>
                            </div>
                          </CommandItem>
                        );
                      })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </FormControl>

      {/* Selected Services UI */}
      <div className="flex flex-wrap gap-2 mt-2">
        {(field.value ?? []).map(service => (
          <div
            key={service}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {service}
            <button
              type="button"
              onClick={() => {
                const currentValues = field.value ?? [];
                const updated = currentValues.filter(item => item !== service);
                field.onChange(updated);
              }}
              className="text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <FormMessage />
    </FormItem>
  )}
/>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reason for appointment (optional)"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Additional notes (optional)"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
