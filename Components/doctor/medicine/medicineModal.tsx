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

export type Medicine = {
  id: string;
  medicineName: string;
  category: string;
  company: string;
  unit: string;
  note?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: Medicine;
  onSave: (data: Medicine) => void;
  categories: string[];
  companies: string[];
  units: string[];
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
    medicineName: "",
    category: "",
    company: "",
    unit: "",
    note: "",
  });

  useEffect(() => {
    if (medicine) setForm(medicine);
    else
      setForm({
        id: String(Date.now()),
        medicineName: "",
        category: "",
        company: "",
        unit: "",
        note: "",
      });
  }, [medicine]);

  const handleSubmit = () => {
    if (!form.medicineName) return alert("Medicine name required");
    onSave(form);
    onOpenChange(false);
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
                    value={form.medicineName}
                    onChange={(e) =>
                    setForm({ ...form, medicineName: e.target.value })
                    }
                    className="flex-1"
                />

                {/* Category */}
                <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                >
                    <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                        {c}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                {/* Company */}
                <Select
                    value={form.company}
                    onValueChange={(v) => setForm({ ...form, company: v })}
                >
                    <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                    {companies.map((c) => (
                        <SelectItem key={c} value={c}>
                        {c}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>

                {/* Unit */}
                <Select
                    value={form.unit}
                    onValueChange={(v) => setForm({ ...form, unit: v })}
                >
                    <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                    {units.map((u) => (
                        <SelectItem key={u} value={u}>
                        {u}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
          {/* Note */}
          <Textarea
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit}>
            {medicine ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
