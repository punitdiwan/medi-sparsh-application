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

type BedTypeModalProps = {
  bedType?: { id?: string; name: string; description: string | null };
  onSave: (bedType: { name: string; description?: string; id?: string }) => void;
};

export function BedTypeModal({ bedType, onSave }: BedTypeModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (bedType) {
      setName(bedType.name);
      setDescription(bedType.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [bedType]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Bed type name is required");
      return;
    }

    onSave({ id: bedType?.id, name, description });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={bedType ? "outline" : "default"}>
          {bedType ? "Edit Bed Type" : "Add Bed Type"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]"
        onInteractOutside={(e) => e.preventDefault()}  
        onEscapeKeyDown={(e) => e.preventDefault()}   
      >
        <DialogHeader>
          <DialogTitle>{bedType ? "Update Bed Type" : "Create Bed Type"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-1">
            <Label htmlFor="bed-type-name">Bed Type Name</Label>
            <Input
              id="bed-type-name"
              placeholder="Enter bed type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="bed-type-description">Description</Label>
            <Textarea
              id="bed-type-description"
              placeholder="Enter description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit}>
            {bedType ? "Update Bed Type" : "Create Bed Type"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
