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
import {
    createPathologyParameter,
    updatePathologyParameter,
} from "@/lib/actions/pathologyParameters";

export type PathologyParameter = {
    id: string;
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    testId: string;
    unitName?: string | null;
    description?: string | null;
    hospitalId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parameter?: PathologyParameter;
    onSaveSuccess: () => void;
    units: Unit[];
    tests: any[];
};

export default function ParameterModal({
    open,
    onOpenChange,
    parameter,
    onSaveSuccess,
    units,
    tests,
}: Props) {
    const [form, setForm] = useState<PathologyParameter>({
        id: "",
        paramName: "",
        fromRange: "",
        toRange: "",
        unitId: "",
        testId: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (parameter) {
                setForm(parameter);
            } else {
                setForm({
                    id: "",
                    paramName: "",
                    fromRange: "",
                    toRange: "",
                    unitId: "",
                    testId: "",
                    description: "",
                });
            }
        }
    }, [parameter, open]);

    const handleSubmit = async () => {
        if (!form.paramName.trim()) return toast.error("Parameter Name is required");
        if (!form.fromRange.trim()) return toast.error("From Reference Range is required");
        if (!form.toRange.trim()) return toast.error("To Reference Range is required");
        if (!form.unitId) return toast.error("Unit is required");
        if (!form.testId) return toast.error("Test is required");

        setLoading(true);
        try {
            const formData = {
                testId: form.testId,
                paramName: form.paramName.trim(),
                fromRange: form.fromRange.trim(),
                toRange: form.toRange.trim(),
                unitId: form.unitId,
                description: form.description?.trim() || undefined,
            };

            const result = parameter
                ? await updatePathologyParameter(parameter.id, formData)
                : await createPathologyParameter(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(parameter ? "Parameter updated successfully" : "Parameter added successfully");
                onSaveSuccess();
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
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
                            value={form.paramName}
                            onChange={(e) => setForm({ ...form, paramName: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Select Test *</label>
                        <Select
                            value={form.testId}
                            onValueChange={(v) => setForm({ ...form, testId: v })}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Test" />
                            </SelectTrigger>
                            <SelectContent>
                                {tests.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.testName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">From Reference Range *</label>
                            <Input
                                placeholder="From"
                                value={form.fromRange}
                                onChange={(e) => setForm({ ...form, fromRange: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">To Reference Range *</label>
                            <Input
                                placeholder="To"
                                value={form.toRange}
                                onChange={(e) => setForm({ ...form, toRange: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Unit *</label>
                        <Select
                            value={form.unitId}
                            onValueChange={(v) => setForm({ ...form, unitId: v })}
                            disabled={loading}
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
                            value={form.description || ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : parameter ? "Update Parameter" : "Save Parameter"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
