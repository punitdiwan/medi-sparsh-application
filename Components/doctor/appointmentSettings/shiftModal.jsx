"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ShiftModal({ open, onClose, onSubmit, initialData }) {
  const [name, setName] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setTimeFrom(initialData.startTime || "");
      setTimeTo(initialData.endTime || "");
    } else {
      setName("");
      setTimeFrom("");
      setTimeTo("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim() || !timeFrom || !timeTo) return;

    onSubmit({
      id: initialData?.id,
      name,
      startTime: timeFrom,
      endTime: timeTo,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Shift" : "Add Shift"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div className="flex flex-col gap-1">
            <Label>Shift Name</Label>
            <Input
              placeholder="Enter shift name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Time From</Label>
            <Input
              type="time"
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Time To</Label>
            <Input
              type="time"
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {initialData ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
