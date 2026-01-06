"use client";

import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createMedicine } from "@/lib/actions/medicines";
import { getMedicineCompanies } from "@/lib/actions/medicineCompanies";
import { getMedicineUnits } from "@/lib/actions/medicineUnits";
import { Pill } from "lucide-react";

interface MedicineData {
    id: string;
    name: string;
    categoryId: string;
}

interface MedicineCategory {
    id: string;
    name: string;
}

interface MedicineCompany {
    id: string;
    name: string;
}

interface MedicineUnit {
    id: string;
    name: string;
}

interface MedicineComboboxProps {
    medicines: MedicineData[];
    categories: MedicineCategory[];
    selectedCategory: string;
    value: string;
    onChange: (value: string) => void;
    onMedicineAdded?: () => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function MedicineCombobox({
    medicines,
    categories,
    selectedCategory,
    value,
    onChange,
    onMedicineAdded,
    disabled = false,
    placeholder = "Select medicine",
}: MedicineComboboxProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [companies, setCompanies] = useState<MedicineCompany[]>([]);
    const [units, setUnits] = useState<MedicineUnit[]>([]);
    const [loading, setLoading] = useState(false);

    const [newMedicineForm, setNewMedicineForm] = useState({
        name: "",
        categoryId: "",
        companyName: "",
        unitId: "",
        notes: "",
    });

    // Fetch companies and units when dialog opens
    useEffect(() => {
        if (showAddDialog) {
            const fetchData = async () => {
                const [companiesResult, unitsResult] = await Promise.all([
                    getMedicineCompanies(),
                    getMedicineUnits(),
                ]);

                if (companiesResult.data) {
                    setCompanies(companiesResult.data);
                }
                if (unitsResult.data) {
                    setUnits(unitsResult.data);
                }
            };

            fetchData();
        }
    }, [showAddDialog]);

    // Filter medicines based on search query
    const filteredMedicines = searchQuery
        ? medicines.filter((med) =>
            med.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : medicines.slice(0, 5); // Show only 5 when no search

    const handleOpenAddDialog = () => {
        setNewMedicineForm({
            name: searchQuery,
            categoryId: selectedCategory,
            companyName: "",
            unitId: "",
            notes: "",
        });
        setShowAddDialog(true);
        setOpen(false);
    };

    const handleCreateMedicine = async () => {
        if (!newMedicineForm.name.trim()) {
            toast.error("Medicine name is required");
            return;
        }
        if (!newMedicineForm.categoryId) {
            toast.error("Category is required");
            return;
        }
        if (!newMedicineForm.companyName) {
            toast.error("Company is required");
            return;
        }
        if (!newMedicineForm.unitId) {
            toast.error("Unit is required");
            return;
        }

        try {
            setLoading(true);
            const result = await createMedicine({
                name: newMedicineForm.name.trim(),
                categoryId: newMedicineForm.categoryId,
                companyName: newMedicineForm.companyName,
                unitId: newMedicineForm.unitId,
                groupId: 'g1',
                notes: newMedicineForm.notes || null,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success("Medicine added successfully!");
            onChange(newMedicineForm.name.trim());
            setShowAddDialog(false);

            // Notify parent to refresh medicine list
            if (onMedicineAdded) {
                onMedicineAdded();
            }
        } catch (error) {
            console.error("Error creating medicine:", error);
            toast.error("Failed to create medicine");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="w-full justify-between"
                    >
                        {value || <span className="text-muted-foreground">{placeholder}</span>}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search medicine..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                <div className="flex flex-col items-center gap-2 py-6">
                                    <p className="text-sm text-muted-foreground">
                                        No medicine found.
                                    </p>
                                    {selectedCategory && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleOpenAddDialog}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add new medicine
                                        </Button>
                                    )}
                                </div>
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredMedicines.map((medicine) => (
                                    <CommandItem
                                        key={medicine.id}
                                        value={medicine.name}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue === value ? "" : currentValue);
                                            setOpen(false);
                                            setSearchQuery("");
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === medicine.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {medicine.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            {!searchQuery && medicines.length > 5 && (
                                <div className="border-t p-2 text-center">
                                    <p className="text-xs text-muted-foreground">
                                        Type to search {medicines.length - 5} more medicines
                                    </p>
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Add New Medicine Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-lg border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
                    <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center rounded-lg ">
                                <Pill className="bg-dialog-header text-dialog-icon" />
                            </div>
                            <div className="flex flex-col text-left">
                                <DialogTitle>Add New Medicine</DialogTitle>
                                <DialogDescription className="text-dialog-muted text-xs">
                                    Create a new medicine entry for the prescription.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Medicine Name *</label>
                                <Input
                                    id="medicine-name"
                                    value={newMedicineForm.name}
                                    onChange={(e) =>
                                        setNewMedicineForm((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter medicine name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Category *</label>
                                <Select
                                    value={newMedicineForm.categoryId}
                                    onValueChange={(value) =>
                                        setNewMedicineForm((prev) => ({
                                            ...prev,
                                            categoryId: value,
                                        }))
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Company *</label>
                                <Select
                                    value={newMedicineForm.companyName}
                                    onValueChange={(value) =>
                                        setNewMedicineForm((prev) => ({
                                            ...prev,
                                            companyName: value,
                                        }))
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger id="company">
                                        <SelectValue placeholder="Select company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company) => (
                                            <SelectItem key={company.id} value={company.id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm mb-1 block">Unit *</label>
                                <Select
                                    value={newMedicineForm.unitId}
                                    onValueChange={(value) =>
                                        setNewMedicineForm((prev) => ({
                                            ...prev,
                                            unitId: value,
                                        }))
                                    }
                                    disabled={loading}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm mb-1 block">Notes</label>
                            <Input
                                id="notes"
                                value={newMedicineForm.notes}
                                onChange={(e) =>
                                    setNewMedicineForm((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                placeholder="Optional notes"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                            disabled={loading}
                            className="text-dialog-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateMedicine}
                            disabled={loading}
                            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
                        >
                            {loading ? "Adding..." : "Add Medicine"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
