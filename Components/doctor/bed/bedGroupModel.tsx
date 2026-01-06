"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Layers } from "lucide-react";

type Floor = {
  id: string;
  name: string;
};

type BedGroupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bedGroup?: { id?: string; name: string; floorId: string; floorName?: string | null; description: string | null };
  onSave: (bedGroup: { name: string; floorId: string; description?: string; id?: string }) => void;
};

export function BedGroupModal({ open, onOpenChange, bedGroup, onSave }: BedGroupModalProps) {
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [description, setDescription] = useState("");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loadingFloors, setLoadingFloors] = useState(true);

  useEffect(() => {
    if (open) {
      fetchFloors();
    }
  }, [open]);

  const fetchFloors = async () => {
    try {
      setLoadingFloors(true);
      const response = await fetch("/api/floors");
      if (!response.ok) throw new Error("Failed to fetch floors");
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("Failed to load floors");
    } finally {
      setLoadingFloors(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (bedGroup) {
        setName(bedGroup.name || "");
        setFloorId(bedGroup.floorId || "");
        setDescription(bedGroup.description || "");
      } else {
        setName("");
        setFloorId("");
        setDescription("");
      }
    }
  }, [bedGroup, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Bed group name is required");
      return;
    }

    if (!floorId) {
      toast.error("Floor is required");
      return;
    }

    onSave({ id: bedGroup?.id, name, floorId, description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Layers className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{bedGroup ? "Update Bed Group" : "Create Bed Group"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {bedGroup ? "Update existing bed group details." : "Create a new bed group to organize beds."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Bed Group Name *</label>
            <Input
              placeholder="Enter bed group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Floor *</label>
            <Select value={floorId} onValueChange={setFloorId}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFloors ? "Loading floors..." : "Select a floor"} />
              </SelectTrigger>
              <SelectContent>
                {floors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id}>
                    {floor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Description</label>
            <Textarea
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {bedGroup ? "Update Bed Group" : "Create Bed Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
