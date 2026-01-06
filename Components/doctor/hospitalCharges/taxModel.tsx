"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Percent } from "lucide-react";

// Types
interface TaxData {
  name: string;
  percentage: number;
}

interface TaxModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaxData) => void;
  defaultData?: TaxData | null;
}

export default function TaxModal({ open, onClose, onSubmit, defaultData }: TaxModalProps) {
  const [name, setName] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (defaultData) {
        setName(defaultData.name || "");
        setPercentage(String(defaultData.percentage) || "");
      } else {
        setName("");
        setPercentage("");
      }
    }
  }, [defaultData, open]);

  const handlePercentageInput = (value: string) => {
    // Remove % if present
    const cleaned = value.replace(/%/g, "");

    // Allow only digits
    if (/^\d*$/.test(cleaned)) {
      setPercentage(cleaned);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter tax name");
      return;
    }

    if (!percentage.trim()) {
      toast.error("Please enter percentage");
      return;
    }

    const numericValue = Number(percentage);

    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      toast.error("Percentage must be between 0 and 100");
      return;
    }

    onSubmit({ name, percentage: numericValue });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Percent className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{defaultData ? "Edit Tax" : "Add Tax"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {defaultData ? "Update existing tax category details." : "Add a new tax category to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Tax Name *</label>
            <Input
              placeholder="Enter tax name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Percentage */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Percentage (%) *</label>
            <Input
              placeholder="Enter only digits"
              value={percentage}
              onChange={(e) => handlePercentageInput(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Note: Enter only digits (0-100).
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {defaultData ? "Update Tax" : "Add Tax"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
