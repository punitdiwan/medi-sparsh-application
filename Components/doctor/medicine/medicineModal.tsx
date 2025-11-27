// MedicineModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createMedicine, updateMedicine } from "@/lib/actions/medicines";

export type Medicine = {
  id: string;
  name: string;
  categoryId: string;
  companyName: string;
  unitId: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: Medicine;
  onSave: (data: Medicine) => void;
  categories: Array<{ id: string; name: string }>;
  companies: Array<{ id: string; name: string }>;
  units: Array<{ id: string; name: string }>;
};

export function MedicineModal({
  open,
  onOpenChange,
  medicine,
  onSave,
  categories,
  companies,
  units,
}: Props) {
  const [form, setForm] = useState<Medicine>({
    id: "",
    name: "",
    categoryId: "",
    companyName: "",
    unitId: "",
    notes: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (medicine) {
      setForm(medicine);
    } else {
      setForm({
        id: "",
        name: "",
        categoryId: "",
        companyName: "",
        unitId: "",
        notes: null,
      });
    }
  }, [medicine, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!form.companyName) {
      toast.error("Company is required");
      return;
    }
    if (!form.unitId) {
      toast.error("Unit is required");
      return;
    }

    try {
      setIsLoading(true);

      if (medicine) {
        // Update existing medicine
        const result = await updateMedicine({
          id: form.id,
          name: form.name,
          categoryId: form.categoryId,
          companyName: form.companyName,
          unitId: form.unitId,
          notes: form.notes,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Medicine updated successfully");
          onSave(result.data as Medicine);
          onOpenChange(false);
        }
      } else {
        // Create new medicine
        const result = await createMedicine({
          name: form.name,
          categoryId: form.categoryId,
          companyName: form.companyName,
          unitId: form.unitId,
          notes: form.notes,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Medicine created successfully");
          onSave(result.data as Medicine);
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Error saving medicine:", error);
      toast.error("Failed to save medicine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {medicine ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>
          <DialogDescription>
            Manage medicine details including category, company & unit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Medicine Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="flex-1"
              disabled={isLoading}
            />

            {/* Category */}
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm({ ...form, categoryId: v })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {/* Company */}
            <Select
              value={form.companyName}
              onValueChange={(v) => setForm({ ...form, companyName: v })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Unit */}
            <Select
              value={form.unitId}
              onValueChange={(v) => setForm({ ...form, unitId: v })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <Textarea
            placeholder="Note (optional)"
            value={form.notes || ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
            disabled={isLoading}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : medicine ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
