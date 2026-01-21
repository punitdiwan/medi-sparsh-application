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

// Dummy Data for Dropdowns
const categories = [
    { id: "cat1", name: "Blood Chemistry" },
    { id: "cat2", name: "Hematology" },
    { id: "cat3", name: "Serology" },
];

const chargeCategories = [
    { id: "cc1", name: "Pathology Charges" },
    { id: "cc2", name: "Urgent Charges" },
];

const chargeNames: Record<string, { id: string, name: string, tax: number, standardCharge: number }[]> = {
    cc1: [
        { id: "cn1", name: "Glucose Test Charge", tax: 5, standardCharge: 200 },
        { id: "cn2", name: "FBC Charge", tax: 0, standardCharge: 500 },
    ],
    cc2: [
        { id: "cn3", name: "Emergency Glucose Charge", tax: 10, standardCharge: 300 },
    ],
};

const testParameters = [
    { id: "param1", name: "Blood Glucose", range: "70-110", unit: "mg/dL" },
    { id: "param2", name: "Hemoglobin", range: "13.5-17.5", unit: "g/dL" },
    { id: "param3", name: "WBC Count", range: "4000-11000", unit: "/uL" },
];

export type ParameterRow = {
    id: string;
    parameterId: string;
    testParameterName: string;
    referenceRange: string;
    unit: string;
};

export type PathologyTest = {
    id: string;
    testName: string;
    shortName: string;
    testType: string;
    categoryId: string;
    categoryName?: string;
    subCategory: string;
    method: string;
    reportDays: number | string;
    chargeCategoryId: string;
    chargeNameId: string;
    tax: number;
    standardCharge: number;
    amount: number;
    parameters: ParameterRow[];
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    test?: PathologyTest;
    onSave: (data: PathologyTest) => void;
};

export default function PathologyTestModal({
    open,
    onOpenChange,
    test,
    onSave,
}: Props) {
    const [form, setForm] = useState<PathologyTest>({
        id: "",
        testName: "",
        shortName: "",
        testType: "",
        categoryId: "",
        subCategory: "",
        method: "",
        reportDays: "",
        chargeCategoryId: "",
        chargeNameId: "",
        tax: 0,
        standardCharge: 0,
        amount: 0,
        parameters: [
            { id: Date.now().toString(), parameterId: "", testParameterName: "", referenceRange: "", unit: "" }
        ],
    });

    useEffect(() => {
        if (open) {
            if (test) {
                setForm(test);
            } else {
                setForm({
                    id: "",
                    testName: "",
                    shortName: "",
                    testType: "",
                    categoryId: "",
                    subCategory: "",
                    method: "",
                    reportDays: "",
                    chargeCategoryId: "",
                    chargeNameId: "",
                    tax: 0,
                    standardCharge: 0,
                    amount: 0,
                    parameters: [
                        { id: Date.now().toString(), parameterId: "", testParameterName: "", referenceRange: "", unit: "" }
                    ],
                });
            }
        }
    }, [test, open]);

    // Handle Charge Category Change
    const handleChargeCategoryChange = (val: string) => {
        setForm({
            ...form,
            chargeCategoryId: val,
            chargeNameId: "",
            tax: 0,
            standardCharge: 0,
            amount: 0,
        });
    };

    // Handle Charge Name Change
    const handleChargeNameChange = (val: string) => {
        const selectedCharge = chargeNames[form.chargeCategoryId]?.find(c => c.id === val);
        if (selectedCharge) {
            const taxAmount = (selectedCharge.standardCharge * selectedCharge.tax) / 100;
            const totalAmount = selectedCharge.standardCharge + taxAmount;
            setForm({
                ...form,
                chargeNameId: val,
                tax: selectedCharge.tax,
                standardCharge: selectedCharge.standardCharge,
                amount: totalAmount,
            });
        }
    };

    // Handle Parameter Row Change
    const handleParameterChange = (rowId: string, paramId: string) => {
        const selectedParam = testParameters.find(p => p.id === paramId);
        if (selectedParam) {
            setForm({
                ...form,
                parameters: form.parameters.map(p =>
                    p.id === rowId
                        ? { ...p, parameterId: paramId, testParameterName: selectedParam.name, referenceRange: selectedParam.range, unit: selectedParam.unit }
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

    const handleSubmit = () => {
        if (!form.testName) return toast.error("Test Name is required");
        if (!form.shortName) return toast.error("Short Name is required");
        if (!form.categoryId) return toast.error("Category is required");
        if (!form.reportDays) return toast.error("Report Days is required");
        if (!form.chargeCategoryId) return toast.error("Charge Category is required");
        if (!form.chargeNameId) return toast.error("Charge Name is required");

        const categoryName = categories.find(c => c.id === form.categoryId)?.name;
        onSave({ ...form, categoryName });
        onOpenChange(false);
        toast.success(test ? "Test updated successfully" : "Test added successfully");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        {/* Left: Icon + Title */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center rounded-lg">
                                <FlaskConical className="text-dialog-icon" />
                            </div>
                            <DialogTitle>
                                {test ? "Edit Pathology Test" : "Add Pathology Test"}
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
                                value={form.testName}
                                onChange={(e) => setForm({ ...form, testName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Short Name *</label>
                            <Input
                                placeholder="Short Name"
                                value={form.shortName}
                                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Test Type</label>
                            <Input
                                placeholder="Test Type"
                                value={form.testType}
                                onChange={(e) => setForm({ ...form, testType: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Category Name *</label>
                            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
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
                                value={form.subCategory}
                                onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Method</label>
                            <Input
                                placeholder="Method"
                                value={form.method}
                                onChange={(e) => setForm({ ...form, method: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Report Days *</label>
                            <Input
                                type="number"
                                placeholder="Report Days"
                                value={form.reportDays}
                                onChange={(e) => setForm({ ...form, reportDays: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Charge Category *</label>
                            <Select value={form.chargeCategoryId} onValueChange={handleChargeCategoryChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {chargeCategories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Charge Name *</label>
                            <Select
                                value={form.chargeNameId}
                                onValueChange={handleChargeNameChange}
                                disabled={!form.chargeCategoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Charge" />
                                </SelectTrigger>
                                <SelectContent>
                                    {form.chargeCategoryId && chargeNames[form.chargeCategoryId]?.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Tax (%)</label>
                            <Input value={form.tax} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Standard Charge ($) *</label>
                            <Input value={form.standardCharge} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount ($) *</label>
                            <Input value={form.amount} disabled className="bg-muted" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Test Parameters</h3>
                        {form.parameters.map((param, index) => (
                            <div key={param.id} className="grid grid-cols-12 gap-3 items-end">
                                <div className="col-span-4 space-y-1">
                                    <label className="text-sm font-medium">Test Parameter Name *</label>
                                    <Select
                                        value={param.parameterId}
                                        onValueChange={(v) => handleParameterChange(param.id, v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Parameter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {testParameters.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4 space-y-1">
                                    <label className="text-sm font-medium">Reference Range *</label>
                                    <Input value={param.referenceRange} disabled className="bg-muted" />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <label className="text-sm font-medium">Unit *</label>
                                    <Input value={param.unit} disabled className="bg-muted" />
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeParameterRow(param.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Parameter
                        </Button>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted sticky bottom-0 z-10">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}
                        className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90">
                        {test ? "Update Test" : "Save Test"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
