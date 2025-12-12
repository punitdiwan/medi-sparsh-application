"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { createPharmacyMedicine, updatePharmacyMedicine } from "@/lib/actions/pharmacyMedicines";

export type PharmacyMedicine = {
    id: string;
    name: string;
    categoryId: string;
    companyId: string;
    unitId: string;
    groupId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    medicine?: PharmacyMedicine;
    onSave: (data: PharmacyMedicine) => void;
    categories: Array<{ id: string; name: string }>;
    companies: Array<{ id: string; name: string }>;
    units: Array<{ id: string; name: string }>;
    groups: Array<{ id: string; name: string }>;
};

export function PharmacyMedicineModal({
    open,
    onOpenChange,
    medicine,
    onSave,
    categories,
    companies,
    units,
    groups,
}: Props) {
    const [form, setForm] = useState<PharmacyMedicine>({
        id: "",
        name: "",
        categoryId: "",
        companyId: "",
        unitId: "",
        groupId: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (medicine) {
            setForm(medicine);
        } else {
            setForm({
                id: "",
                name: "",
                categoryId: "",
                companyId: "",
                unitId: "",
                groupId: "",
            });
        }
    }, [medicine, open]);

    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error("Medicine name is required");
        if (!form.categoryId) return toast.error("Category is required");
        if (!form.companyId) return toast.error("Company is required");
        if (!form.unitId) return toast.error("Unit is required");
        if (!form.groupId) return toast.error("Group is required");

        try {
            setIsLoading(true);

            if (medicine) {
                const result = await updatePharmacyMedicine(form);

                if (result.error) toast.error(result.error);
                else {
                    toast.success("Medicine updated successfully");
                    onSave(result.data as PharmacyMedicine);
                    onOpenChange(false);
                }
            } else {
                const result = await createPharmacyMedicine(form);

                if (result.error) toast.error(result.error);
                else {
                    toast.success("Medicine created successfully");
                    onSave(result.data as PharmacyMedicine);
                    onOpenChange(false);
                }
            }
        } catch (error) {
            console.error("Error saving medicine:", error);
            toast.error("Failed to save medicine");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{medicine ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
                    <DialogDescription>
                        Manage medicine details including category, company, unit & group.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Medicine Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="flex-1"
                            disabled={isLoading}
                        />

                        {/* Category */}
                        <Select
                            value={form.categoryId}
                            onValueChange={(v) => setForm({ ...form, categoryId: v })}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full flex-1">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Group */}
                    <Select
                        value={form.groupId}
                        onValueChange={(v) => setForm({ ...form, groupId: v })}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((g) => (
                                <SelectItem key={g.id} value={g.id}>
                                    {g.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        {/* Company */}
                        <Select
                            value={form.companyId}
                            onValueChange={(v) => setForm({ ...form, companyId: v })}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full flex-1">
                                <SelectValue placeholder="Select Company" />
                            </SelectTrigger>
                            <SelectContent>
                                {companies.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Unit */}
                        <Select
                            value={form.unitId}
                            onValueChange={(v) => setForm({ ...form, unitId: v })}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full flex-1">
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
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Saving..." : medicine ? "Update" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
