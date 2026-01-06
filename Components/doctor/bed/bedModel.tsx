"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BedCombobox } from "./BedCombobox";
import { BedDouble } from "lucide-react";

type Floor = {
  id: string;
  name: string;
};

type BedGroup = {
  id: string;
  name: string;
  floorId: string;
};

type BedModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSave: (data: {
    id?: string;
    name: string;
    bedTypeId: string;
    bedGroupId: string;
  }) => void;
};

export default function BedModal({ open, onOpenChange, initialData, onSave }: BedModalProps) {
  const [name, setName] = useState("");
  const [bedType, setBedType] = useState("");
  const [bedGroup, setBedGroup] = useState("");
  const [floor, setFloor] = useState("");
  const [floors, setFloors] = useState<Floor[]>([]);
  const [bedGroups, setBedGroups] = useState<BedGroup[]>([]);
  const [loadingFloors, setLoadingFloors] = useState(true);
  const [loadingBedGroups, setLoadingBedGroups] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFloors();
      fetchBedGroups();
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

  const fetchBedGroups = async () => {
    try {
      setLoadingBedGroups(true);
      const response = await fetch("/api/bed-groups");
      if (!response.ok) throw new Error("Failed to fetch bed groups");
      const data = await response.json();
      setBedGroups(data);
    } catch (error) {
      console.error("Error fetching bed groups:", error);
      toast.error("Failed to load bed groups");
    } finally {
      setLoadingBedGroups(false);
    }
  };

  // Filter bed groups by selected floor
  const filteredBedGroups = floor
    ? bedGroups.filter((bg) => bg.floorId === floor)
    : bedGroups;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || "");
        setBedType(initialData.bedTypeId || "");
        setBedGroup(initialData.bedGroupId || "");
        setFloor(initialData.floorId || "");
      } else {
        setName("");
        setBedType("");
        setBedGroup("");
        setFloor("");
      }
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Bed name is required");
    if (!bedType) return toast.error("Bed type is required");
    if (!floor) return toast.error("Floor is required");
    if (!bedGroup) return toast.error("Bed group is required");

    onSave({
      id: initialData?.id,
      name,
      bedTypeId: bedType,
      bedGroupId: bedGroup,
    });

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
              <BedDouble className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{initialData ? "Edit Bed" : "Add Bed"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {initialData ? "Update existing bed details." : "Add a new bed to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Bed Name *</label>
            <Input
              placeholder="Enter bed name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Floor *</label>
            <Select value={floor} onValueChange={setFloor}>
              <SelectTrigger>
                <SelectValue placeholder={loadingFloors ? "Loading floors..." : "Select a floor"} />
              </SelectTrigger>
              <SelectContent>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <BedCombobox
              label="Bed Type *"
              endpoint="/api/bed-types"
              value={bedType}
              onChange={setBedType}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Bed Group *</label>
            <Select value={bedGroup} onValueChange={setBedGroup}>
              <SelectTrigger>
                <SelectValue placeholder={loadingBedGroups ? "Loading bed groups..." : "Select a bed group"} />
              </SelectTrigger>
              <SelectContent>
                {filteredBedGroups.length > 0 ? (
                  filteredBedGroups.map((bg) => (
                    <SelectItem key={bg.id} value={bg.id}>
                      {bg.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    {floor ? "No bed groups for this floor" : "Select a floor first"}
                  </div>
                )}
              </SelectContent>
            </Select>
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
            {initialData ? "Update Bed" : "Add Bed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
