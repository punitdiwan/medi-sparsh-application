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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FlaskConical, Plus, Trash2, X } from "lucide-react";
import { getRadiologyCategories } from "@/lib/actions/radiologyCategories";
import { getRadiologyUnits } from "@/lib/actions/radiologyUnits";
import { createRadiologyTest, updateRadiologyTest } from "@/lib/actions/radiologyTests";
import { getChargeCategories, getCharges } from "@/lib/actions/chargeActions";

export type ParameterRow = {
    id: string;
    paramName: string;
    fromRange: string;
    toRange: string;
    unitId: string;
    description?: string;
};

export type RadiologyTest = {
    id: string;
    testName: string;
    shortName: string;
    testType: string;
    description?: string;
    categoryId: string;
    categoryName?: string;
    subCategoryId: string;
    reportHours: string;
    chargeCategoryId: string;
    chargeId: string;
    chargeName: string;
    tax: number;
    standardCharge: number;
    amount: number;
    parameters: ParameterRow[];
    isDeleted?: boolean;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    test?: RadiologyTest;
    onSaveSuccess: () => void;
};

export default function RadiologyTestModal({
    open,
    onOpenChange,
    test,
    onSaveSuccess,
}: Props) {
    const [form, setForm] = useState<RadiologyTest>({
        id: "",
        testName: "",
        shortName: "",
        testType: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        reportHours: "",
        chargeCategoryId: "",
        chargeId: "",
        chargeName: "",
        tax: 0,
        standardCharge: 0,
        amount: 0,
        parameters: [
            { id: Date.now().toString(), paramName: "", fromRange: "", toRange: "", unitId: "", description: "" }
        ],
    });

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
    const [units, setUnits] = useState<{ id: string, name: string }[]>([]);
    const [chargeCats, setChargeCats] = useState<{ id: string, name: string }[]>([]);
    const [allCharges, setAllCharges] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, unitRes, chargeCatRes, chargeRes] = await Promise.all([
                    getRadiologyCategories(),
                    getRadiologyUnits(),
                    getChargeCategories(),
                    getCharges()
                ]);

                if (catRes.data) setCategories(catRes.data);
                if (unitRes.data) setUnits(unitRes.data);
                if (chargeCatRes.data) {
                    const chargeData = chargeCatRes.data.filter((item: any) =>
                        item.categoryType?.toLowerCase() === "radiology"
                    );

                    setChargeCats(chargeData);
                }
                if (chargeRes.data) setAllCharges(chargeRes.data);
            } catch (error) {
                console.error("Error fetching modal data:", error);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (test) {
                setForm({
                    ...test,
                    reportHours: test.reportHours ?? "",
                    parameters: Array.isArray(test.parameters) ? test.parameters : (test as any).testParameters || []
                });
            } else {
                setForm({
                    id: "",
                    testName: "",
                    shortName: "",
                    testType: "",
                    description: "",
                    categoryId: "",
                    subCategoryId: "",
                    reportHours: "",
                    chargeCategoryId: "",
                    chargeId: "",
                    chargeName: "",
                    tax: 0,
                    standardCharge: 0,
                    amount: 0,
                    parameters: [
                        { id: Date.now().toString(), paramName: "", fromRange: "", toRange: "", unitId: "", description: "" }
                    ],
                });
            }
        }
    }, [test, open]);

    const availableCharges = allCharges.filter(c => c.chargeCategoryId === form.chargeCategoryId);

    useEffect(() => {
        if (!open) return;
        if (!test) return;
        if (!form.chargeId) return;
        if (allCharges.length === 0) return;

        const selectedCharge = allCharges.find(c => c.id === form.chargeId);
        if (!selectedCharge) return;

        const taxAmount =
            (Number(selectedCharge.amount) * (selectedCharge.taxPercent || 0)) / 100;

        setForm(prev => ({
            ...prev,
            chargeName: selectedCharge.name,
            tax: selectedCharge.taxPercent || 0,
            standardCharge: Number(selectedCharge.amount),
            amount: Number(selectedCharge.amount) + taxAmount,
        }));
    }, [open, test, form.chargeId, allCharges]);

    // Handle Charge Category Change
    const handleChargeCategoryChange = (val: string) => {
        setForm({
            ...form,
            chargeCategoryId: val,
            chargeId: "",
            chargeName: "",
            tax: 0,
            standardCharge: 0,
            amount: 0,
        });
    };

    // Handle Charge Name Change
    const handleChargeNameChange = (val: string) => {
        const selectedCharge = availableCharges.find(c => c.id === val);
        if (selectedCharge) {
            const taxAmount = (selectedCharge.amount * (selectedCharge.taxPercent || 0)) / 100;
            const totalAmount = Number(selectedCharge.amount) + Number(taxAmount);
            setForm({
                ...form,
                chargeId: val,
                chargeName: selectedCharge.name,
                tax: selectedCharge.taxPercent || 0,
                standardCharge: Number(selectedCharge.amount),
                amount: totalAmount,
            });
        }
    };

    // Handle Parameter Row Change
    const handleParameterRowUpdate = (rowId: string, field: keyof ParameterRow, value: string) => {
        setForm({
            ...form,
            parameters: form.parameters.map(p =>
                p.id === rowId ? { ...p, [field]: value } : p
            )
        });
    };

    const addParameterRow = () => {
        setForm({
            ...form,
            parameters: [...form.parameters, { id: Date.now().toString(), paramName: "", fromRange: "", toRange: "", unitId: "", description: "" }]
        });
    };

    const removeParameterRow = (id: string) => {
        if (form.parameters.length === 1) return toast.error("At least one parameter is required");
        setForm({
            ...form,
            parameters: form.parameters.filter(p => p.id !== id)
        });
    };

    const handleSubmit = async () => {
        if (!form.testName) return toast.error("Test Name is required");
        if (!form.categoryId) return toast.error("Category is required");
        if (!form.reportHours) return toast.error("Report Hours is required");
        if (!form.chargeId) return toast.error("Charge is required");

        setLoading(true);
        try {
            const payload = {
                testName: form.testName,
                shortName: form.shortName,
                testType: form.testType,
                description: form.description,
                categoryId: form.categoryId,
                subCategoryId: form.subCategoryId,
                reportHours: Number(form.reportHours),
                chargeCategoryId: form.chargeCategoryId,
                chargeId: form.chargeId,
                chargeName: form.chargeName,
                parameters: form.parameters.map(p => ({
                    paramName: p.paramName,
                    fromRange: p.fromRange,
                    toRange: p.toRange,
                    unitId: p.unitId,
                    description: p.description,
                })),
            };

            const result = test
                ? await updateRadiologyTest(test.id, payload)
                : await createRadiologyTest(payload as any);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(test ? "Test updated successfully" : "Test added successfully");
                onSaveSuccess();
            }
        } catch (error) {
            toast.error("An error occurred while saving");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center rounded-lg">
                                <FlaskConical className="text-dialog-icon" />
                            </div>
                            <DialogTitle>
                                {test ? "Edit Radiology Test" : "Add Radiology Test"}
                            </DialogTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="px-6 py-5 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Test Name *</label>
                            <Input
                                placeholder="Test Name"
                                value={form.testName ?? ""}
                                onChange={(e) => setForm({ ...form, testName: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Short Name</label>
                            <Input
                                placeholder="Short Name"
                                value={form.shortName ?? ""}
                                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Test Type</label>
                            <Input
                                placeholder="Test Type"
                                value={form.testType ?? ""}
                                onChange={(e) => setForm({ ...form, testType: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Category Name *</label>
                            <Select value={form.categoryId ?? ""} onValueChange={(v) => setForm({ ...form, categoryId: v })} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Sub Category</label>
                            <Input
                                placeholder="Sub Category"
                                value={form.subCategoryId ?? ""}
                                onChange={(e) => setForm({ ...form, subCategoryId: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Report Hours *</label>
                            <Input
                                type="number"
                                placeholder="Report Hours"
                                value={form.reportHours ?? ""}
                                onChange={(e) => setForm({ ...form, reportHours: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Charge Category *</label>
                            <Select value={form.chargeCategoryId ?? ""} onValueChange={handleChargeCategoryChange} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chargeCats.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Charge Name *</label>
                            <Select
                                value={form.chargeId ?? ""}
                                onValueChange={handleChargeNameChange}
                                disabled={!form.chargeCategoryId || loading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Charge" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCharges.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Tax (%)</label>
                            <Input value={form.tax ?? 0} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Standard Charge ($) *</label>
                            <Input value={form.standardCharge ?? 0} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount ($) *</label>
                            <Input value={form.amount ?? 0} disabled className="bg-muted" />
                        </div>
                    </div>

                    <div className="col-span-3 space-y-1">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            placeholder="Description"
                            value={form.description ?? ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Test Parameters</h3>
                        {form.parameters.map((param, index) => (
                            <div key={param.id} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-3 space-y-1">
                                    <label className="text-sm font-medium">Parameter Name *</label>
                                    <Input
                                        placeholder="Parameter Name"
                                        value={param.paramName ?? ""}
                                        onChange={(e) => handleParameterRowUpdate(param.id, "paramName", e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">From Range *</label>
                                    <Input
                                        placeholder="From"
                                        value={param.fromRange ?? ""}
                                        onChange={(e) => handleParameterRowUpdate(param.id, "fromRange", e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-sm font-medium">To Range *</label>
                                    <Input
                                        placeholder="To"
                                        value={param.toRange ?? ""}
                                        onChange={(e) => handleParameterRowUpdate(param.id, "toRange", e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <label className="text-sm font-medium">Unit *</label>
                                    <Select
                                        value={param.unitId ?? ""}
                                        onValueChange={(v) => handleParameterRowUpdate(param.id, "unitId", v)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {units.map(u => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeParameterRow(param.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="col-span-12 space-y-1">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input
                                        placeholder="Description (Optional)"
                                        value={param.description ?? ""}
                                        onChange={(e) => handleParameterRowUpdate(param.id, "description", e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addParameterRow}
                            className="mt-2"
                            disabled={loading}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Parameter
                        </Button>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted sticky bottom-0 z-10">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}
                        disabled={loading}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">
                        {loading ? "Saving..." : test ? "Update Test" : "Save Test"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
