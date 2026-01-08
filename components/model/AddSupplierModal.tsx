"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { z } from "zod";

// Zod validation schema
const supplierSchema = z.object({
  supplierName: z.string()
    .min(1, "Supplier name is required")
    .min(3, "Supplier name must be at least 3 characters")
    .max(100, "Supplier name must not exceed 100 characters"),
  contactNumber: z.string()
    .min(1, "Contact number is required")
    .regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits"),
  address: z.string()
    .min(1, "Address is required")
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must not exceed 200 characters"),
  contactPerson: z.string()
    .min(1, "Contact person name is required")
    .min(3, "Contact person name must be at least 3 characters")
    .max(100, "Contact person name must not exceed 100 characters"),
  contactPersonNumber: z.string()
    .min(1, "Contact person number is required")
    .regex(/^[0-9]{10}$/, "Contact person number must be exactly 10 digits"),
  drugLicenseNumber: z.string()
    .min(1, "Drug license number is required")
    .min(5, "Drug license number must be at least 5 characters")
    .max(50, "Drug license number must not exceed 50 characters"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export interface Supplier {
  id: string;
  supplierName: string;
  contactNumber: string;
  address: string;
  contactPerson: string;
  contactPersonNumber: string;
  drugLicenseNumber: string;
  isDeleted?: boolean | null;
  createdAt?: Date;
}

export default function AddSupplierModal({
  open,
  setOpen,
  supplier,
  onSave,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  supplier?: Supplier;
  onSave: (supplier: Supplier) => void;
}) {
  const [form, setForm] = useState<SupplierFormData>({
    supplierName: "",
    contactNumber: "",
    address: "",
    contactPerson: "",
    contactPersonNumber: "",
    drugLicenseNumber: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SupplierFormData, string>>>({});

  // Load existing value when editing
  useEffect(() => {
    if (open) {
      if (supplier) {
        setForm({
          supplierName: supplier.supplierName,
          contactNumber: supplier.contactNumber,
          address: supplier.address,
          contactPerson: supplier.contactPerson,
          contactPersonNumber: supplier.contactPersonNumber,
          drugLicenseNumber: supplier.drugLicenseNumber,
        });
        setErrors({});
      } else {
        setForm({
          supplierName: "",
          contactNumber: "",
          address: "",
          contactPerson: "",
          contactPersonNumber: "",
          drugLicenseNumber: "",
        });
        setErrors({});
      }
    }
  }, [supplier, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name as keyof SupplierFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSave = () => {
    // Validate form with Zod
    const result = supplierSchema.safeParse(form);

    if (!result.success) {
      // Extract errors from Zod validation
      const fieldErrors: Partial<Record<keyof SupplierFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SupplierFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // If validation passes, save the supplier
    onSave({
      id: supplier?.id || "",
      ...result.data,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Truck className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {supplier ? "Update existing supplier details." : "Add a new supplier to the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Supplier Company Name *</label>
              <Input
                name="supplierName"
                placeholder="Enter supplier name"
                value={form.supplierName}
                onChange={handleChange}
                className={errors.supplierName ? "border-red-500" : ""}
              />
              {errors.supplierName && (
                <p className="text-red-500 text-xs mt-1">{errors.supplierName}</p>
              )}
            </div>

            {/* Supplier Contact */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Supplier Contact *</label>
              <Input
                name="contactNumber"
                placeholder="10-digit phone number"
                value={form.contactNumber}
                onChange={handleChange}
                maxLength={10}
                className={errors.contactNumber ? "border-red-500" : ""}
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
              )}
            </div>

            {/* Contact Person Name */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Contact Person Name *</label>
              <Input
                name="contactPerson"
                placeholder="Person name"
                value={form.contactPerson}
                onChange={handleChange}
                className={errors.contactPerson ? "border-red-500" : ""}
              />
              {errors.contactPerson && (
                <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
              )}
            </div>

            {/* Contact Person Phone */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Contact Person Phone *</label>
              <Input
                name="contactPersonNumber"
                placeholder="10-digit phone number"
                value={form.contactPersonNumber}
                onChange={handleChange}
                maxLength={10}
                className={errors.contactPersonNumber ? "border-red-500" : ""}
              />
              {errors.contactPersonNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.contactPersonNumber}</p>
              )}
            </div>

            {/* Drug License Number */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Drug License Number *</label>
              <Input
                name="drugLicenseNumber"
                placeholder="Enter license number"
                value={form.drugLicenseNumber}
                onChange={handleChange}
                className={errors.drugLicenseNumber ? "border-red-500" : ""}
              />
              {errors.drugLicenseNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.drugLicenseNumber}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Address *</label>
              <Input
                name="address"
                placeholder="Enter supplier address"
                value={form.address}
                onChange={handleChange}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {supplier ? "Update Supplier" : "Add Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
