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
import { Microscope, Plus, Trash2, X } from "lucide-react";

export type ParameterRow = {
    id: string;
    parameterId: string;
    testParameterName: string;
    referenceRange: string;
    unit: string;
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
    method: string;
    reportDays: number | string;
    chargeCategoryId: string;
    chargeId: string;
    chargeName: string;
    tax: number;
    standardCharge: number;
    amount: number;
    parameters: ParameterRow[];
    unitId: string;
    unitName?: string;
    isDeleted?: boolean;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    test?: RadiologyTest;
    onSaveSuccess: () => void;
};

// Dummy data for dropdowns
const DUMMY_CATEGORIES = [
    { id: "cat1", name: "Radiography" },
    { id: "cat2", name: "CT Imaging" },
    { id: "cat3", name: "Ultrasonography" },
    { id: "cat4", name: "MRI Imaging" },
    { id: "cat5", name: "Fluoroscopy" },
];

const DUMMY_UNITS = [
    { id: "unit1", name: "Images" },
    { id: "unit2", name: "Studies" },
    { id: "unit3", name: "Sequences" },
    { id: "unit4", name: "Slices" },
];

const DUMMY_PARAMETERS = [
    { id: "param1", paramName: "PA View", fromRange: "Standard", toRange: "Standard", unitName: "Image" },
    { id: "param2", paramName: "Axial Images", fromRange: "5mm", toRange: "Standard", unitName: "Images" },
    { id: "param3", paramName: "B-mode Imaging", fromRange: "Complete", toRange: "Study", unitName: "Study" },
    { id: "param4", paramName: "T1/T2 Weighted", fromRange: "Standard", toRange: "Protocol", unitName: "Sequences" },
];

const DUMMY_CHARGE_CATEGORIES = [
    { id: "cc1", name: "X-Ray Services", categoryType: "radiology" },
    { id: "cc2", name: "CT Services", categoryType: "radiology" },
    { id: "cc3", name: "Ultrasound Services", categoryType: "radiology" },
    { id: "cc4", name: "MRI Services", categoryType: "radiology" },
];

const DUMMY_CHARGES = [
    { id: "ch1", name: "X-Ray Charge", chargeCategoryId: "cc1", amount: 1500, standardCharge: 1500, taxPercent: 5 },
    { id: "ch2", name: "CT Charge", chargeCategoryId: "cc2", amount: 4000, standardCharge: 4000, taxPercent: 12 },
    { id: "ch3", name: "Ultrasound Charge", chargeCategoryId: "cc3", amount: 800, standardCharge: 800, taxPercent: 5 },
    { id: "ch4", name: "MRI Charge", chargeCategoryId: "cc4", amount: 5000, standardCharge: 5000, taxPercent: 12 },
];

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
        method: "",
        reportDays: "",
        chargeCategoryId: "",
        chargeId: "",
        chargeName: "",
        tax: 0,
        standardCharge: 0,
        amount: 0,
        parameters: [
            { id: Date.now().toString(), parameterId: "", testParameterName: "", referenceRange: "", unit: "" }
        ],
        unitId: "",
    });

    const [categories] = useState(DUMMY_CATEGORIES);
    const [units] = useState(DUMMY_UNITS);
    const [allParameters] = useState(DUMMY_PARAMETERS);
    const [chargeCats] = useState(DUMMY_CHARGE_CATEGORIES);
    const [allCharges] = useState(DUMMY_CHARGES);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (test) {
                setForm({
                    ...test,
                    parameters: Array.isArray(test.parameters) ? test.parameters : []
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
                    method: "",
                    reportDays: "",
                    chargeCategoryId: "",
                    chargeId: "",
                    chargeName: "",
                    tax: 0,
                    standardCharge: 0,
                    amount: 0,
                    parameters: [
                        { id: Date.now().toString(), parameterId: "", testParameterName: "", referenceRange: "", unit: "" }
                    ],
                    unitId: "",
                });
            }
        }
    }, [test, open]);

    const availableCharges = allCharges.filter(c => c.chargeCategoryId === form.chargeCategoryId);

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

    const handleParameterChange = (rowId: string, paramId: string) => {
        const selectedParam = allParameters.find(p => p.id === paramId);
        if (selectedParam) {
            setForm({
                ...form,
                parameters: form.parameters.map(p =>
                    p.id === rowId
                        ? {
                            ...p,
                            parameterId: paramId,
                            testParameterName: selectedParam.paramName,
                            referenceRange: `${selectedParam.fromRange}-${selectedParam.toRange}`,
                            unit: selectedParam.unitName || ""
                        }
                        : p
                )
            });
        }
    };

    const addParameterRow = () => {
        setForm({
            ...form,
            parameters: [...form.parameters, { id: Date.now().toString(), parameterId: "", testParameterName: "", referenceRange: "", unit: "" }]
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
        if (!form.reportDays) return toast.error("Report Days is required");
        if (!form.unitId) return toast.error("Unit is required");
        if (!form.chargeId) return toast.error("Charge is required");

        setLoading(true);
        try {
            // Simulating save - in real app this would call an API
            setTimeout(() => {
                toast.success(test ? "Test updated successfully (Dummy)" : "Test added successfully (Dummy)");
                setLoading(false);
                onSaveSuccess();
            }, 500);
        } catch (error) {
            toast.error("An error occurred while saving");
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
                                <Microscope className="text-dialog-icon" />
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
                            <label className="text-sm font-medium">Method</label>
                            <Input
                                placeholder="Method"
                                value={form.method ?? ""}
                                onChange={(e) => setForm({ ...form, method: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Report Days *</label>
                            <Input
                                type="number"
                                placeholder="Report Days"
                                value={form.reportDays ?? ""}
                                onChange={(e) => setForm({ ...form, reportDays: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Unit *</label>
                            <Select value={form.unitId ?? ""} onValueChange={(v) => setForm({ ...form, unitId: v })} disabled={loading}>
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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
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
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Tax (%)</label>
                            <Input value={form.tax ?? 0} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Standard Charge ($) *</label>
                            <Input value={form.standardCharge ?? 0} disabled className="bg-muted" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount ($) *</label>
                            <Input value={form.amount ?? 0} disabled className="bg-muted" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                placeholder="Description"
                                value={form.description ?? ""}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Test Parameters</h3>
                        {form.parameters.map((param, index) => (
                            <div key={param.id} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-4 space-y-1">
                                    <label className="text-sm font-medium">Test Parameter Name *</label>
                                    <Select
                                        value={param.parameterId ?? ""}
                                        onValueChange={(v) => handleParameterChange(param.id, v)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Parameter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allParameters.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.paramName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <label className="text-sm font-medium">Reference Range *</label>
                                    <Input value={param.referenceRange ?? ""} disabled className="bg-muted" />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <label className="text-sm font-medium">Unit *</label>
                                    <Input value={param.unit ?? ""} disabled className="bg-muted" />
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
