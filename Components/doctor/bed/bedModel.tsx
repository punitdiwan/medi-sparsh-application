"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { BedCombobox } from "./BedCombobox";

type BedModalProps = {
  initialData?: any;
  onSave: (data: {
    id?: string;
    name: string;
    bedTypeId: string;
    bedGroupId: string;
    notAvailable: boolean;
  }) => void;
};

export default function BedModal({ initialData, onSave }: BedModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bedType, setBedType] = useState("");
  const [bedGroup, setBedGroup] = useState("");
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBedType(initialData.bedTypeId);
      setBedGroup(initialData.bedGroupId);
      setNotAvailable(initialData.notAvailable);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Name required");
    if (!bedType) return toast.error("Select bed type");
    if (!bedGroup) return toast.error("Select bed group");

    onSave({
      id: initialData?.id,
      name,
      bedTypeId: bedType,
      bedGroupId: bedGroup,
      notAvailable,
    });

    setOpen(false);
  };

  return (
    <>
      <Button variant={initialData ? "outline" : "default"} onClick={() => setOpen(true)}>
        {initialData ? "Edit" : "Add Bed"}
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-background p-6 w-full max-w-md rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
              {initialData ? "Edit Bed" : "Add Bed"}
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Bed Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <BedCombobox
                label="Bed Type"
                endpoint="/api/bed-types"
                value={bedType}
                onChange={setBedType}
              />

              <BedCombobox
                label="Bed Group"
                endpoint="/api/bed-groups"
                value={bedGroup}
                onChange={setBedGroup}
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={notAvailable}
                  onCheckedChange={(v) => setNotAvailable(!!v)}
                />
                <label>Not available for use</label>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {initialData ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
