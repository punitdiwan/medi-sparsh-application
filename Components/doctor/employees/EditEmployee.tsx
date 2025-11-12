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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Spinner from "@/components/Spinner";


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
  address: z.string().min(5, "Address required"),
  role: z.enum(["doctor", "receptionist", "other"]),
  department: z.string().min(2, "Department required"),
  joiningDate: z.string().nonempty("Joining date required"),
  dob: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const doctorDataSchema = z.object({
  specialization: z
    .array(
      z.object({
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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [specializations, setSpecializations] = useState<
    { id: string; name: string; description: string }[]
  >([]);

  const form = useForm<EmployeeFormData>({
    // resolver: zodResolver(fullEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      gender: "male",
      address: "",
      role: "doctor",
      department: "",
      joiningDate: "",
      dob: "",
      password: "",
      doctorData: {
        specialization: [{ name: "", description: "" }],
        qualification: "",
        experience: "",
        consultationFee: "",
        availability: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "doctorData.specialization",
  });

  const role = form.watch("role");

  // Fetch specializations
  useEffect(() => {
    const fetchSpecializations = async () => {
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
    };
    fetchSpecializations();
  }, []);

  // Fetch employee by staffId
  useEffect(() => {
    if (!employeeId) return; 
    console.log("Employee staffId", employeeId);
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
          role: employee.member.role || "other",
          department: employee.staff.department || "",
          joiningDate: employee.staff.joiningDate || "",
          dob: employee.staff.dob || "",
          password: "******", // Don't show actual password
          doctorData: employee.doctorData ? {
            specialization: Array.isArray(employee.doctorData.specialization) 
              ? employee.doctorData.specialization 
              : [employee.doctorData.specialization],
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
      if (values.role === "doctor" && values.doctorData) {
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
      <DialogContent className="max-w-2xl max-h-[80vh] p-6">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-scroll scrollbar-hide p-2 ">
          {initialLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size={50} />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("🔥 Native form submit triggered!");
                form.handleSubmit(onSubmit)(e);
              }}
            >
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Name</Label>
                  <Input {...form.register("name")} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Email</Label>
                  <Input {...form.register("email")} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Mobile</Label>
                  <Input {...form.register("mobile")} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Gender</Label>
                  <Select
                    value={form.watch("gender")}
                    onValueChange={(val:any) => form.setValue("gender", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Address</Label>
                  <Input {...form.register("address")} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Department</Label>
                  <Input {...form.register("department")} />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    {...form.register("joiningDate")}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  {/* <p className="text-xs text-gray-500">
                    Joining date cannot be changed
                  </p> */}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>DOB</Label>
                  <Input type="date" {...form.register("dob")} />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Role</Label>
                  <Select
                    value={form.watch("role")}
                    onValueChange={(val:any) => form.setValue("role", val as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Doctor-only fields */}
              {role === "doctor" && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Doctor Details</h3>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(
                            `doctorData.specialization.${index}.name`
                          )}
                          placeholder="Specialization"
                        />
                        <Input
                          {...form.register(
                            `doctorData.specialization.${index}.description`
                          )}
                          placeholder="Description"
                        />
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => remove(index)}
                          >
                            X
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ name: "", description: "" })}
                    >
                      + Add Specialization
                    </Button>

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex flex-col gap-1">
                        <Label>Qualification</Label>
                        <Input {...form.register("doctorData.qualification")} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label>Experience (years)</Label>
                        <Input {...form.register("doctorData.experience")} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label>Consultation Fee</Label>
                        <Input
                          {...form.register("doctorData.consultationFee")}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label>Availability</Label>
                        <Input {...form.register("doctorData.availability")} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>

                  <Button asChild>
                    <button type="submit" disabled={loading}>
                      {loading ? <Spinner size={20} /> : "Update"}
                    </button>
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
