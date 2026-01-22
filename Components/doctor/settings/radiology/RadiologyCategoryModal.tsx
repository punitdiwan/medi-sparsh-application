"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { RadiologyCategory } from "./RadiologyCategoryManager";

/* -------------------- TYPE -------------------- */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: RadiologyCategory;
  onSaveSuccess: (data: RadiologyCategory) => void; // local save
};

/* -------------------- MODAL -------------------- */
export default function RadiologyCategoryModal({
  open,
  onOpenChange,
  category,
  onSaveSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setDescription(category?.description || "");
    }
  }, [category, open]);

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Category Name is required");

    setLoading(true);

    try {
      // Dummy "save" logic
      const newCategory: RadiologyCategory = {
        id: category?.id || crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
      };

      toast.success(category ? "Category updated successfully" : "Category added successfully");
      onSaveSuccess(newCategory);
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg">
              <FlaskConical className="text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Category Name *</label>
            <Input
              placeholder="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : category ? "Update Category" : "Save Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
