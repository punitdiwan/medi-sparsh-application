"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PriorityModal({ open, onClose, onSubmit, initialData }) {
  const [priorityName, setPriorityName] = useState("");

  useEffect(() => {
    if (initialData) {
      setPriorityName(initialData.name || "");
    } else {
      setPriorityName("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!priorityName.trim()) return;

    onSubmit({ name: priorityName, id: initialData?.id });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Priority" : "Add Priority"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label>Priority Name</Label>
            <Input
              value={priorityName}
              onChange={(e) => setPriorityName(e.target.value)}
              placeholder="Enter priority"
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
