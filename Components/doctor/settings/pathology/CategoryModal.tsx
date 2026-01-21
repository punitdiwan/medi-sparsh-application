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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";

export type PathologyCategory = {
    id: string;
    name: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: PathologyCategory;
    onSave: (data: PathologyCategory) => void;
};

export default function CategoryModal({
    open,
    onOpenChange,
    category,
    onSave,
}: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) {
            setName(category?.name || "");
        }
    }, [category, open]);

    const handleSubmit = () => {
        if (!name.trim()) return toast.error("Category Name is required");

        onSave({ id: category?.id || Math.random().toString(36).substr(2, 9), name });
        onOpenChange(false);
        toast.success(category ? "Category updated successfully" : "Category added successfully");
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
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {category ? "Update Category" : "Save Category"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
