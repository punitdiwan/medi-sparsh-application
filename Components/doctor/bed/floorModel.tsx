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
import { Building } from "lucide-react";

type FloorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floor?: { id?: string; name: string; description: string | null };
  onSave: (floor: { name: string; description?: string; id?: string }) => void;
};

export function FloorModal({ open, onOpenChange, floor, onSave }: FloorModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      if (floor) {
        setName(floor.name || "");
        setDescription(floor.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [floor, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Floor name is required");
      return;
    }

    onSave({ id: floor?.id, name, description });
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
              <Building className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{floor ? "Update Floor" : "Create Floor"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {floor ? "Update existing floor details." : "Create a new floor for the hospital."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Floor Name *</label>
            <Input
              placeholder="Enter floor name"
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
            {floor ? "Update Floor" : "Create Floor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
