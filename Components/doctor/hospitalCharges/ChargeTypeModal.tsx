"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tag } from "lucide-react";

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
    if (open) {
      if (defaultData) {
        setName(defaultData.name);
        setSelectedModules(defaultData.modules || []);
      } else {
        setName("");
        setSelectedModules([]);
      }
    }
  }, [defaultData, open]);

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
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Tag className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{defaultData ? "Edit Charge Type" : "Add Charge Type"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {defaultData ? "Update existing charge type details." : "Add a new charge type to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Charge Type *</label>
            <Input
              placeholder="Enter charge type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Module Selection */}
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Modules *</label>
            <div className="grid grid-cols-2 gap-3 mt-2 p-3 border rounded-md bg-background/50">
              {modules.length > 0 ? (
                modules.map((mod) => (
                  <label key={mod.id} className="flex items-center gap-2 cursor-pointer text-sm hover:text-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.id)}
                      onChange={() => toggleModule(mod.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    {mod.name}
                  </label>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-2">No modules found.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {defaultData ? "Update Type" : "Add Type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
