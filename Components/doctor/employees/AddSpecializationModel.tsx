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
import { Plus } from "lucide-react";

import { toast } from "sonner";

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
    
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Specialization
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md z-[10000] bg-blur bg-black ">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new record.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
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

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
