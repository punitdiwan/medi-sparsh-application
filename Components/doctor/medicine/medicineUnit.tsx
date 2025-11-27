"use client";

import { useEffect, useState } from "react";
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
    if (unit) {
      setUnitName(unit.unitName);
    } else {
      setUnitName("");
    }
  }, [unit]);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {unit ? "Edit Unit" : "Add Unit"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Unit Name</Label>
            <Input
              placeholder="Enter unit name"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {unit ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
