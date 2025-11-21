"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BedCombobox } from "./BedCombobox";

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
  initialData?: any;
  onSave: (data: {
    id?: string;
    name: string;
    bedTypeId: string;
    bedGroupId: string;
  }) => void;
};

export default function BedModal({ initialData, onSave }: BedModalProps) {
  const [open, setOpen] = useState(false);
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
        setName(initialData.name);
        setBedType(initialData.bedTypeId);
        setBedGroup(initialData.bedGroupId);
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

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={initialData ? "outline" : "default"}>
          {initialData ? "Edit" : "Add Bed"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]"
        onInteractOutside={(e) => e.preventDefault()}  
        onEscapeKeyDown={(e) => e.preventDefault()}   
      >
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Bed" : "Add Bed"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label htmlFor="bed-name">Bed Name</Label>
            <Input
              id="bed-name"
              placeholder="Enter bed name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="floor-select">Floor</Label>
            <Select value={floor} onValueChange={setFloor}>
              <SelectTrigger id="floor-select">
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

          <div className="grid gap-1">
            <BedCombobox
              label="Bed Type"
              endpoint="/api/bed-types"
              value={bedType}
              onChange={setBedType}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="bed-group">Bed Group</Label>
            <Select value={bedGroup} onValueChange={setBedGroup}>
              <SelectTrigger id="bed-group">
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

          <Button onClick={handleSubmit}>
            {initialData ? "Update Bed" : "Add Bed"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
