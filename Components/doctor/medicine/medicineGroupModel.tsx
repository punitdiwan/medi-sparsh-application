"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface MedicineGroup {
  id: string;
  name: string;
  createdAt?: Date;
  usageCount?: number;
  isUsed?: boolean;
}

export default function MedicineGroupModal({
  open,
  onClose,
  group,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  group?: MedicineGroup;
  onSave: (group: MedicineGroup) => void;
}) {
  const [groupName, setGroupName] = useState("");

  // Load existing value when editing
  useEffect(() => {
    setGroupName(group?.name || "");
  }, [group, open]);

  const handleSave = () => {
    if (!groupName.trim()) return;

    onSave({
      id: group?.id || "",
      name: groupName,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {group ? "Edit Medicine Group" : "Add Medicine Group"}
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
            {group ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
