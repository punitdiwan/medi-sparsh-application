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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatientSearchBox from "./searchPatient";
import { toast } from "sonner";
import MaskedInput from "@/components/InputMask";
import {
  getDoctorShifts,
  getDoctorSlots,
  getDoctorConsultationFee,
  createAppointment,
  updateAppointment,
  checkSlotAvailability,
  ApiResponse,
} from "@/lib/actions/appointmentActions";


// ============================================
// FACILITY TYPE - HARDCODED FOR NOW
// ============================================
// const FACILITY_TYPE: "hospital" | "clinic" = "hospital"; // TODO: Make configurable

// ============================================
// FORM SCHEMAS
// ============================================

const hospitalFormSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  mobile_number: z.string().min(10, "Mobile number is required"),
  doctorUserId: z.string().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Date is required"),
  shiftId: z.string().min(1, "Shift is required"),
  slotId: z.string().min(1, "Slot is required"),
  email: z
    .string()
    .email()
    .or(z.literal("").transform(() => undefined))
    .or(z.literal("N/A").transform(() => undefined))
    .optional(),
  patientId: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const clinicFormSchema = z.object({
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
  services: z.array(z.string()).min(1, "Please select at least one service"),
});

type HospitalFormType = z.infer<typeof hospitalFormSchema>;
type ClinicFormType = z.infer<typeof clinicFormSchema>;
type AppointmentFormType = HospitalFormType | ClinicFormType;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  appointment?: any;
  orgMode?: string;
}

