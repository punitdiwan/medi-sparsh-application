"use client";

import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarDays, FileText, Pencil, PlusCircle } from "lucide-react";

/* ---------------- Types ---------------- */
export interface TimelineInput {
  title: string;
  date: string;
  description: string;
  document?: File | null;
  visibleToPerson: boolean;
}

interface TimelineDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TimelineInput) => void;
  initialData?: TimelineInput | null;
  isLoading?: boolean;
}

/* ---------------- Component ---------------- */
export default function TimelineDialog({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}: TimelineDialogProps) {
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState<TimelineInput>({
    title: "",
    date: "",
    description: "",
    document: null,
    visibleToPerson: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        title: "",
        date: "",
        description: "",
        document: null,
        visibleToPerson: false,
      });
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!form.title || !form.date || !form.description) {
      toast.error("Please fill all required fields");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 overflow-hidden shadow-lg">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 bg-brand-gradient text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              {isEdit ? (
                <Pencil className="h-5 w-5 text-white" />
              ) : (
                <PlusCircle className="h-5 w-5 text-white" />
              )}
            </div>

            <DialogTitle className="text-lg font-semibold tracking-wide">
              {isEdit ? "Edit Timeline" : "Add Timeline"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Surgery Performed"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <Label>
              Date <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Enter timeline description..."
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Attach Document */}
          <div className="space-y-1">
            <Label>Attach Document</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                onChange={(e) =>
                  setForm({
                    ...form,
                    document: e.target.files?.[0] || null,
                  })
                }
                disabled={isLoading}
              />
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              checked={form.visibleToPerson}
              onCheckedChange={(val) =>
                setForm({
                  ...form,
                  visibleToPerson: Boolean(val),
                })
              }
              disabled={isLoading}
            />
            <Label className="cursor-pointer">
              Visible to this person
            </Label>
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90"
          >
            {isLoading
              ? "Saving..."
              : isEdit
              ? "Update Timeline"
              : "Save Timeline"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
