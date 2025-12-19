"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type SymptomType = {
  id: string;
  name: string;
};

type Props = {
  symptomTypes: SymptomType[];
  initialData?: {
    id?: string;
    name?: string;
    symptomTypeId?: string;
    description?: string;
  };
  onSubmit: (data: { id?: string; name: string; symptomTypeId: string; description: string }) => Promise<void>;
};

export function SymptomModal({ symptomTypes, initialData, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [symptomTypeId, setSymptomTypeId] = useState(initialData?.symptomTypeId || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSymptomTypeId(initialData.symptomTypeId || "");
      setDescription(initialData.description || "");
    }
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
      setOpen(false);
      // Reset form
      setName("");
      setSymptomTypeId("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting symptom:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{initialData ? "Edit" : "Add Symptom"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Symptom" : "Add Symptom"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label>Symptom Type *</Label>
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
            <Label>Symptom Name *</Label>
            <Input
              placeholder="Enter symptom name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Description *</Label>
            <Textarea
              placeholder="Enter symptom description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

