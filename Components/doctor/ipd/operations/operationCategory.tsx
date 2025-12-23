"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Layers,
  Tag,
  Inbox,
} from "lucide-react";

import { OperationCategoryDialog } from "./operationCategoryDialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
}

export default function OperationCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "General Surgery" },
    { id: 2, name: "Orthopedic" },
  ]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleAddOrEdit = (name: string) => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id ? { ...c, name } : c
        )
      );
    } else {
      setCategories((prev) => [
        ...prev,
        { id: Date.now(), name },
      ]);
    }
    setEditingCategory(null);
  };

  const handleDelete = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
    <Card className="border-muted/40 shadow-sm">
        <CardHeader >
            <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
            </div>

            <div>
                <CardTitle className="text-2xl font-semibold">
                Operation Category List
                </CardTitle>
                <CardDescription className="mt-1">
                Organize and manage operation categories used across hospital services.
                </CardDescription>
            </div>
            </div>
        </CardHeader>

        <Separator />

        <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background"
            />
            </div>

            <Button className="flex gap-2 bg-brand-gradient text-white hover:opacity-90"
                onClick={() => {setEditingCategory(null);setDialogOpen(true);}}>
                <Plus className="h-4 w-4" />
                Add Category
            </Button>
        </div>

        <Separator />

        <CardContent>
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead>Category Name</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {filteredCategories.map((category) => (
                <TableRow
                    key={category.id}
                    className="hover:bg-muted/40 transition-colors"
                >
                    <TableCell className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {category.name}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="hover:border-primary/50"
                        onClick={() => {
                        setEditingCategory(category);
                        setDialogOpen(true);
                        }}
                    >
                        <Pencil className="h-4 w-4 text-primary" />
                    </Button>

                    <Button
                        size="icon"
                        variant="destructive"
                        className="hover:bg-destructive/90"
                        onClick={() => handleDelete(category.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>

            {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Inbox className="h-10 w-10 opacity-50" />
                <p>No categories found</p>
            </div>
            )}
        </CardContent>
        </Card>
        <OperationCategoryDialog
            open={dialogOpen}
            onClose={() => {
                setDialogOpen(false);
                setEditingCategory(null);
            }}
            onSubmit={handleAddOrEdit}
            defaultValue={editingCategory?.name}
            />
    </>
  );
}
