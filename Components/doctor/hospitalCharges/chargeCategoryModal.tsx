"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Layers } from "lucide-react";

export interface ChargeCategoryItem {
  id?: string;
  chargeTypeId: string;
  name: string;
  description: string;
}

interface ChargeType {
  id: string;
  name: string;
}

interface ChargeCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChargeCategoryItem) => void;
  defaultData?: any | null;
  chargeTypes: ChargeType[];
}

export function ChargeCategoryModal({
  open,
  onClose,
  onSubmit,
  defaultData,
  chargeTypes,
}: ChargeCategoryModalProps) {
  const [chargeTypeId, setChargeTypeId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (defaultData && open) {
      setChargeTypeId(defaultData.chargeTypeId || "");
      setName(defaultData.name || "");
      setDescription(defaultData.description || "");
    } else if (open) {
      setChargeTypeId("");
      setName("");
      setDescription("");
    }
  }, [defaultData, open]);

  // Submit Handler
  const handleSubmit = () => {
    if (!chargeTypeId) return toast.error("Please select charge type");
    if (!name.trim()) return toast.error("Name is required");

    onSubmit({
      id: defaultData?.id,
      chargeTypeId,
      name,
      description,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Layers className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{defaultData ? "Edit Charge Category" : "Add Charge Category"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {defaultData ? "Update existing charge category details." : "Add a new charge category to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Charge Type Dropdown */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Charge Type *</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={chargeTypeId}
              onChange={(e) => setChargeTypeId(e.target.value)}
            >
              <option value="">Select Type</option>
              {chargeTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Name *</label>
            <Input
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Description</label>
            <Textarea
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
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
            {defaultData ? "Update Category" : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
