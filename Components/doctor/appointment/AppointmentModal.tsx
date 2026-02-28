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
import {
  getDoctorShifts,
  getDoctorSlots,
  createAppointment,
  updateAppointment,
  ApiResponse,
} from "@/lib/actions/appointmentActions";

import { CheckCircle2, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import SlotPickerPanel from "./Slotpickerpanel";

// ============================================
// FORM SCHEMAS
// ============================================

const hospitalFormSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  mobile_number: z.string().min(10, "Mobile number is required"),
  doctorUserId: z.string().min(1, "Doctor is required"),
  appointmentDate: z.string().min(1, "Please select a slot"),
  shiftId: z.string().min(1, "Please select a slot"),
  slotId: z.string().min(1, "Please select a slot"),
  bookedTimeFrom: z.string().min(1, "Please select a slot"),
  bookedTimeTo: z.string().min(1, "Please select a slot"),
  email: z.string().email().or(z.literal("").transform(() => undefined)).or(z.literal("N/A").transform(() => undefined)).optional(),
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
  email: z.string().email().or(z.literal("").transform(() => undefined)).or(z.literal("N/A").transform(() => undefined)).optional(),
  patientId: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
});

type HospitalFormType = z.infer<typeof hospitalFormSchema>;
type ClinicFormType = z.infer<typeof clinicFormSchema>;
type AppointmentFormType = HospitalFormType | ClinicFormType;

// ── Defaults ──────────────────────────────────────────────────────
const hospitalDefaults: HospitalFormType = {
  patientName: "", mobile_number: "", doctorUserId: "",
  appointmentDate: "", shiftId: "", slotId: "",
  bookedTimeFrom: "", bookedTimeTo: "",
  reason: "", notes: "", patientId: "", email: "",
};

const clinicDefaults: ClinicFormType = {
  patientName: "", mobile_number: "", doctorUserId: "",
  appointmentDate: "", appointmentTime: "",
  reason: "", notes: "", patientId: "", email: "", services: [],
};

// ── Props ─────────────────────────────────────────────────────────
interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  appointment?: any;
  orgMode?: string;
}

