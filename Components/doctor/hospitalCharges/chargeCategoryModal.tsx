"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface ChargeCategoryItem {
  id?: string;
  categoryType: string; 
  name: string;
  description: string;
}


interface ChargeCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChargeCategoryItem) => void;
  defaultData?: ChargeCategoryItem | null;
}

const CHARGE_TYPES = [
  "Consultation",
  "Procedure",
  "Test / Lab",
  "Radiology",
  "IPD Charge",
  "Ambulance",
  "Other",
];

export function ChargeCategoryModal({
  open,
  onClose,
  onSubmit,
  defaultData,
}: ChargeCategoryModalProps) {
  const [categoryType, setCategoryType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Load Edit Data
  useEffect(() => {
    if (defaultData) {
      setCategoryType(defaultData.categoryType || "");
      setName(defaultData.name);
      setDescription(defaultData.description);
    } else {
      setCategoryType("");
      setName("");
      setDescription("");
    }
  }, [defaultData]);

  // Submit Handler
  const handleSubmit = () => {
    if (!categoryType) return toast.error("Please select charge type");
    if (!name.trim()) return toast.error("Name is required");

    onSubmit({
    id: defaultData?.id, 
    categoryType,
    name,
    description,
    });


    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {defaultData ? "Edit Charge Category" : "Add Charge Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">

          {/* Charge Type Dropdown */}
          <div className="flex flex-col gap-2">
            <Label>
              Charge Type <span className="text-red-500">*</span>
            </Label>

            <select
                className="border rounded-md p-2 bg-background"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                >
                <option value="">Select Type</option>
                {CHARGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                    {t}
                    </option>
                ))}
                </select>

          </div>

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {defaultData ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
