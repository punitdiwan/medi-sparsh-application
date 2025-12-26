"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Eye, Pencil, Trash2, Printer, Users2 } from "lucide-react";
import { IPDOperationDialog } from "./operationModel";

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
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);

  /* ---------------- Search Filter ---------------- */
  const filtered = useMemo(() => {
    if (!search) return operations;
    return operations.filter(
      (op) =>
        op.name.toLowerCase().includes(search.toLowerCase()) ||
        op.category.toLowerCase().includes(search.toLowerCase()) ||
        op.technician?.toLowerCase().includes(search.toLowerCase()) ||
        op.date.includes(search)
    );
  }, [operations, search]);

  /* ---------------- Add / Edit ---------------- */
  const handleSubmit = (data: Operation) => {
    if (editingOperation) {
      setOperations((prev) =>
        prev.map((op) => (op.id === editingOperation.id ? { ...data, id: op.id } : op))
      );
      setEditingOperation(null);
    } else {
      setOperations((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
    }
    setModalOpen(false);
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this operation?")) {
      setOperations((prev) => prev.filter((op) => op.id !== id));
    }
  };

  /* ---------------- Print ---------------- */
  const handlePrint = (op: Operation) => {
    alert(`Print operation: ${op.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER / SEARCH */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <Users2 className="bg-dialog-header text-dialog-icon" />
            Operations
          </CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input
                placeholder="Search by name / category / technician / date"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="sm:w-72"
              />
            <Button
              onClick={() => { setModalOpen(true); setEditingOperation(null); }}
              className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" /> Add Operation
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* OPERATIONS TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Ref No</TableHead>
                <TableHead className="text-dialog-icon">Date</TableHead>
                <TableHead className="text-dialog-icon">Operation Name</TableHead>
                <TableHead className="text-dialog-icon">Category</TableHead>
                <TableHead className="text-dialog-icon">OT Technician</TableHead>
                <TableHead className="text-center text-dialog-icon">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                filtered.map((op, index) => (
                  <TableRow key={op.id}>
                    <TableCell className="font-medium text-gray-800 dark:text-white">OP-{index + 1}</TableCell>
                    <TableCell className="text-dialog-muted">{op.date}</TableCell>
                    <TableCell className="text-dialog-muted">{op.name}</TableCell>
                    <TableCell className="text-dialog-muted">{op.category}</TableCell>
                    <TableCell className="text-dialog-muted">{op.technician || "—"}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex gap-2 justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handlePrint(op)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => { setEditingOperation(op); setModalOpen(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="destructive" onClick={() => handleDelete(op.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-400">No operations found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT OPERATION DIALOG */}
      {modalOpen && (
        <IPDOperationDialog
          open={modalOpen}
          defaultValues={editingOperation || undefined}
          onClose={() => { setModalOpen(false); setEditingOperation(null); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
