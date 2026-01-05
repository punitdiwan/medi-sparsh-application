"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MaskedInput from "@/components/InputMask";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().refine((val) => {
    const cleaned = val.replace(/^\+91/, "").replace(/[\s-]/g, "");
    return /^[6-9]\d{9}$/.test(cleaned);
  }, "Enter a valid 10-digit mobile number starting with 6-9"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City name too short").optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  areaOrPin: z
    .string()
    .min(3, "Area or PIN is required")
    .optional()
    .or(z.literal("")),
  bloodGroup: z
    .enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])
    .optional()
    .or(z.literal("")),
  referredByDr: z.string().optional().or(z.literal("")),
  preferredLanguage: z.string().optional().or(z.literal("")),
});

type PatientFormData = z.infer<typeof patientSchema>;

type PatientEditFormProps = {
  patientId: string;
  initialData?: Partial<PatientFormData>;
};

export default function PatientEditForm({ patientId, initialData }: PatientEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      gender: initialData?.gender || undefined,
      address: initialData?.address || "",
      dob: initialData?.dob || "",
      mobileNumber: initialData?.mobileNumber || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      areaOrPin: initialData?.areaOrPin || "",
      bloodGroup: initialData?.bloodGroup || undefined,
      referredByDr: initialData?.referredByDr || "",
      preferredLanguage: initialData?.preferredLanguage || "",
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {

      // const response = await fetch(`/api/patients/${patientId}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     name: data.name,
      //     email: data.email || null,
      //     gender: data.gender || null,
      //     dob: data.dob || null,
      //     mobileNumber: data.mobileNumber,
      //     address: data.address || null,
      //     city: data.city || null,
      //     state: data.state || null,
      //     areaOrPin: data.areaOrPin || null,
      //     bloodGroup: data.bloodGroup || null,
      //     referredByDr: data.referredByDr || null,
      //     preferredLanguage: data.preferredLanguage || null,
      //   }),
      // });

      // const result = await response.json();

      // if (!response.ok || !result.success) {
      //   throw new Error(result.error || "Failed to update patient");
      // }

      // toast.success("Patient updated successfully!");
      // router.push("/doctor/patient");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update patient. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black/80 dark:text-gray-300 rounded-2xl shadow hover:shadow-xl transition-shadow duration-300 w-full max-w-4xl">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-center flex-1 text-white">Edit Patient</h2>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-5 p-10"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Patient Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Patient Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-white/20 px-2 py-1 text
                      dark:bg-black/80 dark:text-white/50 
                        focus:outline-none focus:border-white/40 focus:ring-3 focus:ring-white/20 focus:dark:text-gray-300
                        transition-all duration-200"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <MaskedInput
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(-10);
                        field.onChange(cleaned.trim());
                      }}
                      placeholder="Enter mobile number"
                    />

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* City */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* State */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Area or Pin */}
            <FormField
              control={form.control}
              name="areaOrPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area / PIN Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Area or PIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Blood Group */}
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blood Group</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-md border border-white/20 px-2 py-1 text
          dark:bg-black/80 dark:text-white/50 
          focus:outline-none focus:border-white/40 focus:ring-3 focus:ring-white/20 focus:dark:text-gray-300
          transition-all duration-200"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Referred By Doctor */}
            <FormField
              control={form.control}
              name="referredByDr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referred By Doctor</FormLabel>
                  <FormControl>
                    <Input placeholder="Doctor's Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Preferred Language */}
            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <FormControl>
                    <Input placeholder="Preferred Language" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Address (Full Width) */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                        placeholder="Full Address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Buttons */}
            <div className="col-span-2 flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button variant="outline" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Patient"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
