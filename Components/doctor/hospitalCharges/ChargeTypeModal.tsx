"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ---------- TYPES ----------
interface Module {
  id: string;
  name: string;
}

interface ChargeTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id?: string; name: string; modules: string[] }) => void;
  defaultData?: { id: string; name: string; modules: string[] } | null;
  modules: Module[];
}
// ---------------------------------------------

export function ChargeTypeModal({
  open,
  onClose,
  onSubmit,
  defaultData,
  modules,
}: ChargeTypeModalProps) {
  const [name, setName] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (defaultData) {
      setName(defaultData.name);
      setSelectedModules(defaultData.modules || []);
    } else {
      setName("");
      setSelectedModules([]);
    }
  }, [defaultData]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Charge Type name is required");
      return;
    }

    onSubmit({
      id: defaultData?.id,
      name: name.trim(),
      modules: selectedModules,
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

            <div className="grid grid-cols-2 gap-2 mt-1 max-h-[200px] overflow-y-auto">
              {modules.length > 0 ? (
                modules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      className="cursor-pointer"
                    />
                    {mod.name}
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No modules found.</p>
              )}
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
