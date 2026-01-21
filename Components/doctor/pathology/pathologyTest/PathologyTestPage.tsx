"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Plus, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import PathologyTestModal, { PathologyTest } from "./PathologyTestModal";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";


// Dummy Data
const dummyTests: PathologyTest[] = [
    {
        id: "1",
        testName: "Glucose Fasting",
        shortName: "GLU-F",
        testType: "Blood",
        categoryId: "cat1",
        categoryName: "Blood Chemistry",
        subCategory: "Sugar",
        method: "Enzymatic",
        reportDays: 1,
        chargeCategoryId: "cc1",
        chargeNameId: "cn1",
        tax: 5,
        standardCharge: 200,
        amount: 210,
        parameters: [
            { id: "p1", parameterId: "param1", testParameterName: "Blood Glucose", referenceRange: "70-110", unit: "mg/dL" }
        ]
    },
    {
        id: "2",
        testName: "Full Blood Count",
        shortName: "FBC",
        testType: "Blood",
        categoryId: "cat2",
        categoryName: "Hematology",
        subCategory: "General",
        method: "Automated",
        reportDays: 1,
        chargeCategoryId: "cc2",
        chargeNameId: "cn2",
        tax: 0,
        standardCharge: 500,
        amount: 500,
        parameters: [
            { id: "p2", parameterId: "param2", testParameterName: "Hemoglobin", referenceRange: "13.5-17.5", unit: "g/dL" },
            { id: "p3", parameterId: "param3", testParameterName: "WBC Count", referenceRange: "4000-11000", unit: "/uL" }
        ]
    }
];

export default function PathologyTestPage() {
    const [tests, setTests] = useState<PathologyTest[]>(dummyTests);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState<PathologyTest | undefined>(undefined);
    const ability = useAbility();
    const filteredTests = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return tests;
        return tests.filter((t) =>
            t.testName.toLowerCase().includes(query) ||
            t.shortName.toLowerCase().includes(query) ||
            t.categoryName?.toLowerCase().includes(query)
        );
    }, [search, tests]);

    const columns: ColumnDef<PathologyTest>[] = [
        {
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        { accessorKey: "testName", header: "Test Name" },
        { accessorKey: "shortName", header: "Short Name" },
        { accessorKey: "testType", header: "Test Type" },
        { accessorKey: "categoryName", header: "Category" },
        { accessorKey: "subCategory", header: "Sub Category" },
        { accessorKey: "method", header: "Method" },
        { accessorKey: "reportDays", header: "Report Days" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Can I="update" a="PathologyTest" ability={ability}>
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
                    <Can I="delete" a="PathologyTest" ability={ability}>
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
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setSelectedTest(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (test: PathologyTest) => {
        setSelectedTest(test);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setTests(tests.filter((t) => t.id !== id));
    };

    const handleSave = (test: PathologyTest) => {
        if (selectedTest) {
            setTests(tests.map((t) => (t.id === test.id ? test : t)));
        } else {
            setTests([...tests, { ...test, id: Math.random().toString(36).substr(2, 9) }]);
        }
    };

    return (
        <div className="p-6">
            <Card className="bg-Module-header text-white shadow-lg mb-6 px-6 py-5">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Pathology Tests</h1>
                    <p className="text-sm text-white/80 max-w-2xl">
                        Manage pathology tests, categories, charges, and parameters.
                    </p>
                </div>
            </Card>

            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search test, short name, category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Can I="create" a="PathologyTest" ability={ability}>
                    <Button variant="default" onClick={handleAdd}>
                        <Plus size={16} /> Add Test
                    </Button>
                </Can>
            </div>

            {filteredTests.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-card/60 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-foreground">No Tests Found</h3>
                    <p className="text-muted-foreground text-sm">No pathology tests match your search.</p>
                </div>
            ) : (
                <Table data={filteredTests} columns={columns} />
            )}

            <PathologyTestModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                test={selectedTest}
                onSave={handleSave}
            />
        </div>
    );
}
