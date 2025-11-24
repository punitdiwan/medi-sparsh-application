"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    if (defaultData) {
      setName(defaultData.name || "");
      setPercentage(String(defaultData.percentage) || "");
    } else {
      setName("");
      setPercentage("");
    }
  }, [defaultData]);

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
      <DialogContent className="rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {defaultData ? "Edit Tax" : "Add Tax"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Name */}
          <div className="flex flex-col space-y-2">
            <Label>Tax Name</Label>
            <Input
              placeholder="Enter tax name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Percentage */}
          <div className="flex flex-col space-y-2">
            <Label>Percentage (%)</Label>
            <Input
              placeholder="Enter only digits"
              value={percentage}
              onChange={(e) => handlePercentageInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Note: Enter only digits.
            </p>
          </div>

          <Button className="w-full mt-4" onClick={handleSubmit}>
            {defaultData ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
