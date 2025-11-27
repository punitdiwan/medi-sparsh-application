"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Vital = {
  id: string;
  name: string;
  from: string; 
  to?: string;
  unit: string;
};
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vital?: Vital | null;
  onSave: (v: Vital) => void;
};

export function VitalModal({ open, onOpenChange, vital, onSave }: Props) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    setName(vital?.name ?? "");
    setFrom(vital?.from ?? "");
    setTo(vital?.to ?? "");
    setUnit(vital?.unit ?? "");
  }, [vital, open]);

  const handleSubmit = () => {
    if (!name.trim()) return alert("Vital name is required");
    if (!from.trim()) return alert("From value is required");
    if (!unit.trim()) return alert("Unit is required");

    onSave({
      id: vital?.id ?? `v_${Date.now()}`,
      name: name.trim(),
      from: from.trim(),
      to: to.trim() || undefined,
      unit: unit.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{vital ? "Edit Vital" : "Add Vital"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          {/* Name */}
          <div>
            <label className="text-sm mb-1 block">Vital Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weight" />
          </div>

          {/* Range */}
          <div>
            <label className="text-sm mb-1 block">
              Reference Range <span className="text-muted-foreground">(If single value, enter only From)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1">From</label>
                <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. 90" />
              </div>

              <div>
                <label className="text-xs block mb-1">To (optional)</label>
                <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. 140" />
              </div>
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="text-sm mb-1 block">Unit *</label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. mmHg" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {vital ? "Save Changes" : "Add Vital"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
