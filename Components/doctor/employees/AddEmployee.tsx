"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import AddDataModal from "./AddSpecializationModel";
import { MultiSelectDropdown } from "./MultipleSelect";
import Spinner from "@/components/Spinner";
import { useSession } from "@/lib/auth-client";
import { ImCross } from "react-icons/im";
import { useOrganizationRoles } from "@/hooks/useOrganizationRoles"
import { Eye, EyeOff } from "lucide-react";
import MaskedInput from "@/components/InputMask";

export type SimpleRole = {
  id: string
  role: string
}

//employee schema
const baseEmployeeSchema = z.object({
  user_id: z.string().optional().or(z.literal("")),
  name: z.string().min(2, "Employee name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z
    .string()
    .refine((val) => /^[6-9]\d{9}$/.test(val.replace(/^\+91/, "")), {
      message: "Enter a valid 10-digit mobile number starting with 6-9",
    }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  gender: z.enum(["male", "female", "other"]),
  role: z.string().min(1, "Role required"),
  dob: z.string().optional(),
  department: z.string().min(2, "Department required"),
  joiningDate: z.string().nonempty("Joining date required"),
  address: z.string().min(5, "Address required"),
});

const doctorDataSchema = z.object({
  specialization: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one specialization is required."),
  qualification: z.string().min(2, "Qualification is required."),
  experience: z.string().min(1, "Experience is required."),
  consultationFee: z.string().min(1, "Consultation fee is required."),
  availability: z.string().optional(),
});

const employeeSchema = baseEmployeeSchema.extend({
  doctorData: doctorDataSchema.optional(),
});

type EmployeeFormType = z.infer<typeof employeeSchema>;

interface AddEmployeeFormProps {
  onCancel?: () => void;
}
export default function AddEmployeeForm({ onCancel }: AddEmployeeFormProps) {
  const { roles } = useOrganizationRoles();
  const [isDoctor, setIsDoctor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorErrors, setDoctorErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const { data } = useSession();

  const form = useForm<EmployeeFormType>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      user_id: "",
      name: "",
      email: "",
      mobile: "",
      gender: "male",
      address: "",
      role: "",
      department: "",
      joiningDate: "",
      dob: "",
      password: "",
    },
  });

  const [doctorData, setDoctorData] = useState<{
    specialization: { id: string; name: string; description: string }[];
    qualification: string;
    experience: string;
    consultationFee: string;
    availability: string;
  }>({
    specialization: [],
    qualification: "",
    experience: "",
    consultationFee: "",
    availability: "",
  });

  const [specializations, setSpecializations] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  useEffect(() => {
    fetchSpecializations();
  }, []);



  async function fetchSpecializations() {
    try {
      const response = await fetch("/api/specializations");
      const result = await response.json();

      if (result.success && result.data) {
        setSpecializations(result.data.map((spec: any) => ({
          id: spec.id.toString(),
          name: spec.name,
          description: spec.description || "",
        })));
      } else {
        console.error("Failed to fetch specializations:", result.error);
        toast.error("Failed to load specializations");
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to load specializations");
    }
  }

  // Role change effect
  const roleValue = form.watch("role");
  useEffect(() => {
    setIsDoctor(roleValue?.toLowerCase() === "doctor");
  }, [roleValue]);

  function handleSupabaseError(error: any, customPrefix?: string) {

    let message = "Unexpected error. Please try again.";

    switch (error.code) {
      case "23505": // unique_violation
        message = "This email or record already exists.";
        break;

      case "23503": // foreign_key_violation
        message = "Invalid related data. Please check your selections.";
        break;

      case "23502": // not_null_violation
        message = "Required field missing. Please fill all details.";
        break;

      case "42601": // syntax_error
        message = "Internal issue while saving data. Please try again later.";
        break;

      default:
        // fallback to error message if it's user-readable
        if (error.message && !error.message.includes("violates"))
          message = error.message;
        break;
    }

    toast.error(customPrefix ? `${customPrefix} ${message}` : message);
  }

  // Submit handler
  const onSubmit = async (values: EmployeeFormType) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Prepare the payload
      const payload: any = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        gender: values.gender,
        address: values.address,
        role: values.role,
        department: values.department,
        joiningDate: values.joiningDate,
        dob: values.dob,
        doctorData: isDoctor ? values.doctorData : undefined,
      };
      // Call the API
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create employee");
      }

      toast.success("Employee added successfully!");
      form.reset();
      setDoctorData({
        specialization: [],
        qualification: "",
        experience: "",
        consultationFee: "",
        availability: "",
      });
      setDoctorErrors({});

      // Close the modal if onCancel is provided
      if (onCancel) {
        onCancel();
      }

    } catch (error: any) {
      console.error("Error adding employee:", error);
      handleSupabaseError(error, "Failed to add employee:");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg my-6 overflow-hidden relative z-[9999] h-[90vh] flex flex-col border border-dialog bg-dialog-surface p-0">

      <CardHeader className="flex items-center justify-between px-4 pt-4 pb-0 bg-dialog-header border-b border-dialog rounded-t-lg sticky top-0 z-10">
        <CardTitle className="text-xl font-semibold flex-1 text-foreground ">
          Add New Employee
        </CardTitle>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-foreground hover:text-foreground/80 ml-2"
        >
          <ImCross />
        </Button>
      </CardHeader>

      <CardContent className="overflow-y-auto px-6 pb-6 flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
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
                        placeholder="Enter email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Mobile & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <MaskedInput
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "").slice(-10);
                          field.onChange(cleaned.trim());
                        }}
                        placeholder="+91 000-000-0000"
                      />

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Set password"
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/50 hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[99999]">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="z-[99999]">
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.role}>
                            {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" max="9999-12-31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Department & Joining Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cardiology, HR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="joiningDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Joining Date</FormLabel>
                    <FormControl>
                      <Input type="date" max="9999-12-31" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Doctor-specific fields */}
            {isDoctor && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium text-white">
                  Doctor Details
                </h3>

                {/* Specializations */}
                <FormField
                  control={form.control}
                  name="doctorData.specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiSelectDropdown
                          options={specializations.map((s) => ({
                            label: s.name,
                            value: s.id,
                          }))}
                          selected={(field.value || []).map((s: any) => s.id)}
                          onChange={(selectedIds) => {
                            const selectedObjects = specializations.filter((spec) =>
                              selectedIds.includes(spec.id)
                            );
                            field.onChange(selectedObjects);
                          }}
                          placeholder="Select specialization(s)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AddDataModal
                  title="Add Specialization"
                  table="specializations"
                  fields={[
                    { name: "name", label: "Specialization Name" },
                    { name: "description", label: "Description" },
                  ]}
                  onSuccess={fetchSpecializations}
                />
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="doctorData.qualification"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="e.g. MBBS, MD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorData.experience"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" placeholder="Years of experience" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="doctorData.consultationFee"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input type="number" placeholder="Consultation fee" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doctorData.availability"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Mon–Fri, 10AM–4PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="reset"
                variant="outline"
                onClick={() => form.reset()}
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="scale-75">
                      <Spinner size={24} color="bg-black/80" />
                    </div>
                  </div>
                ) : (
                  "Add Employee"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
