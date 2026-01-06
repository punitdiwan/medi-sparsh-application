"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bed } from "lucide-react";

type BedTypeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bedType?: { id?: string; name: string; description: string | null };
  onSave: (bedType: { name: string; description?: string; id?: string }) => void;
};

export function BedTypeModal({ open, onOpenChange, bedType, onSave }: BedTypeModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      if (bedType) {
        setName(bedType.name || "");
        setDescription(bedType.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [bedType, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Bed type name is required");
      return;
    }

    onSave({ id: bedType?.id, name, description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Bed className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{bedType ? "Update Bed Type" : "Create Bed Type"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {bedType ? "Update existing bed type details." : "Create a new bed type for hospital beds."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Bed Type Name *</label>
            <Input
              placeholder="Enter bed type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {bedType ? "Update Bed Type" : "Create Bed Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
