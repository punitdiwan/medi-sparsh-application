"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MedicineGroupModal({
  open,
  onClose,
  mode = "add", // "add" or "edit"
  defaultValue = "",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  defaultValue?: string;
  onSubmit: (value: string) => void;
}) {
  const [groupName, setGroupName] = useState("");

  // Load existing value when editing
  useEffect(() => {
    setGroupName(defaultValue);
  }, [defaultValue, open]);

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSubmit(groupName);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Medicine Group" : "Edit Medicine Group"}
          </DialogTitle>
        </DialogHeader>

        {/* INPUT FIELD */}
        <div className="flex flex-col gap-3 py-2">
          <Label>Group Name</Label>
          <Input
            placeholder="Enter medicine group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === "add" ? "Add" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