export default function AppointmentModal({
  open,
  onOpenChange,
  onSuccess,
  orgMode,
  appointment,
}: AppointmentModalProps) {

  let FACILITY_TYPE = orgMode;


  const formSchema = FACILITY_TYPE === "hospital" ? hospitalFormSchema : clinicFormSchema;

  const form = useForm<AppointmentFormType>({
    resolver: zodResolver(formSchema),
    defaultValues:
      FACILITY_TYPE === "hospital"
        ? {
          patientName: "",
          mobile_number: "",
          doctorUserId: "",
          appointmentDate: "",
          shiftId: "",
          slotId: "",
          reason: "",
          notes: "",
        }
        : {
          patientName: "",
          mobile_number: "",
          doctorUserId: "",
          appointmentDate: "",
          appointmentTime: "",
          reason: "",
          notes: "",
          services: [],
        },
  });

  const [doctors, setDoctors] = useState<any[]>([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hospital mode states
  const [shifts, setShifts] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [doctorFee, setDoctorFee] = useState<string>("");
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Clinic mode states
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

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

        // Fetch services only for clinic mode
        if (FACILITY_TYPE === "clinic") {
          const serviceResponse = await fetch("/api/services");
          const services = await serviceResponse.json();
          const activeServices = services.filter((s: any) => s.isDeleted === false);
          setDbServices(activeServices || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    if (open) {
      fetchDoctorsAndServices();
      if (appointment) {
        if (FACILITY_TYPE === "hospital") {
          const services = appointment.services as any;
          form.reset({
            patientName: appointment.patientName || "",
            mobile_number: appointment.contact || "",
            doctorUserId: appointment.doctor_id || "",
            appointmentDate: appointment.date || "",
            shiftId: services?.shiftId || "",
            slotId: services?.slotId || "",
            reason: appointment.purpose || "",
            notes: appointment.notes || "",
            patientId: appointment.patient_id || "",
          });
        } else {
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
    }
  }, [open, appointment]);

  // Fetch doctor shifts when doctor is selected (hospital mode only)
  useEffect(() => {
    const fetchShifts = async () => {
      const doctorId = form.watch("doctorUserId");
      if (FACILITY_TYPE === "hospital" && doctorId) {
        setLoadingShifts(true);
        try {
          // Fetch shifts
          const shiftsResult = await getDoctorShifts(doctorId);
          if (shiftsResult.success) {
            setShifts(shiftsResult.data);
          } else {
            toast.error(shiftsResult.error ?? "Failed to load shifts");
            setShifts([]);
          }

        } catch (error) {
          console.error("Error fetching shifts:", error);
          toast.error("Failed to load doctor shifts");
        } finally {
          setLoadingShifts(false);
        }
      } else {
        setShifts([]);
        setDoctorFee("");
      }
    };

    fetchShifts();
  }, [form.watch("doctorUserId")]);

  // Fetch slots when shift and date are selected (hospital mode only)
  useEffect(() => {
    const fetchSlots = async () => {
      const shiftId = form.watch("shiftId");
      const date = form.watch("appointmentDate");
      const doctorId = form.watch("doctorUserId");

      if (FACILITY_TYPE === "hospital" && shiftId && date && doctorId) {
        setLoadingSlots(true);
        try {
          const slotsResult = await getDoctorSlots(doctorId, date, shiftId);
          if (slotsResult.success) {
            setSlots(slotsResult.data);
          } else {
            toast.error(slotsResult.error ?? "Failed to load slots");
            setSlots([]);
          }

        } catch (error) {
          console.error("Error fetching slots:", error);
          toast.error("Failed to load slots");
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setSlots([]);
        setDoctorFee(""); // Reset fee when slots cleared
      }
    };

    fetchSlots();
  }, [form.watch("shiftId"), form.watch("appointmentDate")]);

  // Update fee when slot is selected
  useEffect(() => {
    const slotId = form.watch("slotId");
    if (FACILITY_TYPE === "hospital" && slotId && slots.length > 0) {
      const selectedSlot = slots.find((slot) => slot.slotId === slotId);
      if (selectedSlot) {
        setDoctorFee(selectedSlot.chargeAmount);
      }
    } else if (FACILITY_TYPE === "hospital") {
      setDoctorFee("");
    }
  }, [form.watch("slotId"), slots]);

  const handlePatientSelect = (patient: any) => {
    form.setValue("patientName", patient.name || "");
    form.setValue("email", patient.email || "N/A");
    form.setValue("mobile_number", patient.mobileNumber || "");
    form.setValue("patientId", patient.id?.toString() || "");
  };

  const onSubmit = async (values: AppointmentFormType) => {
    try {
      setSubmitting(true);

      if (!values.patientId) {
        toast.error("Please select a patient from the search results");
        return;
      }

      let result: ApiResponse<any>;

      // HOSPITAL MODE
      if (FACILITY_TYPE === "hospital") {
        const hospitalValues = values as HospitalFormType;

        const availabilityCheck = await checkSlotAvailability(
          hospitalValues.slotId,
          hospitalValues.appointmentDate
        );

        if (!availabilityCheck.success) {
          toast.error(availabilityCheck.error || "Failed to check slot availability");
          return;
        }

        if (!availabilityCheck.data.isAvailable) {
          toast.error("This slot is no longer available. Please select another slot.");
          return;
        }

        const appointmentData = {
          facilityType: "hospital" as const,
          patientId: hospitalValues.patientId,
          doctorUserId: hospitalValues.doctorUserId,
          appointmentDate: hospitalValues.appointmentDate,
          shiftId: hospitalValues.shiftId,
          slotId: hospitalValues.slotId,
          reason: hospitalValues.reason || "",
          notes: hospitalValues.notes || "",
        };

        result = appointment
          ? await updateAppointment(appointment.id, appointmentData)
          : await createAppointment(appointmentData);
      }

      // CLINIC MODE
      else {
        const clinicValues = values as ClinicFormType;

        const selectedServices = dbServices
          .filter((service) => clinicValues.services.includes(service.id))
          .map((item) => ({
            ...item,
            is_paid: true,
          }));

        const appointmentData = {
          facilityType: "clinic" as const,
          patientId: clinicValues.patientId,
          doctorUserId: clinicValues.doctorUserId,
          appointmentDate: clinicValues.appointmentDate,
          appointmentTime: clinicValues.appointmentTime,
          reason: clinicValues.reason || "",
          notes: clinicValues.notes || "",
          services: selectedServices,
        };

        result = appointment
          ? await updateAppointment(appointment.id, appointmentData)
          : await createAppointment(appointmentData);
      }

      if (result?.success) {
        toast.success(
          appointment
            ? "Appointment updated successfully!"
            : "Appointment booked successfully!"
        );

        // Create transaction only for NEW appointment
        if (!appointment) {
          await createTransactionEntry(result.data);
        }

        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result?.error || "Failed to process appointment");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      toast.error("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };


  const createTransactionEntry = async (appointmentData: any) => {
    try {
      await fetch("/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment: appointmentData,
        }),
      });
    } catch (err) {
      console.error("Transaction create error:", err);
      toast.error("Transaction create failed!");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          form.reset();
          setDoctorSearch("");
          setShowDoctorDropdown(false);
          setServiceSearch("");
          setShowServicesDropdown(false);
          setShifts([]);
          setSlots([]);
          setDoctorFee("");
        }
        onOpenChange(val);
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto p-0 border border-dialog bg-dialog-surface"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog">
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Book Appointment"}
            {/* <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({FACILITY_TYPE === "hospital" ? "Hospital Mode" : "Clinic Mode"})
            </span>      */}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6">
          {/* Patient Search Box */}
          <PatientSearchBox is_IPD_Patient={true} onSelect={handlePatientSelect} />

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
                            field.onChange(e.target.value.replace(/\D/g, "").slice(-10))
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
                          {doctors.find((d: any) => d.user.id === field.value)?.user.name ||
                            "Select doctor"}
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
                                          // Reset shift and slot when doctor changes
                                          if (FACILITY_TYPE === "hospital") {
                                            form.setValue("shiftId", "");
                                            form.setValue("slotId", "");
                                          }
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{doc.user.name}</span>
                                          <span className="text-xs text-gray-500">
                                            {doc.doctorData?.specialization?.[0]?.name || "General"}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* HOSPITAL MODE FIELDS */}
              {FACILITY_TYPE === "hospital" && (
                <>
                  {/* Shift Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="shiftId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset slot when shift changes
                              form.setValue("slotId", "");
                            }}
                            value={field.value}
                            disabled={!form.watch("doctorUserId") || loadingShifts}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select shift" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shifts.length === 0 ? (
                                <SelectItem value="no-shifts" disabled>
                                  {loadingShifts ? "Loading shifts..." : "No shifts available"}
                                </SelectItem>
                              ) : (
                                shifts.map((shift) => (
                                  <SelectItem key={shift.shiftId} value={shift.shiftId}>
                                    {shift.shiftName} ({shift.startTime} - {shift.endTime})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date Picker */}
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ?? ""}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => {
                                field.onChange(e);
                                // Reset slot when date changes
                                form.setValue("slotId", "");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Slot Selector */}
                    <FormField
                      control={form.control}
                      name="slotId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Slot</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              !form.watch("shiftId") ||
                              !form.watch("appointmentDate") ||
                              loadingSlots
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {slots.length === 0 ? (
                                <SelectItem value="no-slots" disabled>
                                  {loadingSlots
                                    ? "Loading slots..."
                                    : "No slots available for this shift and date"}
                                </SelectItem>
                              ) : (
                                slots.map((slot) => (
                                  <SelectItem
                                    key={slot.slotId}
                                    value={slot.slotId}
                                    disabled={!slot.isAvailable}
                                  >
                                    {slot.timeFrom} - {slot.timeTo} (₹{slot.chargeAmount})
                                    {!slot.isAvailable && " - Booked"}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-2">
                      <FormLabel>Doctor Fees</FormLabel>
                      <Input
                        value={`₹ ${doctorFee}`}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CLINIC MODE FIELDS */}
              {FACILITY_TYPE === "clinic" && (
                <>
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
                              onClick={() => setShowServicesDropdown((prev) => !prev)}
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
                                          service.name
                                            .toLowerCase()
                                            .includes(serviceSearch.toLowerCase())
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
                                                    (item) => item !== service.id
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
                            const serviceName =
                              dbServices.find((s: any) => s.id === serviceId)?.name || serviceId;
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
                                    const updated = currentValues.filter(
                                      (item) => item !== serviceId
                                    );
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
                </>
              )}

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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2"
                >
                  {submitting
                    ? appointment
                      ? "Updating..."
                      : "Booking..."
                    : appointment
                      ? "Update Appointment"
                      : "Book Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
