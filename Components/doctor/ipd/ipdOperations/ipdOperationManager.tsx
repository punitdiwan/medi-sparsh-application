"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PlusCircle, Eye, Pencil, Trash2, Printer, Users2 } from "lucide-react";
import { IPDOperationDialog } from "./operationModel";
import { useParams } from "next/navigation";
import { getIPDOperations, deleteIPDOperation, restoreIPDOperation, permanentlyDeleteIPDOperation } from "@/lib/actions/operations";
import { format } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RotateCcw, Trash,AlignJustify } from "lucide-react";
import { DeleteConfirmationDialog } from "@/Components/doctor/medicine/deleteConfirmationDialog";
import { ShowOperationDialog } from "./ShowOperationDialog";

export type Operation = {
  id: string;
  operationId: string;
  operationName: string;
  categoryName: string;
  operationDate: Date;
  operationTime: Date;
  doctors: any;
  anaesthetist: any;
  anaesthetiaType: string;
  operationDetails: string;
  supportStaff: any;
  categoryId: string;
  isDeleted: boolean;
};

export default function IPdOperationsPage() {
  const params = useParams();
  const ipdAdmissionId = params.id as string;
  const [operations, setOperations] = useState<Operation[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<{ id: string, permanent: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModalOpen, setShowModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  const fetchOperations = async () => {
    const res = await getIPDOperations(ipdAdmissionId, showDeleted);
    if (res.data) {
      setOperations(res.data as any);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [ipdAdmissionId, showDeleted]);

  /* ---------------- Search Filter ---------------- */
  const filtered = useMemo(() => {
    if (!search) return operations;
    return operations.filter(
      (op) =>
        op.operationName.toLowerCase().includes(search.toLowerCase()) ||
        op.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        op.supportStaff?.technician?.toLowerCase().includes(search.toLowerCase()) ||
        format(new Date(op.operationDate), "yyyy-MM-dd").includes(search)
    );
  }, [operations, search]);

  /* ---------------- Add / Edit ---------------- */
  const handleSubmit = () => {
    fetchOperations();
    setModalOpen(false);
    setEditingOperation(null);
  };

  /* ---------------- Delete ---------------- */
  const handleDeleteClick = (id: string, permanent: boolean = false) => {
    setOperationToDelete({ id, permanent });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!operationToDelete) return;
    setIsDeleting(true);
    try {
      const res = operationToDelete.permanent
        ? await permanentlyDeleteIPDOperation(operationToDelete.id, ipdAdmissionId)
        : await deleteIPDOperation(operationToDelete.id, ipdAdmissionId);

      if (res.success) {
        toast.success(operationToDelete.permanent ? "Operation permanently deleted" : "Operation deleted successfully");
        fetchOperations();
      } else {
        toast.error(res.error || "Failed to delete operation");
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setOperationToDelete(null);
    }
  };

  /* ---------------- Restore ---------------- */
  const handleRestore = async (id: string) => {
    const res = await restoreIPDOperation(id, ipdAdmissionId);
    if (res.success) {
      toast.success("Operation restored successfully");
      fetchOperations();
    } else {
      toast.error(res.error || "Failed to restore operation");
    }
  };

  /* ---------------- show opdetails ---------------- */
  const handleShow = (op: Operation) => {
    setSelectedOperation(op);
    setShowModalOpen(true);
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
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border border-dialog">
              <Switch
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="show-deleted" className="text-sm font-medium text-dialog cursor-pointer">
                Show Deleted
              </Label>
            </div>
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
                  <TableRow key={op.id} className="odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors ">
                    <TableCell className="font-medium text-gray-800 dark:text-white">OP-{index + 1}</TableCell>
                    <TableCell className="text-dialog-muted">{format(new Date(op.operationDate), "dd-MM-yyyy")}</TableCell>
                    <TableCell className="text-dialog-muted">{op.operationName}</TableCell>
                    <TableCell className="text-dialog-muted">{op.categoryName}</TableCell>
                    <TableCell className="text-dialog-muted">{op.supportStaff?.technician || "—"}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <div className="flex gap-2 justify-center">
                          {!op.isDeleted ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="outline" onClick={() => handleShow(op)}>
                                    <AlignJustify className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Show Details</TooltipContent>
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
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(op.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleRestore(op.id)}>
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Restore</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(op.id, true)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Permanent Delete</TooltipContent>
                              </Tooltip>
                            </>
                          )}
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
          ipdAdmissionId={ipdAdmissionId}
          defaultValues={editingOperation || undefined}
          onClose={() => { setModalOpen(false); setEditingOperation(null); }}
          onSubmit={handleSubmit}
        />
      )}
      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={operationToDelete?.permanent ? "Permanent Delete" : "Delete Operation"}
        description={operationToDelete?.permanent
          ? "Are you sure you want to permanently delete this operation? This action cannot be undone."
          : "Are you sure you want to delete this operation? You can restore it later from the deleted list."}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
      <ShowOperationDialog
        open={showModalOpen}
        onClose={() => {
          setShowModalOpen(false);
          setSelectedOperation(null);
        }}
        operation={selectedOperation}
      />
    </div>
  );
}
