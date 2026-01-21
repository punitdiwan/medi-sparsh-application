"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import CategoryModal, { PathologyCategory } from "./CategoryModal";
import { Input } from "@/components/ui/input";
import ExcelUploadModal from "@/Components/HospitalExcel";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
const dummyCategories: PathologyCategory[] = [
    { id: "cat1", name: "Blood Chemistry" },
    { id: "cat2", name: "Hematology" },
    { id: "cat3", name: "Serology" },
];

export default function CategoryManager() {
    const [categories, setCategories] = useState<PathologyCategory[]>(dummyCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PathologyCategory | undefined>(undefined);
    const [openEx, setOpenEx] = useState(false);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );
    const columns: ColumnDef<PathologyCategory>[] = [
        {
            header: "S.No",
            cell: ({ row }) => row.index + 1,
        },
        { accessorKey: "name", header: "Category Name" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Edit Category</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <ConfirmDialog
                        title="Delete Category"
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => handleDelete(row.original.id)}
                        trigger={
                            <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        }
                    />
                </div>
            ),
        },
    ];

    const handleAdd = () => {
        setSelectedCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: PathologyCategory) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setCategories(categories.filter((c) => c.id !== id));
    };

    const handleSave = (category: PathologyCategory) => {
        if (selectedCategory) {
            setCategories(categories.map((c) => (c.id === category.id ? category : c)));
        } else {
            setCategories([...categories, category]);
        }
    };

    return (
        <>
            <Card className="p-0">
                <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
                    <CardTitle className="text-2xl font-bold">Pathology Categories</CardTitle>
                    <CardDescription className="mt-1 text-indigo-100">Add, edit and manage Pathology Categories.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                    <div className="flex justify-between items-center gap-4">
                        <Input
                            placeholder="Search pathology categor..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                        <div className="flex flex-wrap gap-4">
                            <Button onClick={() => setOpen(true)}>Add Category</Button>
                            {/* <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setOpenEx(true)}
                                            className="p-2"
                                        >
                                            <Upload className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Upload Pathology Category Excel</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider> */}
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">S.No</TableHead>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCategories.map((category, index) => (
                                        <TableRow key={category.id}>
                                            <TableCell>{index + 1}</TableCell>

                                            <TableCell className="font-medium">
                                                {category.name}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(category)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit Category</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <ConfirmDialog
                                                        title="Delete Category"
                                                        description={`Are you sure you want to delete "${category.name}"?`}
                                                        onConfirm={() => handleDelete(category.id)}
                                                        trigger={
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <ExcelUploadModal
                open={openEx}
                setOpen={setOpenEx}
                entity="symptoms"
            />

            <CategoryModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                category={selectedCategory}
                onSave={handleSave}
            />
        </>
    );
}
