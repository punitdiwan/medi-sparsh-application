"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IPDOperationDialog } from "./operationModel";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ---------------- Types ---------------- */

export type Operation = {
  id: string;

  categoryId: number;
  category: string;

  name: string;
  date: string;

  consultant: string;
  assistant1?: string;
  assistant2?: string;

  anesthetist?: string;
  anesthesiaType?: string;

  technician?: string;
  otAssistant?: string;

  remark?: string;
  result?: string;
};


export default function IPdOperationsPage() {
  const [open, setOpen] = useState(false);
  const [editingOperation, setEditingOperation] =
    useState<Operation | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);

  /* ----- Add / Edit ----- */
  const handleSubmit = (data: Operation) => {
    if (editingOperation) {
      setOperations((prev) =>
        prev.map((op) =>
          op.id === editingOperation.id ? { ...data, id: op.id } : op
        )
      );
    } else {
      setOperations((prev) => [
        ...prev,
        { ...data, id: crypto.randomUUID() },
      ]);
    }

    setOpen(false);
    setEditingOperation(null);
  };

  /* ----- Delete ----- */
  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this operation?")) return;
    setOperations((prev) => prev.filter((op) => op.id !== id));
  };

  return (
    <div className=" space-y-6">
    <Card className="px-6">

      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Operations</CardTitle>
      </CardHeader>
        <Separator/>
        <div className="flex justify-between items-center">
            <Input placeholder="Search operation..." className="max-w-sm" />
            <Button onClick={() => setOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Operation
            </Button>
        </div>
        <Separator/>
        <CardContent>
            <div className="rounded-xl border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Reference No</TableHead>
                    <TableHead>Operation Date</TableHead>
                    <TableHead>Operation Name</TableHead>
                    <TableHead>Operation Category</TableHead>
                    <TableHead>OT Technician</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {operations.length === 0 && (
                    <TableRow>
                        <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                        >
                        No operations added
                        </TableCell>
                    </TableRow>
                    )}

                    {operations.map((op, index) => (
                    <TableRow key={op.id}>
                        <TableCell>OP-{index + 1}</TableCell>
                        <TableCell>{op.date}</TableCell>
                        <TableCell>{op.name}</TableCell>
                        <TableCell>{op.category}</TableCell>
                        <TableCell>{op.technician || "—"}</TableCell>

                        <TableCell className="text-right">
                        <TooltipProvider>
                            <div className="flex justify-end gap-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                <Eye
                                    className="h-4 w-4 text-blue-600 cursor-pointer"
                                    onClick={() =>
                                    alert("View mode coming soon 👀")
                                    }
                                />
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                <Pencil
                                    className="h-4 w-4 text-green-600 cursor-pointer"
                                    onClick={() => {
                                    setEditingOperation(op);
                                    setOpen(true);
                                    }}
                                />
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                <Trash2
                                    className="h-4 w-4 text-red-600 cursor-pointer"
                                    onClick={() => handleDelete(op.id)}
                                />
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                            </div>
                        </TooltipProvider>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
      </CardContent>
    </Card>
      <IPDOperationDialog
        open={open}
        defaultValues={editingOperation || undefined}
        onClose={() => {
            setOpen(false);
            setEditingOperation(null);
        }}
        onSubmit={handleSubmit}
      />

    </div>
  );
}
