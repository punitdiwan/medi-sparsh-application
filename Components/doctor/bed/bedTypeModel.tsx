"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type BedTypeModalProps = {
  bedType?: { id?: string; name: string };
  onSave: (bedType: { id?: string; name: string }) => void;
};

export function BedTypeModal({ bedType, onSave }: BedTypeModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (bedType) setName(bedType.name);
  }, [bedType]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    await onSave({ id: bedType?.id, name });
    setOpen(false);
    setName("");
  };

  return (
    <>
      <Button variant={bedType ? "outline" : "default"} onClick={() => setOpen(true)}>
        {bedType ? "Edit" : "Add Bed Type"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-background p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">{bedType ? "Edit Bed Type" : "Add Bed Type"}</h2>
            <div className="space-y-3">
              <div className="grid gap-1">
                <label className="font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Bed Type Name" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>{bedType ? "Update" : "Add"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
