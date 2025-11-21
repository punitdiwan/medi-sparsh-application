"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Floor = {
  id: string;
  name: string;
};

type BedGroupModalProps = {
  bedGroup?: { id?: string; name: string; floorId: string; floorName?: string | null; description: string | null };
  onSave: (bedGroup: { name: string; floorId: string; description?: string; id?: string }) => void;
};

export function BedGroupModal({ bedGroup, onSave }: BedGroupModalProps) {
  const [open, setOpen] = useState(false);
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
        setName(bedGroup.name);
        setFloorId(bedGroup.floorId);
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={bedGroup ? "outline" : "default"}>
          {bedGroup ? "Edit Bed Group" : "Add Bed Group"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]"
        onInteractOutside={(e) => e.preventDefault()}  
        onEscapeKeyDown={(e) => e.preventDefault()}   
      >
        <DialogHeader>
          <DialogTitle>{bedGroup ? "Update Bed Group" : "Create Bed Group"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label htmlFor="bed-group-name">Bed Group Name</Label>
            <Input
              id="bed-group-name"
              placeholder="Enter bed group name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="floor-select">Floor</Label>
            <Select value={floorId} onValueChange={setFloorId}>
              <SelectTrigger id="floor-select">
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

          <div className="grid gap-1">
            <Label htmlFor="bed-group-description">Description</Label>
            <Textarea
              id="bed-group-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit}>
            {bedGroup ? "Update Bed Group" : "Create Bed Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
