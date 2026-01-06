"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus ,Stethoscope} from "lucide-react";

import { toast } from "sonner";

import { createSpecializationAction } from "@/lib/actions/specializationActions";

interface AddDataModalProps {
  title: string; // e.g. "Add Specialization"
  table: string; // e.g. "specializations"
  fields: {
    name: string; // e.g. "name"
    label: string; // e.g. "Specialization Name"
    type?: string; // e.g. "text", "number"
  }[];
  onSuccess?: () => void; // callback after successful insert
}

export default function AddDataModal({
  title,
  table,
  fields,
  onSuccess,
}: AddDataModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});

  function handleChange(field: string, value: any) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const result = await createSpecializationAction({
        name: formValues.name,
        description: formValues.description,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Specialization added successfully");
        setFormValues({});
        setOpen(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Specialization
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md z-[10000] border border-dialog bg-dialog-surface overflow-hidden rounded-lg p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-2 bg-dialog-header border-b border-dialog ">
          <div className="flex items-center gap-3">
            <div className="rounded-lg flex items-center justify-center">
              <Stethoscope className="bg-dialog-header text-dialog-icon" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm p-0">
            Fill in the details to create a new record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4 max-h-[60vh] overflow-y-auto bg-dialog-surface text-dialog">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type={field.type || "text"}
                value={formValues[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="px-6 py-3 bg-dialog-header border-t border-dialog text-dialog-muted sticky bottom-0">
          <Button onClick={handleSubmit} disabled={loading}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover flex items-center gap-2">
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
