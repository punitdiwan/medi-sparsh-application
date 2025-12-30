"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HeartPulse, PlusCircle, X, Info } from "lucide-react";
import { getVitalDefinitions, addIPDVitals } from "@/lib/actions/ipdVitals";

/* ---------------- Types ---------------- */
interface VitalDefinition {
  id: string;
  name: string;
  unit: string;
  from: string;
  to: string;
}

interface VitalEntry {
  vitalId: string;
  vitalName: string;
  vitalValue: string;
  unit: string;
  range: string;
  date: string;
}

interface VitalsModalProps {
  open: boolean;
  onClose: () => void;
  ipdAdmissionId: string;
  onSuccess: () => void;
  initialData?: any[];
}

/* ---------------- Component ---------------- */
export default function VitalsModal({
  open,
  onClose,
  ipdAdmissionId,
  onSuccess,
  initialData,
}: VitalsModalProps) {
  const [definitions, setDefinitions] = useState<VitalDefinition[]>([]);
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDefinitions();
      setEntries(
        initialData && initialData.length > 0
          ? initialData
          : [
            {
              vitalId: "",
              vitalName: "",
              vitalValue: "",
              unit: "",
              range: "",
              date: new Date().toISOString().split("T")[0],
            },
          ]
      );
    }
  }, [open, initialData]);

  const fetchDefinitions = async () => {
    const result = await getVitalDefinitions();
    if (result.data) {
      setDefinitions(result.data);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleChange = (index: number, key: keyof VitalEntry, value: string) => {
    const newEntries = [...entries];
    if (key === "vitalId") {
      const def = definitions.find((d) => d.id === value);
      if (def) {
        newEntries[index].vitalId = def.id;
        newEntries[index].vitalName = def.name;
        newEntries[index].unit = def.unit || "";
        newEntries[index].range =
          def.from && def.to ? `${def.from} - ${def.to}` : "";
      }
    } else {
      (newEntries[index] as any)[key] = value;
    }
    setEntries(newEntries);
  };

  const handleAddRow = () => {
    setEntries([
      ...entries,
      {
        vitalId: "",
        vitalName: "",
        vitalValue: "",
        unit: "",
        range: "",
        date: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const validateEntries = () => {
    for (const entry of entries) {
      if (!entry.vitalId || !entry.vitalValue || !entry.date) {
        toast.error("Please fill all required fields");
        return false;
      }

      // Range validation (if numeric)
      const def = definitions.find((d) => d.id === entry.vitalId);
      if (def && def.from && def.to) {
        const val = parseFloat(entry.vitalValue);
        const from = parseFloat(def.from);
        const to = parseFloat(def.to);

        if (!isNaN(val) && !isNaN(from) && !isNaN(to)) {
          if (val < from || val > to) {
            toast.warning(
              `${entry.vitalName} value (${val}) is outside the reference range (${from} - ${to})`
            );
          }
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateEntries()) return;

    setLoading(true);
    try {
      const result = await addIPDVitals(ipdAdmissionId, entries);
      if (result.data) {
        toast.success("Vitals saved successfully");
        onSuccess();
        onClose();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error saving vitals:", error);
      toast.error("Failed to save vitals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-xl border border-dialog bg-dialog-surface p-0 overflow-hidden shadow-lg">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <HeartPulse className="bg-dialog-header text-dialog-icon" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-wide">
              {initialData && initialData.length ? "Edit Vitals" : "Add Vitals"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto bg-dialog-surface text-dialog">
          {entries.map((v, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start rounded-lg border p-4 bg-muted/20 border-dialog-input"
            >
              <div className="sm:col-span-4 space-y-2">
                <Label className="text-sm font-medium">
                  Vital Name <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={v.vitalId}
                  onValueChange={(val) => handleChange(index, "vitalId", val)}
                >
                  <SelectTrigger className="bg-dialog-input border border-dialog-input text-dialog focus-visible:ring-primary">
                    <SelectValue placeholder="Select Vital" />
                  </SelectTrigger>
                  <SelectContent className="select-dialog-content">
                    {definitions.map((def) => (
                      <SelectItem
                        key={def.id}
                        value={def.id}
                        className="select-dialog-item"
                      >
                        {def.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {v.range && (
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-500 font-medium bg-blue-50/50 p-1.5 rounded border border-blue-100/50">
                    <Info className="h-3 w-3" />
                    Range: {v.range} {v.unit}
                  </div>
                )}
              </div>

              <div className="sm:col-span-4 space-y-2">
                <Label className="text-sm font-medium">
                  Vital Value <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. 120/80"
                    value={v.vitalValue}
                    onChange={(e) =>
                      handleChange(index, "vitalValue", e.target.value)
                    }
                    className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary pr-12"
                  />
                  {v.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                      {v.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3 space-y-2">
                <Label className="text-sm font-medium">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={v.date}
                  onChange={(e) => handleChange(index, "date", e.target.value)}
                  className="bg-dialog-input border-dialog-input text-dialog focus-visible:ring-primary"
                />
              </div>

              <div className="sm:col-span-1 pt-8 flex justify-end">
                {entries.length > 1 && (
                  <button
                    onClick={() => handleRemoveRow(index)}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={handleAddRow}
            className="flex items-center gap-2 border-dialog-input"
          >
            <PlusCircle className="h-4 w-4" />
            Add Another Vital
          </Button>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-dialog-muted"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                {initialData && initialData.length ? "Update Vitals" : "Save Vitals"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