// ============================================
// COMPONENT
// ============================================
export default function AppointmentModal({
  open, onOpenChange, onSuccess, orgMode, appointment,
}: AppointmentModalProps) {

  const FACILITY_TYPE = orgMode;
  const isHospital = FACILITY_TYPE === "hospital";
  const formSchema = isHospital ? hospitalFormSchema : clinicFormSchema;

  const form = useForm<AppointmentFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: isHospital ? hospitalDefaults : clinicDefaults,
  });

  // ── State ─────────────────────────────────────────────
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Hospital
  const [shifts, setShifts] = useState<any[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    slotId: string; shiftId: string;
    bookedTimeFrom: string; bookedTimeTo: string;
    chargeAmount: string; date: string; dayName: string;
  } | null>(null);

  // Clinic
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");

  // ── Open: fetch data + populate form ──────────────────
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/employees");
        const result = await res.json();
        if (result.success) {
          setDoctors(result.data.filter((emp: any) => emp.doctorData));
        }
        if (!isHospital) {
          const sRes = await fetch("/api/services");
          const svcs = await sRes.json();
          setDbServices(svcs.filter((s: any) => !s.isDeleted));
        }
      } catch { toast.error("Failed to load data"); }
    };

    fetchData();

    if (appointment) {
      if (isHospital) {
        const svc = appointment.services as any;
        form.reset({
          patientName: appointment.patientName || "",
          mobile_number: appointment.contact || "",
          doctorUserId: appointment.doctor_id || "",
          appointmentDate: appointment.date || "",
          shiftId: svc?.shiftId || "",
          slotId: svc?.slotId || "",
          bookedTimeFrom: appointment.appointmentTime || "",
          bookedTimeTo: svc?.bookedTimeTo || "",
          reason: appointment.purpose || "",
          notes: appointment.notes || "",
          patientId: appointment.patient_id || "",
        });
        // Restore selected slot display
        if (appointment.appointmentTime) {
          setSelectedSlot({
            slotId: svc?.slotId || "",
            shiftId: svc?.shiftId || "",
            bookedTimeFrom: appointment.appointmentTime || "",
            bookedTimeTo: svc?.bookedTimeTo || "",
            chargeAmount: "",
            date: appointment.date || "",
            dayName: "",
          });
        }
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
    } else {
      form.reset(isHospital ? hospitalDefaults : clinicDefaults);
      setSelectedSlot(null);
    }
  }, [open, appointment]);

  // ── Fetch shifts when doctor changes ──────────────────
  useEffect(() => {
    const doctorId = form.watch("doctorUserId");
    if (!isHospital || !doctorId) { setShifts([]); return; }

    const fetch_ = async () => {
      setLoadingShifts(true);
      try {
        const r = await getDoctorShifts(doctorId);
        if (r.success) setShifts(r.data);
        else { toast.error(r.error ?? "Failed to load shifts"); setShifts([]); }
      } catch { toast.error("Failed to load shifts"); }
      finally { setLoadingShifts(false); }
    };
    fetch_();
    // Reset slot when doctor changes
    setSelectedSlot(null);
    form.setValue("slotId", "");
    form.setValue("shiftId", "");
    form.setValue("appointmentDate", "");
    form.setValue("bookedTimeFrom", "");
    form.setValue("bookedTimeTo", "");
  }, [form.watch("doctorUserId")]);

  // ── Slot selected from picker ──────────────────────────
  const handleSlotSelect = (slot: typeof selectedSlot) => {
    if (!slot) return;
    setSelectedSlot(slot);
    form.setValue("slotId", slot.slotId, { shouldValidate: true });
    form.setValue("shiftId", slot.shiftId, { shouldValidate: true });
    form.setValue("appointmentDate", slot.date, { shouldValidate: true });
    form.setValue("bookedTimeFrom", slot.bookedTimeFrom, { shouldValidate: true });
    form.setValue("bookedTimeTo", slot.bookedTimeTo, { shouldValidate: true });
  };

  // ── Patient select ─────────────────────────────────────
  const handlePatientSelect = (patient: any) => {
    form.setValue("patientName", patient.name || "");
    form.setValue("email", patient.email || "N/A");
    form.setValue("mobile_number", patient.mobileNumber || "");
    form.setValue("patientId", patient.id?.toString() || "");
  };

  // ── Submit ─────────────────────────────────────────────
  const onSubmit = async (values: AppointmentFormType) => {
    try {
      setSubmitting(true);
      if (!values.patientId) {
        toast.error("Please select a patient from the search results");
        return;
      }

      let result: ApiResponse<any>;

      if (isHospital) {
        const hv = values as HospitalFormType;
        const payload = {
          facilityType: "hospital" as const,
          patientId: hv.patientId,
          doctorUserId: hv.doctorUserId,
          appointmentDate: hv.appointmentDate,
          shiftId: hv.shiftId,
          slotId: hv.slotId,
          bookedTimeFrom: hv.bookedTimeFrom,
          bookedTimeTo: hv.bookedTimeTo,
          reason: hv.reason || "",
          notes: hv.notes || "",
        };
        result = appointment
          ? await updateAppointment(appointment.id, payload)
          : await createAppointment(payload);
      } else {
        const cv = values as ClinicFormType;
        const selectedServices = dbServices
          .filter((s) => cv.services.includes(s.id))
          .map((s) => ({ ...s, is_paid: true }));
        const payload = {
          facilityType: "clinic" as const,
          patientId: cv.patientId,
          doctorUserId: cv.doctorUserId,
          appointmentDate: cv.appointmentDate,
          appointmentTime: cv.appointmentTime,
          reason: cv.reason || "",
          notes: cv.notes || "",
          services: selectedServices,
        };
        result = appointment
          ? await updateAppointment(appointment.id, payload)
          : await createAppointment(payload);
      }

      if (result?.success) {
        toast.success(appointment ? "Appointment updated!" : "Appointment booked!");
        if (!appointment) await createTransactionEntry(result.data);
        resetModal();
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result?.error || "Failed to process appointment");
      }
    } catch { toast.error("Something went wrong!"); }
    finally { setSubmitting(false); }
  };

  const createTransactionEntry = async (data: any) => {
    try {
      await fetch("/api/transaction", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointment: data }),
      });
    } catch { toast.error("Transaction create failed!"); }
  };

  const resetModal = () => {
    form.reset(isHospital ? hospitalDefaults : clinicDefaults);
    setDoctorSearch(""); setShowDoctorDropdown(false);
    setServiceSearch(""); setShowServicesDropdown(false);
    setShifts([]); setSelectedSlot(null);
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => { if (!val) resetModal(); onOpenChange(val); }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border border-dialog bg-dialog-surface"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog sticky top-0 z-10">
          <DialogTitle>
            {appointment ? "Edit Appointment" : "Book Appointment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-4">
          <PatientSearchBox is_IPD_Patient={true} onSelect={handlePatientSelect} />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Patient Name */}
              <FormField control={form.control} name="patientName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input readOnly placeholder="Select patient above" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Email + Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input readOnly placeholder="Email" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mobile_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <MaskedInput
                        {...field} value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(-10))}
                        placeholder="Mobile Number" readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Doctor */}
              <FormField control={form.control} name="doctorUserId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Button
                        type="button" variant="outline" className="w-full justify-between"
                        onClick={() => setShowDoctorDropdown((p) => !p)}
                      >
                        {doctors.find((d: any) => d.user.id === field.value)?.user.name || "Select doctor"}
                      </Button>
                      {showDoctorDropdown && (
                        <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg">
                          <Command>
                            <CommandInput placeholder="Search doctor..." value={doctorSearch} onValueChange={setDoctorSearch} />
                            <CommandList className="max-h-60 overflow-auto">
                              <CommandEmpty>No doctors found.</CommandEmpty>
                              <CommandGroup>
                                {doctors
                                  .filter((doc: any) => doctorSearch
                                    ? doc.user.name.toLowerCase().includes(doctorSearch.toLowerCase())
                                    : true)
                                  .map((doc: any) => (
                                    <CommandItem
                                      key={doc.user.id} value={doc.user.id}
                                      onSelect={() => {
                                        field.onChange(doc.user.id);
                                        setShowDoctorDropdown(false);
                                        setDoctorSearch("");
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
              )} />

              {/* ── HOSPITAL: Slot Picker ── */}
              {isHospital && (
                <>
                  {loadingShifts ? (
                    <div className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-xl">
                      Loading doctor schedule...
                    </div>
                  ) : form.watch("doctorUserId") ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Select Appointment Slot
                        </p>
                        <SlotPickerPanel
                          doctorId={form.watch("doctorUserId")}
                          shifts={shifts}
                          onSlotSelect={handleSlotSelect}
                          selectedSlot={selectedSlot}
                          fetchSlots={async (doctorId, date, shiftId) => {
                            const result = await getDoctorSlots(doctorId, date, shiftId);
                            return result as any;
                          }}
                        />
                        {/* Validation error for slot */}
                        {(form.formState.errors as any).bookedTimeFrom && !selectedSlot && (
                          <p className="text-xs text-red-500 mt-1">
                            Please select a time slot
                          </p>
                        )}
                      </div>

                      {/* Selected slot summary */}
                      {selectedSlot && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-800">
                                {selectedSlot.dayName} · {selectedSlot.date}
                              </p>
                              <p className="text-xs text-blue-600">
                                {selectedSlot.bookedTimeFrom} – {selectedSlot.bookedTimeTo}
                              </p>
                            </div>
                          </div>
                          {selectedSlot.chargeAmount && (
                            <div className="flex items-center gap-1 bg-blue-100 rounded-lg px-3 py-1.5">
                              <IndianRupee className="w-3.5 h-3.5 text-blue-700" />
                              <span className="text-sm font-bold text-blue-700">
                                {selectedSlot.chargeAmount}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-xl">
                      Select a doctor to see available slots
                    </div>
                  )}
                </>
              )}

              {/* ── CLINIC MODE ── */}
              {!isHospital && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="appointmentTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl><Input type="time" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="services" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Button type="button" variant="outline" className="w-full justify-between"
                            onClick={() => setShowServicesDropdown((p) => !p)}>
                            {field.value?.length ? `${field.value.length} selected` : "Select services"}
                          </Button>
                          {showServicesDropdown && (
                            <div className="absolute mt-2 w-full rounded-md border bg-white shadow-lg z-50">
                              <Command>
                                <CommandInput placeholder="Search service..." value={serviceSearch} onValueChange={setServiceSearch} />
                                <CommandList className="max-h-60 overflow-auto">
                                  <CommandEmpty>No service found.</CommandEmpty>
                                  <CommandGroup>
                                    {dbServices
                                      .filter((s: any) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                                      .map((service: any) => {
                                        const isSelected = field.value?.includes(service.id);
                                        return (
                                          <CommandItem key={service.id} onSelect={() => {
                                            const updated = isSelected
                                              ? (field.value ?? []).filter((i) => i !== service.id)
                                              : [...(field.value ?? []), service.id];
                                            field.onChange(updated);
                                          }}>
                                            <div className="flex gap-2 items-center">
                                              <input type="checkbox" checked={isSelected || false} onChange={() => { }} />
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(field.value ?? []).map((serviceId: string) => {
                          const name = dbServices.find((s: any) => s.id === serviceId)?.name || serviceId;
                          return (
                            <div key={serviceId} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                              {name}
                              <button type="button" className="text-red-500"
                                onClick={() => field.onChange((field.value ?? []).filter((i) => i !== serviceId))}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              {/* Reason + Notes */}
              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Reason for appointment (optional)" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes (optional)" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Actions */}
              <div className="flex justify-end gap-2 py-3 border-t border-dialog">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover">
                  {submitting
                    ? appointment ? "Updating..." : "Booking..."
                    : appointment ? "Update Appointment" : "Book Appointment"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}