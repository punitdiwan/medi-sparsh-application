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
import MaskedInput from "@/components/InputMask";
import { useOrganizationRoles } from "@/hooks/useOrganizationRoles"

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
  gender: z.enum(["male", "female", "other"]),
  address: z.string().min(5, "Address required"),
  role: z.string().min(1,"Role required"),
  department: z.string().min(2, "Department required"),
  joiningDate: z.string().nonempty("Joining date required"),
  dob: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const doctorDataSchema = z.object({
  specialization: z
    .array(
      z.object({
        // id: z.string().optional(),
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

const employeeSchema = baseEmployeeSchema;

type EmployeeFormType = z.infer<typeof employeeSchema>;

interface AddEmployeeFormProps {
  onCancel?: () => void;
}
export default function AddEmployeeForm({ onCancel }: AddEmployeeFormProps) {
  const { roles } = useOrganizationRoles();
  const [isDoctor, setIsDoctor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorErrors, setDoctorErrors] = useState<Record<string, string>>({});

  const { data } = useSession();
  // console.log("User Id",data?.user?.id)

  const form = useForm<EmployeeFormType>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      user_id: "",
      name: "",
      email: "",
      mobile: "",
      gender: "male",
      address: "",
      role: "other",
      department: "",
      joiningDate: "",
      dob: "",
      password: "",
      // specialization: [],
      // qualification: "",
      // experience: "",
      // consultationFee: "",
      // availability: "",
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
    setIsDoctor(roleValue === "doctor");
  }, [roleValue]);

  function handleSupabaseError(error: any, customPrefix?: string) {
    console.log("🔍 Supabase error details:", error);

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
  const onSubmit = async (values: any) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate doctor-specific fields if role is doctor
      if (isDoctor) {
        const errors: Record<string, string> = {};

        if (doctorData.specialization.length === 0) {
          errors.specialization = "At least one specialization is required";
        }
        if (!doctorData.qualification.trim()) {
          errors.qualification = "Qualification is required";
        }
        if (!doctorData.experience.trim()) {
          errors.experience = "Experience is required";
        }
        if (!doctorData.consultationFee.trim()) {
          errors.consultationFee = "Consultation fee is required";
        }

        if (Object.keys(errors).length > 0) {
          setDoctorErrors(errors);
          setIsSubmitting(false);
          return;
        }
      }

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
      };

      // Add doctor data if role is doctor
      if (isDoctor) {
        payload.doctorData = {
          specialization: doctorData.specialization,
          qualification: doctorData.qualification,
          experience: doctorData.experience,
          consultationFee: doctorData.consultationFee,
          availability: doctorData.availability,
        };
      }
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
                      <Input
                        placeholder="Set password"
                        type="password"
                        {...field}
                      />
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
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
                <MultiSelectDropdown
                  options={specializations.map((s) => ({
                    label: s.name,
                    value: s.id,
                  }))}
                  selected={doctorData.specialization.map((s) => s.id)}
                  onChange={(selectedIds) => {
                    const selectedObjects = specializations.filter((spec) =>
                      selectedIds.includes(spec.id)
                    );

                    setDoctorData((prev) => ({
                      ...prev,
                      specialization: selectedObjects,
                    }));
                  }}
                  placeholder="Select specialization(s)"
                />
                {doctorErrors.specialization && (
                  <p className="text-sm text-red-500">
                    {doctorErrors.specialization}
                  </p>
                )}
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
                  <div className="flex flex-col gap-2">
                    {/* Qualification */}
                    <Input
                      placeholder="e.g. MBBS, MD"
                      value={doctorData.qualification}
                      onChange={(e) =>
                        setDoctorData((prev) => ({
                          ...prev,
                          qualification: e.target.value,
                        }))
                      }
                      className={`${
                        doctorErrors.qualification &&
                        "border-1 border-red-400/60   "
                        }`}
                    />
                    {doctorErrors.qualification && (
                      <p className="text-sm text-red-500">
                        {doctorErrors.qualification}
                      </p>
                    )}
                  </div>

                  <div className={` flex flex-col gap-2`}>
                    {/* Experience */}
                    <Input
                      type="number"
                      placeholder="Years of experience"
                      value={doctorData.experience}
                      onChange={(e) =>
                        setDoctorData((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      className={`${
                        doctorErrors.experience &&
                        "border-1 border-red-400/60   "
                        }`}
                    />
                    {doctorErrors.experience && (
                      <p className="text-sm text-red-500">
                        {doctorErrors.experience}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2">
                    {/* Fee */}
                    <Input
                      type="number"
                      placeholder="Consultation fee"
                      value={doctorData.consultationFee}
                      onChange={(e) =>
                        setDoctorData((prev) => ({
                          ...prev,
                          consultationFee: e.target.value,
                        }))
                      }
                      className={`${
                        doctorErrors.consultationFee &&
                        "border-1 border-red-400/60   "
                        }`}
                    />
                    {doctorErrors.consultationFee && (
                      <p className="text-sm text-red-500">
                        {doctorErrors.consultationFee}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Availability */}
                    <Input
                      placeholder="Mon–Fri, 10AM–4PM"
                      value={doctorData.availability}
                      onChange={(e) =>
                        setDoctorData((prev) => ({
                          ...prev,
                          availability: e.target.value,
                        }))
                      }
                      className={`${
                        doctorErrors.availability &&
                        "border-1 border-red-400/60   "
                        }`}
                    />
                    {doctorErrors.availability && (
                      <p className="text-sm text-red-500">
                        {doctorErrors.availability}
                      </p>
                    )}
                  </div>
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
