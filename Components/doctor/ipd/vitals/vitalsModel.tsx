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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Vital {
  vitalName: string;
  vitalValue: string;
  date: string;
}

interface VitalsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Vital[]) => void;
  vitalsList: string[];
  initialData?: Vital[];
}

export default function VitalsModal({
  open,
  onClose,
  onSubmit,
  vitalsList,
  initialData = [],
}: VitalsModalProps) {
  const [vitals, setVitals] = useState<Vital[]>([]);

  useEffect(() => {
    setVitals(initialData.length > 0 ? initialData : [{ vitalName: "", vitalValue: "", date: "" }]);
  }, [initialData, open]);

  const handleChange = (index: number, key: keyof Vital, value: string) => {
    const newVitals = [...vitals];
    newVitals[index][key] = value;
    setVitals(newVitals);
  };

  const handleAddRow = () => {
    setVitals([...vitals, { vitalName: "", vitalValue: "", date: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const newVitals = vitals.filter((_, i) => i !== index);
    setVitals(newVitals);
  };

  const handleSave = () => {
    for (const v of vitals) {
      if (!v.vitalName || !v.vitalValue || !v.date) {
        toast.error("Please fill all fields for all vitals");
        return;
      }
    }

    onSubmit(vitals);
    setVitals([{ vitalName: "", vitalValue: "", date: "" }]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData.length ? "Edit Vitals" : "Add Vitals"}</DialogTitle>
          <DialogDescription>
            Enter patient vitals below. You can add multiple vitals at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {vitals.map((v, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-4">
                <Label>Vital Name *</Label>
                <Select value={v.vitalName} onValueChange={(val) => handleChange(index, "vitalName", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vital Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {vitalsList.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <Label>Vital Value *</Label>
                <Input
                  placeholder="Enter Vital Value"
                  value={v.vitalValue}
                  onChange={(e) => handleChange(index, "vitalValue", e.target.value)}
                />
              </div>

              <div className="col-span-3">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={v.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                />
              </div>

              <div className="col-span-1 flex justify-end">
                {vitals.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={handleAddRow}>
            + Add Another Vital
          </Button>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSave}>{initialData.length ? "Update" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
