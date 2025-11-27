"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const vitalSchema = z.object({
  name: z.string().min(2, "Vital name is required"),
  from: z.string().min(1, "From value is required"),
  to: z.string().min(1, "To value is required"),
  unit: z.string().min(1, "Unit is required"),
});

export type Vital = {
  id: string;
  name: string;
  from: string;
  to: string;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(vital?.name ?? "");
    setFrom(vital?.from ?? "");
    setTo(vital?.to ?? "");
    setUnit(vital?.unit ?? "");
    setError(null);
  }, [vital, open]);

  const handleSubmit = () => {
    try {
      const parsed = vitalSchema.parse({
        name: name.trim(),
        from: from.trim(),
        to: to.trim(),
        unit: unit.trim(),
      });

      const payload: Vital = {
        id: vital?.id ?? `v_${Date.now()}`,
        ...parsed,
      };

      onSave(payload);
      onOpenChange(false);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.issues[0]?.message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{vital ? "Edit Vital" : "Add Vital"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-2">

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label className="text-sm mb-1 block">Vital Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weight"
            />
          </div>


          <div>
            <label className="text-sm mb-1 block">
              Reference Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1">From *</label>
                <Input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="e.g. 90"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">To *</label>
                <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="e.g. 140"
                />
              </div>
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="text-sm mb-1 block">Unit *</label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. mmHg"
            />
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
