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
import { Clock } from "lucide-react";

export function ShiftModal({ open, onClose, onSubmit, initialData }) {
  const [name, setName] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [loading, setLoading] = useState(false);

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
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!name.trim() || !timeFrom || !timeTo) return;
    setLoading(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name,
        startTime: timeFrom,
        endTime: timeTo,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting shift:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Clock className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{initialData ? "Edit Shift" : "Add Shift"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {initialData ? "Update existing shift details." : "Create a new shift for hospital staff."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Shift Name *</label>
            <Input
              placeholder="e.g. Morning Shift"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Time From *</label>
              <Input
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Time To *</label>
              <Input
                type="time"
                value={timeTo}
                onChange={(e) => setTimeTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !timeFrom || !timeTo}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {loading ? "Saving..." : (initialData ? "Update Shift" : "Add Shift")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
