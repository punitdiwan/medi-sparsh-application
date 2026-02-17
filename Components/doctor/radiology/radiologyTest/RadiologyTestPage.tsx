"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Plus, Trash2, Search, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import RadiologyTestModal, { RadiologyTest } from "./RadiologyTestModal";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { getRadiologyTests, deleteRadiologyTest, restoreRadiologyTest } from "@/lib/actions/radiologyTests";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";

type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

export default function RadiologyTestPage() {
    const [tests, setTests] = useState<RadiologyTest[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<RadiologyTest | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [visibleFields, setVisibleFields] = useState<string[]>([
        "testName",
        "shortName",
        "testType",
        "categoryName",
        "reportHours",
        "amount",
    ]);

    const ability = useAbility();

    const fetchTests = async () => {
        setLoading(true);
        try {
            const result = await getRadiologyTests();
            if (result.error) {
                toast.error(result.error);
            } else if (result.data) {
                setTests(result.data as any);
            }
        } catch (error) {
            toast.error("Failed to fetch radiology tests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const filteredTests = useMemo(() => {
        const query = search.toLowerCase().trim();
        let filtered = tests;

        if (!showDeleted) {
            filtered = filtered.filter(t => !t.isDeleted);
        }

        if (!query) return filtered;

        return filtered.filter((t) =>
            t.testName.toLowerCase().includes(query) ||
            t.shortName?.toLowerCase().includes(query) ||
            t.categoryName?.toLowerCase().includes(query)
        );
    }, [search, tests, showDeleted]);

    const allColumns: ColumnDef<RadiologyTest>[] = [
        {
            id: "sno",
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        { accessorKey: "testName", header: "Test Name" },
        { accessorKey: "shortName", header: "Short Name" },
        { accessorKey: "testType", header: "Test Type" },
        { accessorKey: "categoryName", header: "Category" },
        { accessorKey: "subCategoryId", header: "Sub Category" },
        {
            accessorKey: "reportHours",
            header: "Report Hours",
            cell: ({ row }) => Number(row.original.reportHours)
        },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = Number((row.original as any).amount || 0);
                const taxPercent = Number((row.original as any).taxPercent || 0);
                const total = amount + (amount * taxPercent / 100);
                return total.toFixed(2);
            }
        },
        { accessorKey: "chargeName", header: "Charge Name" },
        { accessorKey: "description", header: "Description" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {!row.original.isDeleted ? (
                        <>
                            <Can I="update" a="RadiologyTest" ability={ability}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Edit Test</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </Can>
                            <Can I="delete" a="RadiologyTest" ability={ability}>
                                <ConfirmDialog
                                    title="Delete Test"
                                    description={`Are you sure you want to delete "${row.original.testName}"?`}
                                    onConfirm={() => handleDelete(row.original.id)}
                                    trigger={
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    }
                                />
                            </Can>
                        </>
                    ) : (
                        <Can I="update" a="RadiologyTest" ability={ability}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => handleRestore(row.original.id)}>
                                            <RotateCcw className="w-4 h-4 text-green-500" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Restore Test</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </Can>
                    )}
                </div>
            ),
        },
    ];

    const columns = useMemo(() => {
        const filtered = allColumns.filter((col) => {
            if (col.id === "actions" || col.id === "sno") return true;
            const key = "accessorKey" in col ? col.accessorKey : undefined;
            return key && visibleFields.includes(key as string);
        });

        // Ensure actions column is always last if it exists
        const actionCol = allColumns.find((c) => c.id === "actions");
        const finalCols = filtered.filter(c => c.id !== "actions");
        if (actionCol) finalCols.push(actionCol);

        return finalCols;
    }, [visibleFields, allColumns]);

    const handleAdd = () => {
        setSelectedTest(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (test: RadiologyTest) => {
        setSelectedTest(test);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteRadiologyTest(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Test deleted successfully");
                fetchTests();
            }
        } catch (error) {
            toast.error("Failed to delete test");
        }
    };

    const handleRestore = async (id: string) => {
        try {
            const result = await restoreRadiologyTest(id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Test restored successfully");
                fetchTests();
            }
        } catch (error) {
            toast.error("Failed to restore test");
        }
    };

    const handleSaveSuccess = () => {
        fetchTests();
        setIsModalOpen(false);
    };

    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-6 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Radiology Tests</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Manage radiology tests, categories, charges, and parameters.
                    </p>
                </div>
            </Card>

            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search test, short name, category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-deleted"
                            checked={showDeleted}
                            onCheckedChange={setShowDeleted}
                        />
                        <Label htmlFor="show-deleted">Show Deleted</Label>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <FieldSelectorDropdown
                        columns={allColumns as TypedColumn<RadiologyTest>[]}
                        visibleFields={visibleFields}
                        onToggle={(key, checked) => {
                            setVisibleFields((prev) =>
                                checked ? [...prev, key] : prev.filter((f) => f !== key)
                            );
                        }}
                    />
                    <Can I="create" a="RadiologyTest" ability={ability}>
                        <Button variant="default" onClick={handleAdd}>
                            <Plus size={16} /> Add Test
                        </Button>
                    </Can>
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-card/60 backdrop-blur-sm">
                    <p className="text-muted-foreground text-sm">Loading tests...</p>
                </div>
            ) : filteredTests.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-card/60 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-foreground">No Tests Found</h3>
                    <p className="text-muted-foreground text-sm">No radiology tests match your search.</p>
                </div>
            ) : (
                <Table data={filteredTests} columns={columns} />
            )}

            <RadiologyTestModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                test={selectedTest}
                onSaveSuccess={handleSaveSuccess}
            />
        </div>
    );
}
