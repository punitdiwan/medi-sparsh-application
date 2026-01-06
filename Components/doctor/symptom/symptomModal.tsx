"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";

type SymptomType = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symptomTypes: SymptomType[];
  initialData?: {
    id?: string;
    name?: string;
    symptomTypeId?: string;
    description?: string;
  } | null;
  onSubmit: (data: { id?: string; name: string; symptomTypeId: string; description: string }) => Promise<void>;
};

export function SymptomModal({ open, onOpenChange, symptomTypes, initialData, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [symptomTypeId, setSymptomTypeId] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialData?.name || "");
    setSymptomTypeId(initialData?.symptomTypeId || "");
    setDescription(initialData?.description || "");
  }, [initialData, open]);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("Symptom name is required");
      return;
    }

    if (!symptomTypeId) {
      toast.error("Symptom type is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        symptomTypeId,
        description: description.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting symptom:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <Stethoscope className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{initialData ? "Edit Symptom" : "Add Symptom"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {initialData ? "Update existing symptom details." : "Add a new symptom to the system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="text-sm mb-1 block">Symptom Type *</label>
            <Select value={symptomTypeId} onValueChange={setSymptomTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select symptom type" />
              </SelectTrigger>
              <SelectContent>
                {symptomTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Symptom Name *</label>
            <Input
              placeholder="Enter symptom name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm mb-1 block">Description *</label>
            <Textarea
              placeholder="Enter symptom description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {loading ? "Saving..." : (initialData ? "Save Changes" : "Add Symptom")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

