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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Tag } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface OperationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; categoryId: number }) => void;
  categories: Category[];
  defaultData?: {
    name: string;
    categoryId: number;
  };
}

export function OperationDialog({
  open,
  onClose,
  onSubmit,
  categories,
  defaultData,
}: OperationDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    setName(defaultData?.name || "");
    setCategoryId(defaultData?.categoryId ?? null);
  }, [defaultData, open]);

  const isEdit = Boolean(defaultData);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="bg-brand-gradient px-6 py-4 text-white">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList className="h-5 w-5" />
            {isEdit ? "Edit Operation" : "Add Operation"}
          </DialogTitle>
          <p className="text-sm text-white/80">
            {isEdit
              ? "Update operation details"
              : "Create a new hospital operation"}
          </p>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1 font-medium">
              <ClipboardList className="h-4 w-4 text-primary" />
              Operation Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Enter operation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1 font-medium">
              <Tag className="h-4 w-4 text-primary" />
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={categoryId?.toString()}
              onValueChange={(val) => setCategoryId(Number(val))}
            >
              <SelectTrigger className="focus:ring-primary">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id.toString()}
                    className="cursor-pointer"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="bg-muted/40 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || categoryId === null}
            onClick={() => {
              if (categoryId === null) return;
              onSubmit({ name, categoryId });
              onClose();
            }}
            className="bg-brand-gradient text-white hover:opacity-90"
          >
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
