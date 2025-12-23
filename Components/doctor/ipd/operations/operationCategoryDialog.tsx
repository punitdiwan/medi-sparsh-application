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
import { Tag, PlusCircle, Pencil } from "lucide-react";

interface OperationCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  defaultValue?: string;
}

export function OperationCategoryDialog({
  open,
  onClose,
  onSubmit,
  defaultValue = "",
}: OperationCategoryDialogProps) {
  const [category, setCategory] = useState("");

  useEffect(() => {
    setCategory(defaultValue);
  }, [defaultValue, open]);

  const isEdit = Boolean(defaultValue);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl border-muted/40 bg-background p-0 overflow-hidden shadow-lg">

        <DialogHeader className="px-6 py-4 text-white bg-brand-gradient">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              {isEdit ? (
                <Pencil className="h-5 w-5 text-white" />
              ) : (
                <Tag className="h-5 w-5 text-white" />
              )}
            </div>

            <DialogTitle className="text-lg font-semibold tracking-wide">
              {isEdit ? "Edit Operation Category" : "Add Operation Category"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-2">
          <Label className="text-sm font-medium">
            Operation Category <span className="text-destructive">*</span>
          </Label>

          <Input
            placeholder="e.g. General Surgery"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="focus-visible:ring-primary"
          />

          <p className="text-xs text-muted-foreground">
            This category will be used while creating hospital operations.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={() => {
              onSubmit(category.trim());
              onClose();
            }}
            disabled={!category.trim()}
            className="flex items-center gap-2 bg-brand-gradient text-white hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            {isEdit ? "Update Category" : "Save Category"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
