"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ----------------------
//        TYPES
// ----------------------
export type SupplierFormData = {
  supplierName: string;
  supplierContact: string;
  contactPersonName: string;
  contactPersonPhone: string;
  drugLicenseNumber: string;
  address: string;
};

type AddSupplierModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: SupplierFormData | null;
};

// ----------------------
//       COMPONENT
// ----------------------
export default function AddSupplierModal({
  open,
  setOpen,
  onSubmit,
  initialData
}: AddSupplierModalProps) {
  const [form, setForm] = useState<SupplierFormData>(
    initialData || {
      supplierName: "",
      supplierContact: "",
      contactPersonName: "",
      contactPersonPhone: "",
      drugLicenseNumber: "",
      address: ""
    }
  );

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      // reset form when adding new
      setForm({
        supplierName: "",
        supplierContact: "",
        contactPersonName: "",
        contactPersonPhone: "",
        drugLicenseNumber: "",
        address: ""
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.supplierName.trim()) return; // basic validation

    onSubmit(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <div>
            <Label>Supplier Name</Label>
            <Input
              name="supplierName"
              placeholder="Enter supplier name"
              value={form.supplierName}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Supplier Contact</Label>
            <Input
              name="supplierContact"
              placeholder="Phone or Email"
              value={form.supplierContact}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Contact Person Name</Label>
            <Input
              name="contactPersonName"
              placeholder="Person name"
              value={form.contactPersonName}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Contact Person Phone</Label>
            <Input
              name="contactPersonPhone"
              placeholder="Phone number"
              value={form.contactPersonPhone}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Drug License Number</Label>
            <Input
              name="drugLicenseNumber"
              placeholder="Enter license number"
              value={form.drugLicenseNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              name="address"
              placeholder="Enter supplier address"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {initialData ? "Save Changes" : "Add Supplier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
