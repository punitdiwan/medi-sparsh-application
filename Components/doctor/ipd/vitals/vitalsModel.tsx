"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { HeartPulse, PlusCircle, X } from "lucide-react";

/* ---------------- Types ---------------- */
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

/* ---------------- Component ---------------- */
export default function VitalsModal({
  open,
  onClose,
  onSubmit,
  vitalsList,
  initialData = [],
}: VitalsModalProps) {
  const [vitals, setVitals] = useState<Vital[]>([]);

  useEffect(() => {
    setVitals(
      initialData.length > 0
        ? initialData
        : [{ vitalName: "", vitalValue: "", date: "" }]
    );
  }, [initialData, open]);

  const handleChange = (
    index: number,
    key: keyof Vital,
    value: string
  ) => {
    const newVitals = [...vitals];
    newVitals[index][key] = value;
    setVitals(newVitals);
  };

  const handleAddRow = () => {
    setVitals([...vitals, { vitalName: "", vitalValue: "", date: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    setVitals(vitals.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    for (const v of vitals) {
      if (!v.vitalName || !v.vitalValue || !v.date) {
        toast.error("Please fill all fields for all vitals");
        return;
      }
    }

    onSubmit(vitals);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <HeartPulse className="bg-dialog-header text-dialog-icon" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {initialData.length ? "Edit Vitals" : "Add Vitals"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
          {vitals.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-lg border p-4 bg-muted/20 border-dialog-input"
            >
              <div className="sm:col-span-4">
                <Label className="text-sm font-medium">
                  Vital Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={v.vitalName}
                  onValueChange={(val) =>
                    handleChange(index, "vitalName", val)
                  }
                >
                  <SelectTrigger className="bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue placeholder="Select Vital" />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {vitalsList.map((name) => (
                      <SelectItem key={name} value={name} className="select-dialog-item">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-4">
                <Label className="text-sm font-medium">
                  Vital Value <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. 120/80"
                  value={v.vitalValue}
                  onChange={(e) =>
                    handleChange(index, "vitalValue", e.target.value)
                  }
                  className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
                />
              </div>

              <div className="sm:col-span-3">
                <Label className="text-sm font-medium">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={v.date}
                  onChange={(e) =>
                    handleChange(index, "date", e.target.value)
                  }
                  className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                {vitals.length > 1 && (
                  <button
                    onClick={() => handleRemoveRow(index)}
                  >
                    <X size={16} color="red"/>
                  </button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRow}
            className="flex items-center gap-2 border-dialog-input"
          >
            <PlusCircle className="h-4 w-4" />
            Add Another Vital
          </Button>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {initialData.length ? "Update Vitals" : "Save Vitals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
