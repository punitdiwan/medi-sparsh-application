"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function UnitModal({ open, onClose, onSubmit, defaultData }: { open: boolean; onClose: () => void; onSubmit: (data: { name: string }) => void; defaultData?: { name: string } | null }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name || "");
    } else {
      setName("");
    }
  }, [defaultData]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter unit name");
      return;
    }

    onSubmit({ name });
    onClose();
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {defaultData ? "Edit Unit" : "Add Unit"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col space-y-2">
            <Label>Name of Unit</Label>
            <Input
              placeholder="Enter unit name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Button className="w-full mt-4" onClick={handleSubmit}>
            {defaultData ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
