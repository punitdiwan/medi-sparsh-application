"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ---------- TYPES ----------
export type ChargeTypeFlags = {
  appointment?: boolean;
  opd?: boolean;
  ipd?: boolean;
  pathology?: boolean;
  radiology?: boolean;
  bloodBank?: boolean;
  ambulance?: boolean;

  [key: string]: boolean | undefined;
};



export interface ChargeTypeItem {
  id: string;
  name: string;
  flags: ChargeTypeFlags;
}

interface ChargeTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id?: string; name: string; flags: ChargeTypeFlags }) => void;
  defaultData?: ChargeTypeItem | null;
}
// ---------------------------------------------

export function ChargeTypeModal({
  open,
  onClose,
  onSubmit,
  defaultData,
}: ChargeTypeModalProps) {
  const [name, setName] = useState<string>("");
  const [flags, setFlags] = useState<ChargeTypeFlags>({});

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name);
      setFlags(defaultData.flags);
    } else {
      setName("");
      setFlags({});
    }
  }, [defaultData]);

  const toggleFlag = (key: keyof ChargeTypeFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Charge Type name is required");
      return;
    }

    onSubmit({
      id: defaultData?.id,
      name: name.trim(),
      flags,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[500px] rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {defaultData ? "Edit Charge Type" : "Add Charge Type"}
          </DialogTitle>
        </DialogHeader>

        {/* Name Input */}
        <div className="space-y-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label>
              Charge Type <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter charge type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Module Selection */}
          <div className="flex flex-col gap-2">
            <Label>
              Module <span className="text-red-500">*</span>
            </Label>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.appointment}
                  onChange={() => toggleFlag("appointment")}
                />
                Appointment
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.opd}
                  onChange={() => toggleFlag("opd")}
                />
                OPD
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.ipd}
                  onChange={() => toggleFlag("ipd")}
                />
                IPD
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.pathology}
                  onChange={() => toggleFlag("pathology")}
                />
                Pathology
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.radiology}
                  onChange={() => toggleFlag("radiology")}
                />
                Radiology
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.bloodBank}
                  onChange={() => toggleFlag("bloodBank")}
                />
                Blood Bank
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!flags.ambulance}
                  onChange={() => toggleFlag("ambulance")}
                />
                Ambulance
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {defaultData ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
