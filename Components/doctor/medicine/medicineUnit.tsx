"use client";

import { useEffect, useState } from "react";
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
import { Scale } from "lucide-react";

export type Unit = {
  id: string;
  unitName: string;
};

export function UnitModal({
  open,
  onOpenChange,
  unit,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: Unit;
  onSave: (data: Unit) => void;
}) {
  const [unitName, setUnitName] = useState("");

  useEffect(() => {
    if (open) {
      if (unit) {
        setUnitName(unit.unitName);
      } else {
        setUnitName("");
      }
    }
  }, [unit, open]);

  const handleSubmit = () => {
    if (!unitName.trim()) return;

    const payload: Unit = {
      id: unit?.id ?? Math.random().toString(36).substring(2),
      unitName,
    };

    onSave(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Scale className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{unit ? "Edit Unit" : "Add Unit"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {unit
                  ? "Update existing medicine unit details."
                  : "Add a new medicine unit to the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Unit Name *</label>
            <Input
              placeholder="Enter unit name"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
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
            {unit ? "Update Unit" : "Add Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
