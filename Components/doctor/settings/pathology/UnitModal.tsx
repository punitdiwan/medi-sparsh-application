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
import { Scaling } from "lucide-react";

export type Unit = {
    id: string;
    name: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unit?: Unit;
    onSave: (data: Unit) => void;
};

export default function UnitModal({
    open,
    onOpenChange,
    unit,
    onSave,
}: Props) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (open) {
            setName(unit?.name || "");
        }
    }, [unit, open]);

    const handleSubmit = () => {
        if (!name.trim()) return toast.error("Unit Name is required");

        onSave({ id: unit?.id || Math.random().toString(36).substr(2, 9), name });
        onOpenChange(false);
        toast.success(unit ? "Unit updated successfully" : "Unit added successfully");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg">
                            <Scaling className="text-dialog-icon" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle>{unit ? "Edit Unit" : "Add Unit"}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Unit Name *</label>
                        <Input
                            placeholder="Unit Name"
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
                        {unit ? "Update Unit" : "Save Unit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
