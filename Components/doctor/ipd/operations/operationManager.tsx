"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ClipboardList,
  Stethoscope,
  Inbox,
} from "lucide-react";

import { OperationDialog } from "./operationDialogModel";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: number;
  name: string;
}

interface Operation {
  id: number;
  name: string;
  categoryId: number;
}

export default function OperationManager() {
  const categories: Category[] = [
    { id: 1, name: "General Surgery" },
    { id: 2, name: "Orthopedic" },
  ];

  const [operations, setOperations] = useState<Operation[]>([
    { id: 1, name: "Appendectomy", categoryId: 1 },
    { id: 2, name: "Knee Replacement", categoryId: 2 },
  ]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Operation | null>(null);

  const filteredOperations = useMemo(() => {
    return operations.filter((op) =>
      op.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [operations, search]);

  const handleSave = (data: { name: string; categoryId: number }) => {
    if (editing) {
      setOperations((prev) =>
        prev.map((op) =>
          op.id === editing.id ? { ...op, ...data } : op
        )
      );
    } else {
      setOperations((prev) => [
        ...prev,
        { id: Date.now(), ...data },
      ]);
    }
    setEditing(null);
  };

  const getCategoryName = (id: number) =>
    categories.find((c) => c.id === id)?.name || "-";

  return (
   <Card className="border-muted/40 shadow-sm">
        <CardHeader>
            <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
            </div>

            <div>
                <CardTitle className="text-2xl font-semibold">
                Operation List
                </CardTitle>
                <CardDescription className="mt-1 text-muted-foreground">
                Manage all hospital operations in one place. Add, edit, search, and
                organize operations by category for quick and efficient access.
                </CardDescription>
            </div>
            </div>
        </CardHeader>

        <Separator />

        <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between ">
            <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search operation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-muted/30 focus:bg-background transition"
            />
            </div>

            <Button
                className="flex gap-2 bg-brand-gradient text-white hover:opacity-90"
                onClick={() => {
                    setEditing(null);  
                    setDialogOpen(true);
                }}
                >
                <Plus className="h-4 w-4" />
                Add Operation
            </Button>

        </div>

        <Separator />

        <CardContent>
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead>Operation Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {filteredOperations.length === 0 ? (
                <TableRow>
                    <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                    >
                    <div className="flex flex-col items-center gap-2">
                        <Inbox className="h-8 w-8 opacity-50" />
                        No operations found
                    </div>
                    </TableCell>
                </TableRow>
                ) : (
                filteredOperations.map((op) => (
                    <TableRow
                    key={op.id}
                    className="hover:bg-muted/40 transition-colors"
                    >
                    <TableCell className="font-medium flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        {op.name}
                    </TableCell>

                    <TableCell>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                        {getCategoryName(op.categoryId)}
                        </span>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                        <Button
                        size="icon"
                        variant="outline"
                        className="hover:border-primary/50"
                        onClick={() => {
                            setEditing(op);
                            setDialogOpen(true);
                        }}
                        >
                        <Pencil className="h-4 w-4 text-primary" />
                        </Button>

                        <Button
                        size="icon"
                        variant="destructive"
                        className="hover:bg-destructive/90"
                        onClick={() =>
                            setOperations((prev) =>
                            prev.filter((o) => o.id !== op.id)
                            )
                        }
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
        </CardContent>

        <OperationDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleSave}
            categories={categories}
            defaultData={
            editing
                ? { name: editing.name, categoryId: editing.categoryId }
                : undefined
            }
        />
    </Card>

  );
}
