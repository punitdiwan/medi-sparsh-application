"use client";

import { useState, useEffect } from "react";
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
import { Boxes } from "lucide-react";

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
    if (open) {
      setGroupName(group?.name || "");
    }
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
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Boxes className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{group ? "Edit Medicine Group" : "Add Medicine Group"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {group
                  ? "Update existing medicine group details."
                  : "Add a new medicine group to the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Group Name *</label>
            <Input
              placeholder="Enter medicine group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {group ? "Update Group" : "Add Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
