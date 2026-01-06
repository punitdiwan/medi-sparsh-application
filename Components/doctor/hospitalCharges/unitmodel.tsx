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
import { Scale } from "lucide-react";

export default function UnitModal({
  open,
  onClose,
  onSubmit,
  defaultData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  defaultData?: { name: string } | null;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      if (defaultData) {
        setName(defaultData.name || "");
      } else {
        setName("");
      }
    }
  }, [defaultData, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter unit name");
      return;
    }

    onSubmit({ name });
    onClose();
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Scale className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{defaultData ? "Edit Unit" : "Add Unit"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {defaultData ? "Update existing unit type details." : "Add a new unit type to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Name of Unit *</label>
            <Input
              placeholder="Enter unit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            {defaultData ? "Update Unit" : "Add Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
