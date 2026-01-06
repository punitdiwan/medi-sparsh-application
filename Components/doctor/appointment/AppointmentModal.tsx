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
  services: z.array(z.string())
    .min(1, "Please select at least one service"),

});

type AppointmentFormType = z.infer<typeof formSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  appointment?: any;
}

export default function AppointmentModal({
  open,
  onOpenChange,
  onSuccess,
  appointment,
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
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Fetch doctors and services
  useEffect(() => {
    const fetchDoctorsAndServices = async () => {
      try {
        // Fetch doctors
        const doctorResponse = await fetch("/api/employees");
        const doctorResult = await doctorResponse.json();

        if (doctorResult.success) {
          const doctorsList = doctorResult.data.filter((emp: any) => emp.doctorData);
          setDoctors(doctorsList);
        }

        // Fetch services from database
        const serviceResponse = await fetch("/api/services");
        const services = await serviceResponse.json();
        const activeServices = services.filter((s: any) => s.isDeleted === false);
        setDbServices(activeServices || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    if (open) {
      fetchDoctorsAndServices();
      if (appointment) {
        form.reset({
          patientName: appointment.patientName || "",
          mobile_number: appointment.contact || "",
          doctorUserId: appointment.doctor_id || "",
          appointmentDate: appointment.date || "",
          appointmentTime: appointment.time || "",
          reason: appointment.purpose || "",
          notes: appointment.notes || "",
          patientId: appointment.patient_id || "",
          services: appointment.services?.map((s: any) => s.id) || [],
        });
      }
    }
  }, [open, appointment]);

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

      const selectedServices = dbServices.filter((service) =>
        values.services.includes(service.id)
      ).map((item) => {
        return {
          ...item,
          is_paid: true,
        }
      });
      const appointmentData = {
        patientId: values.patientId,
        doctorUserId: values.doctorUserId,
        appointmentDate: values.appointmentDate,
        appointmentTime: values.appointmentTime,
        reason: values.reason || "",
        notes: values.notes || "",
        isFollowUp: false,
        services: selectedServices || [],
      };
      const response = await fetch("/api/appointments", {
        method: appointment ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointment ? { ...appointmentData, id: appointment.id } : appointmentData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(appointment ? "Appointment updated successfully!" : "Appointment booked successfully!");
        if (!appointment) {
          try {
            console.log("appointment success data", result);
            await fetch("/api/transaction", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointment: result.data,
              }),
            });
          } catch (err) {
            console.error("Transaction create error:", err);
            toast.error("Transaction create failed!");
          }
        }

        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
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
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        form.reset();
        setDoctorSearch("");
        setShowDoctorDropdown(false);
        setServiceSearch("");
        setShowServicesDropdown(false);
      }
      onOpenChange(val);
    }}

    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto p-0 border border-dialog bg-dialog-surface"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog">
          <DialogTitle>{appointment ? "Edit Appointment" : "Book Appointment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6">
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
                                  {dbServices
                                    .filter((service: any) =>
                                      service.name.toLowerCase().includes(serviceSearch.toLowerCase())
                                    )
                                    .map((service: any) => {
                                      const isSelected = field.value?.includes(service.id);
                                      const currentValues = field.value ?? [];
                                      return (
                                        <CommandItem
                                          key={service.id}
                                          onSelect={() => {
                                            let updated = [];

                                            if (isSelected) {
                                              updated = currentValues.filter(
                                                item => item !== service.id
                                              );
                                            } else {
                                              updated = [...(field.value ?? []), service.id];
                                            }

                                            field.onChange(updated);
                                          }}
                                        >
                                          <div className="flex gap-2 items-center">
                                            <input
                                              type="checkbox"
                                              checked={isSelected || false}
                                              onChange={() => { }}
                                            />
                                            <span>{service.name}</span>
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
                      {(field.value ?? []).map((serviceId: string) => {
                        const serviceName = dbServices.find((s: any) => s.id === serviceId)?.name || serviceId;
                        return (
                          <div
                            key={serviceId}
                            className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {serviceName}
                            <button
                              type="button"
                              onClick={() => {
                                const currentValues = field.value ?? [];
                                const updated = currentValues.filter(item => item !== serviceId);
                                field.onChange(updated);
                              }}
                              className="text-red-500"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
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

              <div className="flex justify-end gap-2  py-3 border-t border-dialog text-dialog-muted ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}
                  className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2">
                  {submitting ? (appointment ? "Updating..." : "Booking...") : (appointment ? "Update Appointment" : "Book Appointment")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
