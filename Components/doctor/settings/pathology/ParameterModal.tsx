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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { Unit } from "./UnitModal";

export type PathologyParameter = {
    id: string;
    parameterName: string;
    fromReferenceRange: string;
    toReferenceRange: string;
    unitId: string;
    unitName?: string;
    description: string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parameter?: PathologyParameter;
    onSave: (data: PathologyParameter) => void;
    units: Unit[];
};

export default function ParameterModal({
    open,
    onOpenChange,
    parameter,
    onSave,
    units,
}: Props) {
    const [form, setForm] = useState<PathologyParameter>({
        id: "",
        parameterName: "",
        fromReferenceRange: "",
        toReferenceRange: "",
        unitId: "",
        description: "",
    });

    useEffect(() => {
        if (open) {
            if (parameter) {
                setForm(parameter);
            } else {
                setForm({
                    id: "",
                    parameterName: "",
                    fromReferenceRange: "",
                    toReferenceRange: "",
                    unitId: "",
                    description: "",
                });
            }
        }
    }, [parameter, open]);

    const handleSubmit = () => {
        if (!form.parameterName.trim()) return toast.error("Parameter Name is required");
        if (!form.fromReferenceRange.trim()) return toast.error("From Reference Range is required");
        if (!form.toReferenceRange.trim()) return toast.error("To Reference Range is required");
        if (!form.unitId) return toast.error("Unit is required");

        const unitName = units.find(u => u.id === form.unitId)?.name;
        onSave({ ...form, id: form.id || Math.random().toString(36).substr(2, 9), unitName });
        onOpenChange(false);
        toast.success(parameter ? "Parameter updated successfully" : "Parameter added successfully");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center rounded-lg">
                            <FlaskConical className="text-dialog-icon" />
                        </div>
                        <div className="flex flex-col text-left">
                            <DialogTitle>{parameter ? "Edit Parameter" : "Add Parameter"}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Parameter Name *</label>
                        <Input
                            placeholder="Parameter Name"
                            value={form.parameterName}
                            onChange={(e) => setForm({ ...form, parameterName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">From Reference Range *</label>
                            <Input
                                placeholder="From"
                                value={form.fromReferenceRange}
                                onChange={(e) => setForm({ ...form, fromReferenceRange: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">To Reference Range *</label>
                            <Input
                                placeholder="To"
                                value={form.toReferenceRange}
                                onChange={(e) => setForm({ ...form, toReferenceRange: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Unit *</label>
                        <Select
                            value={form.unitId}
                            onValueChange={(v) => setForm({ ...form, unitId: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {parameter ? "Update Parameter" : "Save Parameter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
