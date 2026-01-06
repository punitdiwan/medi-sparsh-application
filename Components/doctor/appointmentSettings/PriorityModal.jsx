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
import { ArrowUpCircle } from "lucide-react";

export function PriorityModal({ open, onClose, onSubmit, initialData }) {
  const [priorityName, setPriorityName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPriorityName(initialData.name || "");
    } else {
      setPriorityName("");
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!priorityName.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ name: priorityName, id: initialData?.id });
      onClose();
    } catch (error) {
      console.error("Error submitting priority:", error);
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
              <ArrowUpCircle className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{initialData ? "Edit Priority" : "Add Priority"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {initialData ? "Update existing appointment priority." : "Create a new priority level for appointments."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Priority Name *</label>
            <Input
              value={priorityName}
              onChange={(e) => setPriorityName(e.target.value)}
              placeholder="e.g. High Priority"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !priorityName.trim()}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {loading ? "Saving..." : (initialData ? "Update Priority" : "Add Priority")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
