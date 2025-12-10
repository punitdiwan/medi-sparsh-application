"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Building2, Phone, User, MapPin, Award, Sparkles } from "lucide-react";
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
  isDeleted?: boolean;
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
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {/* Header - Colorful in light mode, simple in dark mode */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-800 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm p-3 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {supplier ? "Edit Supplier" : "Add New Supplier"}
                <Sparkles className="w-5 h-5 text-yellow-300 dark:hidden" />
              </h2>
              <p className="text-blue-100 dark:text-gray-400 text-sm mt-1">
                {supplier ? "Update supplier information" : "Fill in the details to add a new supplier"}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content - Colorful background in light mode, simple in dark mode */}
        <div className="p-6 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:bg-gray-900 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Supplier Name */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 dark:bg-transparent rounded-md group-hover:bg-blue-200 dark:group-hover:bg-transparent transition-colors">
                    <Building2 className="w-4 h-4 text-blue-600 dark:text-gray-400" />
                  </div>
                  Supplier Name *
                </Label>
                <Input
                  name="supplierName"
                  placeholder="Enter supplier name"
                  value={form.supplierName}
                  onChange={handleChange}
                  className={`border-2 ${errors.supplierName ? 'border-red-400 focus:border-red-500' : 'border-blue-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-gray-600'} focus:ring-blue-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.supplierName && (
                  <p className="text-red-500 text-xs mt-1">{errors.supplierName}</p>
                )}
              </div>

              {/* Supplier Contact */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-100 dark:bg-transparent rounded-md group-hover:bg-green-200 dark:group-hover:bg-transparent transition-colors">
                    <Phone className="w-4 h-4 text-green-600 dark:text-gray-400" />
                  </div>
                  Supplier Contact *
                </Label>
                <Input
                  name="contactNumber"
                  placeholder="10-digit phone number"
                  value={form.contactNumber}
                  onChange={handleChange}
                  maxLength={10}
                  className={`border-2 ${errors.contactNumber ? 'border-red-400 focus:border-red-500' : 'border-green-200 dark:border-gray-700 focus:border-green-400 dark:focus:border-gray-600'} focus:ring-green-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                )}
              </div>

              {/* Contact Person Name */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-transparent rounded-md group-hover:bg-purple-200 dark:group-hover:bg-transparent transition-colors">
                    <User className="w-4 h-4 text-purple-600 dark:text-gray-400" />
                  </div>
                  Contact Person Name *
                </Label>
                <Input
                  name="contactPerson"
                  placeholder="Person name"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className={`border-2 ${errors.contactPerson ? 'border-red-400 focus:border-red-500' : 'border-purple-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-gray-600'} focus:ring-purple-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.contactPerson && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Contact Person Phone */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-orange-100 dark:bg-transparent rounded-md group-hover:bg-orange-200 dark:group-hover:bg-transparent transition-colors">
                    <Phone className="w-4 h-4 text-orange-600 dark:text-gray-400" />
                  </div>
                  Contact Person Phone *
                </Label>
                <Input
                  name="contactPersonNumber"
                  placeholder="10-digit phone number"
                  value={form.contactPersonNumber}
                  onChange={handleChange}
                  maxLength={10}
                  className={`border-2 ${errors.contactPersonNumber ? 'border-red-400 focus:border-red-500' : 'border-orange-200 dark:border-gray-700 focus:border-orange-400 dark:focus:border-gray-600'} focus:ring-orange-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.contactPersonNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.contactPersonNumber}</p>
                )}
              </div>

              {/* Drug License Number */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-pink-100 dark:bg-transparent rounded-md group-hover:bg-pink-200 dark:group-hover:bg-transparent transition-colors">
                    <Award className="w-4 h-4 text-pink-600 dark:text-gray-400" />
                  </div>
                  Drug License Number *
                </Label>
                <Input
                  name="drugLicenseNumber"
                  placeholder="Enter license number"
                  value={form.drugLicenseNumber}
                  onChange={handleChange}
                  className={`border-2 ${errors.drugLicenseNumber ? 'border-red-400 focus:border-red-500' : 'border-pink-200 dark:border-gray-700 focus:border-pink-400 dark:focus:border-gray-600'} focus:ring-pink-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.drugLicenseNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.drugLicenseNumber}</p>
                )}
              </div>

              {/* Address */}
              <div className="group">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-100 dark:bg-transparent rounded-md group-hover:bg-indigo-200 dark:group-hover:bg-transparent transition-colors">
                    <MapPin className="w-4 h-4 text-indigo-600 dark:text-gray-400" />
                  </div>
                  Address *
                </Label>
                <Input
                  name="address"
                  placeholder="Enter supplier address"
                  value={form.address}
                  onChange={handleChange}
                  className={`border-2 ${errors.address ? 'border-red-400 focus:border-red-500' : 'border-indigo-200 dark:border-gray-700 focus:border-indigo-400 dark:focus:border-gray-600'} focus:ring-indigo-200 dark:focus:ring-gray-700 bg-white dark:bg-gray-800`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Simple in both modes */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 dark:bg-primary dark:hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {supplier ? "💾 Save Changes" : "✨ Add Supplier"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
