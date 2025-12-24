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
      <DialogContent className="sm:max-w-2xl rounded-xl border-muted/40 bg-background p-0 overflow-hidden shadow-lg">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 text-white bg-brand-gradient">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {initialData.length ? "Edit Vitals" : "Add Vitals"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {vitals.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end rounded-lg border p-4 bg-muted/20"
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select Vital" />
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
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                {vitals.length > 1 && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveRow(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRow}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Another Vital
          </Button>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {initialData.length ? "Update Vitals" : "Save Vitals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
