"use client";
import * as React from "react";
import Link from "next/link";
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
import { InputOTPForm } from "@/components/model/Otpmodel";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MaskedInput from "@/components/InputMask";

import { useSession } from "@/lib/auth-client";
import { useAuth } from "@/context/AuthContext";
import Combobox from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onOtpRequired?: (data: FormData, handleVerify: (otp: string) => Promise<void>) => void;
}

type FormData = {
  name: string;
  email?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  dob?: string;
  mobileNumber: string;
  city?: string;
  state?: string;
  areaOrPin?: string;
  bloodGroup?: string;
  referredByDr?: string;
};

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
  state: z.string().min(2, "State name too short").optional().or(z.literal("")),
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
});

export default function PatientRegistrationForm({ onSuccess, onCancel, onOtpRequired }: PatientRegistrationFormProps = {}) {
  const router = useRouter();
  const [isOtpModalOpen, setIsOtpModalOpen] = React.useState(false);
  const [phoneValidationEnabled, setPhoneValidationEnabled] = React.useState(false);
  const [loadingValidationSetting, setLoadingValidationSetting] = React.useState(true);

  const { user } = useAuth();
  console.log("user", user);
  const [formDataToSubmit, setFormDataToSubmit] =
    React.useState<FormData | null>(null);

  // Fetch phone validation setting on component mount
  React.useEffect(() => {
    const fetchSetting = async () => {
      try {
        const response = await fetch("/api/settings/phone-validation");
        const data = await response.json();
        if (data.success) {
          console.log("Validation data",data);
          const isEnabled = data.data.value === "true";
          setPhoneValidationEnabled(isEnabled);
        }
      } catch (error) {
        console.error("Error fetching phone validation setting:", error);
        // Default to false if error
        setPhoneValidationEnabled(false);
      } finally {
        setLoadingValidationSetting(false);
      }
    };

    fetchSetting();
  }, []);
  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: undefined,
      address: "",
      dob: "",
      mobileNumber: "",
      city: "",
      state: "",
      areaOrPin: "",
      bloodGroup: undefined,
      referredByDr: "",
    },
  });

  const handleVerifyOtp = async (otp: string) => {
    const cleanedNumber = formDataToSubmit?.mobileNumber
      .replace(/^\+91/, "")
      .replace(/[\s-]/g, "")
      .trim();
    const DEMO_OTP = "123456"; // demo OTP
    if (otp !== DEMO_OTP) {
      toast.error("Invalid OTP, please try again.");
      return;
    }

    toast.success("Mobile number verified!");

    if (!formDataToSubmit) return;

    // OTP correct → insert into DB
    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formDataToSubmit.name,
          email: formDataToSubmit.email || null,
          gender: formDataToSubmit.gender || null,
          dob: formDataToSubmit.dob || null,
          mobileNumber: cleanedNumber,
          address: formDataToSubmit.address || null,
          city: formDataToSubmit.city || null,
          state: formDataToSubmit.state || null,
          areaOrPin: formDataToSubmit.areaOrPin || null,
          bloodGroup: formDataToSubmit.bloodGroup || null,
          referredByDr: formDataToSubmit.referredByDr || null,
          userId: user?.userData?.id || null,
          hospitalId: user?.hospital?.hospitalId
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save patient");
      }

      toast.success("Patient registered successfully!");
      setIsOtpModalOpen(false);

      // Reset form
      form.reset();

      // Call onSuccess callback or redirect
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/doctor/patient");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to save patient. Please try again.");
    }
  };

  const onSubmit = async (data: FormData) => {
    setFormDataToSubmit(data);

    // Check if phone validation is enabled
    if (phoneValidationEnabled) {
      // Phone validation is enabled, show OTP modal
      if (onOtpRequired) {
        // Create a wrapper that ensures formData is available
        const verifyWithData = async (otp: string) => {
          // Use the data parameter directly instead of relying on state
          const cleanedNumber = data.mobileNumber
            .replace(/^\+91/, "")
            .replace(/[\s-]/g, "")
            .trim();
          const DEMO_OTP = "123456";
          if (otp !== DEMO_OTP) {
            toast.error("Invalid OTP, please try again.");
            return;
          }

          toast.success("Mobile number verified!");

          try {
            const response = await fetch("/api/patients", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: data.name,
                email: data.email || null,
                gender: data.gender || null,
                dob: data.dob || null,
                mobileNumber: cleanedNumber,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                areaOrPin: data.areaOrPin || null,
                bloodGroup: data.bloodGroup || null,
                referredByDr: data.referredByDr || null,
                userId: user?.userData?.id || null,
              }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(result.error || "Failed to save patient");
            }

            toast.success("Patient registered successfully!");

            // Reset form
            form.reset();

            // Call onSuccess callback
            if (onSuccess) {
              onSuccess();
            } else {
              router.push("/doctor/patient");
            }
          } catch (err) {
            console.error(err);
            toast.error(err instanceof Error ? err.message : "Failed to save patient. Please try again.");
          }
        };

        // Pass the wrapper to parent
        onOtpRequired(data, verifyWithData);
      } else {
        // Fallback: open OTP modal inline
        setIsOtpModalOpen(true);
      }
    } else {
      // Phone validation is disabled, skip OTP and save directly
      try {
        const cleanedNumber = data.mobileNumber
          .replace(/^\+91/, "")
          .replace(/[\s-]/g, "")
          .trim();

        const response = await fetch("/api/patients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email || null,
            gender: data.gender || null,
            dob: data.dob || null,
            mobileNumber: cleanedNumber,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            areaOrPin: data.areaOrPin || null,
            bloodGroup: data.bloodGroup || null,
            referredByDr: data.referredByDr || null,
            userId: user?.userData?.id || null,
            hospitalId: user?.hospital?.hospitalId
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to save patient");
        }

        toast.success("Patient registered successfully!");

        // Reset form
        form.reset();

        // Call onSuccess callback or redirect
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/doctor/patient");
        }
      } catch (err) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : "Failed to save patient. Please try again.");
      }
    }
  };
  const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh", "Andaman & Nicobar", "Dadra & Nagar Haveli", "Lakshadweep", "Daman & Diu",
  ];

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-6"
        >
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
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
            // rules={{ required: "Email is required" }}
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dob"
            // rules={{ required: "Date of Birth is required" }}
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
          {/* import InputMask from "react-input-mask"; // ... */}
          <FormField
            control={form.control}
            name="mobileNumber"
            rules={{ required: "Mobile number is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <MaskedInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="+91 000-000-0000"
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
              <FormItem className="flex flex-col">
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Combobox
                    value={field.value}
                    onChange={(value: any) => field.onChange(value)}
                    placeholder="Select a state..."
                    list={indianStates}
                  />
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

                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Blood Group" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>

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
          {/* Address (Full Width) */}
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>

                  <FormControl>
                    <Textarea
                      placeholder="Full Address"
                      className="min-h-[90px] w-full resize-none"
                      {...field}
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
              onClick={() => {
                form.reset();
                if (onCancel) {
                  onCancel();
                } else {
                  router.back();
                }
              }}
            >
              Cancel
            </Button>

            <Button variant="outline" type="submit">
              Add Patient
            </Button>
          </div>
        </form>
      </Form>
      {!onOtpRequired && isOtpModalOpen && (
        <div className="absolute flex justify-center items-center dark:bg-black  dark:text-gray-300 w-full h-screen ">
          <InputOTPForm
            // mobileNumber={otpData.mobileNumber}
            onVerify={(otp) => handleVerifyOtp(otp)}
            onClose={() => {
              setIsOtpModalOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
