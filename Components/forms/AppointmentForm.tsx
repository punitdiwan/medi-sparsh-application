"use client";

import  {  useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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

import { Card, CardContent } from "@/components/ui/card";
import PatientSearchBox from "../doctor/appointment/searchPatient";
import BackButton from "../BackButton";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  patientName: z.string().min(1, "Patient name is required"),
  mobile_number: z.string().min(10, "Mobile number is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  email: z
    .string()
    .email()
    .or(z.literal("").transform(() => undefined))
    .or(z.literal("N/A").transform(() => undefined))
    .optional(),
  patientId: z.string().optional(),
  reason: z.string().optional(),
  appointmentType: z.enum([
    "consultation",
    "follow-up",
    "check-up",
    "emergency",
  ]),
  status: z.enum(["Scheduled"]),
});

type AppointmentFormType = z.infer<typeof formSchema>;

export default function AppointmentForm() {

  const route= useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      mobile_number: "",
      doctorId: "",
      date: "",
      appointmentType: "consultation",
      status: "Scheduled",
    },
  });

  const [doctors, setDoctors] = useState<any>([]);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [patientResults, setPatientResults] = useState<any[]>([]);
  // const [loading, setLoading] = useState(false);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const { data } = useSession();
  const AuserId = data?.user?.id;
  useEffect(() => {
    // Fetch doctors from API
    const fetchInitialDoctors = async () => {
      try {
        const response = await fetch("/api/employees");
        const result = await response.json();
        console.log("Lost of doctors:", result);

        if (result.success) {
          // Filter only doctors (those with doctorData)
          const doctorsList = result.data
            .filter((emp: any) => emp.doctorData)
            .map((emp: any) => ({
              user_id: emp.user.id,
              name: emp.user.name,
              specialization: emp.doctorData?.specialization?.[0]?.name || "General",
            }));
          setDoctors(doctorsList);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchInitialDoctors();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!doctorSearch.trim()) {
        
        return;
      }

      
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [doctorSearch]);

  // const handlePatientSelect = (patient: any) => {
  //   console.log("Selected patient:", patient);
  //   // You can auto-fill form fields here using patient data
  // };

  const handlePatientSelect = (patient: any) => {
    console.log("Selected patient:", patient);
    form.setValue("patientName", patient.name || "");
    form.setValue("email", patient.email || "N/A");
    form.setValue("mobile_number", patient.mobile_number || "");
    form.setValue("patientId", patient.id?.toString() || "");
  };

  const onSubmit = async (values: AppointmentFormType) => {
    try {
      
    } catch (err) {
      console.log("❌ Error creating appointment:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg mt-10">
      <CardContent className="p-6">
        <BackButton />
        <h2 className="text-xl font-semibold mb-4 text-center">
          Booker Appointment
        </h2>

        {/*Patient Search Box */}
        <PatientSearchBox onSelect={handlePatientSelect} />

        {/*Appointment Form */}
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
                      placeholder="Enter Full Name"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
                      <Input
                        placeholder="Mobile Number"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <FormControl>
                    <div className="relative">
                      {/* 🧭 Trigger Button */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowDoctorDropdown((prev) => !prev)}
                      >
                        {doctors.find((d: any) => d.user_id === field.value)
                          ?.name || "Select doctor"}
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
                                {doctors.map((doc: any) => (
                                  <CommandItem
                                    key={doc.user_id}
                                    value={doc.user_id}
                                    onSelect={() => {
                                      field.onChange(doc.user_id);
                                      setShowDoctorDropdown(false);
                                      setDoctorSearch("");
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {doc.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {doc.specialization || "General"}
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
                name="date"
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reason (optional)"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Appointment Type */}
              <FormField
                control={form.control}
                name="appointmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full border rounded-md p-2 "
                      >
                        <option value="consultation">Consultation</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="check-up">Check-up</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (read-only) */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        value={field.value ?? ""}
                        className="w-full border rounded-md p-2"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="reset"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
              <Button type="submit">Book Appointment</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
