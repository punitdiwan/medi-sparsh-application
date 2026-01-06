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
import { Pill } from "lucide-react";

export type Medicine = {
  id: string;
  name: string;
  categoryId: string;
  companyName: string;
  unitId: string;
  groupId: string;
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
  groups: Array<{ id: string; name: string }>;
};

export function MedicineModal({
  open,
  onOpenChange,
  medicine,
  onSave,
  categories,
  companies,
  units,
  groups,
}: Props) {
  const [form, setForm] = useState<Medicine>({
    id: "",
    name: "",
    categoryId: "",
    companyName: "",
    unitId: "",
    groupId: "",
    notes: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (medicine) {
        setForm(medicine);
      } else {
        setForm({
          id: "",
          name: "",
          categoryId: "",
          companyName: "",
          unitId: "",
          groupId: "",
          notes: null,
        });
      }
    }
  }, [medicine, open]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Medicine name is required");
    if (!form.categoryId) return toast.error("Category is required");
    if (!form.companyName) return toast.error("Company is required");
    if (!form.unitId) return toast.error("Unit is required");
    if (!form.groupId) return toast.error("Group is required");

    try {
      setIsLoading(true);

      if (medicine) {
        const result = await updateMedicine(form);

        if (result.error) toast.error(result.error);
        else {
          toast.success("Medicine updated successfully");
          onSave(result.data as Medicine);
          onOpenChange(false);
        }
      } else {
        const result = await createMedicine(form);

        if (result.error) toast.error(result.error);
        else {
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
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Pill className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{medicine ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                Manage medicine details including category, company, unit & group.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1 col-span-2">
              <label className="text-sm mb-1 block">Medicine Name *</label>
              <Input
                placeholder="Medicine Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Category *</label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm({ ...form, categoryId: v })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background border-input">
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

            {/* Group */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Group *</label>
              <Select
                value={form.groupId}
                onValueChange={(v) => setForm({ ...form, groupId: v })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Company *</label>
              <Select
                value={form.companyName}
                onValueChange={(v) => setForm({ ...form, companyName: v })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background border-input">
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
            </div>

            {/* Unit */}
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Unit *</label>
              <Select
                value={form.unitId}
                onValueChange={(v) => setForm({ ...form, unitId: v })}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-background border-input">
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
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Note (optional)</label>
            <Textarea
              placeholder="Enter any additional notes..."
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
              disabled={isLoading}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {isLoading ? "Saving..." : medicine ? "Update Medicine" : "Add Medicine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
