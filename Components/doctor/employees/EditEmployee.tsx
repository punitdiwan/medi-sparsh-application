"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImCross } from "react-icons/im";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
import Spinner from "@/components/Spinner";
import MaskedInput from "@/components/InputMask";
import { useOrganizationRoles } from "@/hooks/useOrganizationRoles"
import AddDataModal from "./AddSpecializationModel";
import { MultiSelectDropdown } from "./MultipleSelect";

// ✅ Schemas
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

const fullEmployeeSchema = baseEmployeeSchema.extend({
  doctorData: doctorDataSchema.optional(),
});

type EmployeeFormData = z.infer<typeof fullEmployeeSchema>;

type EditEmployeeModalProps = {
  employeeId: string | null;

  onClose: () => void;
  onUpdated?: (updatedEmployee: EmployeeFormData) => void;
};

export function EditEmployeeModal({
  employeeId,
  onClose,
  onUpdated,
}: EditEmployeeModalProps) {

  const { roles } = useOrganizationRoles()
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [specializations, setSpecializations] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(fullEmployeeSchema),
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
      doctorData: {
        specialization: [],
        qualification: "",
        experience: "",
        consultationFee: "",
        availability: "",
      },
    },
  });

  const role = form.watch("role");

  // Fetch specializations
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
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  }

  useEffect(() => {
    fetchSpecializations();
  }, []);


  // Fetch employee by staffId
  useEffect(() => {
    if (!employeeId) return;
    const fetchEmployee = async () => {
      setInitialLoading(true);
      try {
        const response = await fetch(`/api/employees/${employeeId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to fetch employee");
        }

        const employee = result.data;

        if (!employee) {
          throw new Error("Employee not found");
        }

        // Populate form with employee data
        form.reset({
          user_id: employee.staff.userId,
          name: employee.user.name,
          email: employee.user.email || "",
          mobile: employee.staff.mobileNumber || "",
          gender: employee.staff.gender || "male",
          address: employee.staff.address || "",
          role: employee.member.role || "",
          department: employee.staff.department || "",
          joiningDate: employee.staff.joiningDate || "",
          dob: employee.staff.dob || "",
          doctorData: employee.doctorData ? {
            specialization: (Array.isArray(employee.doctorData.specialization)
              ? employee.doctorData.specialization
              : [employee.doctorData.specialization]).map((s: any) => ({
                id: s.id?.toString() || Math.random().toString(),
                name: s.name,
                description: s.description || "",
              })),
            qualification: employee.doctorData.qualification || "",
            experience: employee.doctorData.experience || "",
            consultationFee: employee.doctorData.consultationFee || "",
            availability: employee.doctorData.availability || "",
          } : undefined,
        });
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Failed to load employee data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId, form]);

  // Update employee
  const onSubmit = async (values: EmployeeFormData) => {
    if (!employeeId) return;
    setLoading(true);

    try {
      // Prepare the payload
      const payload: any = {
        name: values.name,
        mobileNumber: values.mobile,
        gender: values.gender,
        address: values.address,
        department: values.department,
        joiningDate: values.joiningDate,
        dob: values.dob,
      };

      // Add doctor data if role is doctor
      if (values.role?.toLowerCase() === "doctor" && values.doctorData) {
        payload.doctorData = {
          specialization: values.doctorData.specialization,
          qualification: values.doctorData.qualification,
          experience: values.doctorData.experience,
          consultationFee: values.doctorData.consultationFee,
          availability: values.doctorData.availability,
        };
      }

      // Call the API
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update employee");
      }

      toast.success("Employee updated successfully!");

      // Call the onUpdated callback if provided
      if (onUpdated) {
        onUpdated(values);
      }

      onClose();
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!employeeId} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-dialog bg-dialog-surface shadow-lg h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <CardHeader className="flex items-center justify-between px-4 pt-4 pb-0 bg-dialog-header border-b border-dialog rounded-t-lg sticky top-0 z-10">
          <CardTitle className="text-xl font-semibold flex-1 text-foreground ">
            Edit Employee
          </CardTitle>

          <Button
            variant="ghost"
            onClick={onClose}
            className="text-foreground hover:text-foreground/80 ml-2"
          >
            <ImCross />
          </Button>
        </CardHeader>

        <div className="overflow-y-auto px-6 pb-6 flex-1 scrollbar-hide">
          {initialLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size={50} />
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <MaskedInput
                            {...field}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "").slice(-10);
                              field.onChange(raw);
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
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
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
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[99999]">
                            {roles.map((item) => (
                              <SelectItem key={item.id} value={item.role}>
                                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
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
                          <Input type="date" {...field} max="9999-12-31" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          <Input
                            type="date"
                            {...field}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Doctor-only fields */}
                {role?.toLowerCase() === "doctor" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-medium text-white">Doctor Details</h3>
                    <div className="space-y-4">
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
                  </div>
                )}

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
                    disabled={loading}
                    className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="scale-75">
                          <Spinner size={24} color="bg-black/80" />
                        </div>
                      </div>
                    ) : (
                      "Update"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
