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
import { toast } from "sonner";

type FloorModalProps = {
  floor?: { id?: string; name: string; description: string };
  onSave: (floor: { name: string; description: string; id?: string }) => void;
};

export function FloorModal({ floor, onSave }: FloorModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (floor) {
      setName(floor.name);
      setDescription(floor.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [floor]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Floor name is required");
      return;
    }

    onSave({ id: floor?.id, name, description });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={floor ? "outline" : "default"}>
          {floor ? "Edit Floor" : "Add Floor"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]"
        onInteractOutside={(e) => e.preventDefault()}  
        onEscapeKeyDown={(e) => e.preventDefault()}   
      >
        <DialogHeader>
          <DialogTitle>{floor ? "Update Floor" : "Create Floor"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label htmlFor="floor-name">Floor Name</Label>
            <Input
              id="floor-name"
              placeholder="Enter floor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="floor-description">Description</Label>
            <Textarea
              id="floor-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit}>
            {floor ? "Update Floor" : "Create Floor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
