"use client";

import { useMemo, useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ClipboardList,
  Stethoscope,
  Inbox,
  RotateCcw,
} from "lucide-react";

import { OperationDialog } from "./operationDialogModel";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  getOperations,
  createOperation,
  updateOperation,
  deleteOperation,
  restoreOperation,
  getAllOperations,
  getOperationCategories,
} from "@/lib/actions/operations";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ExcelUploadButton } from "@/components/ExcelUploadButton";
import ExcelUploadModal from "@/Components/HospitalExcel";

interface Category {
  id: string;
  name: string;
  hospitalId: string;
  isDeleted: boolean | null;
  createdAt: Date;
}

interface Operation {
  id: string;
  name: string;
  operationCategoryId: string;
  hospitalId: string;
  isDeleted: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function OperationManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Operation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    fetchData();
  }, [showDeleted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesResult, operationsResult] = await Promise.all([
        getOperationCategories(),
        showDeleted ? getAllOperations() : getOperations(),
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
      if (operationsResult.data) {
        setOperations(operationsResult.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredOperations = useMemo(() => {
    return operations.filter((op) => {
      const matchesSearch = op.name.toLowerCase().includes(search.toLowerCase());
      if (showDeleted) {
        return matchesSearch && op.isDeleted;
      }
      return matchesSearch && !op.isDeleted;
    });
  }, [operations, search, showDeleted]);

  const handleSave = async (data: { name: string; operationCategoryId: string }) => {
    try {
      setIsSubmitting(true);
      if (editing) {
        const result = await updateOperation(editing.id, data);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setOperations((prev) =>
            prev.map((op) => (op.id === editing.id ? result.data : op))
          );
          toast.success("Operation updated successfully");
          setDialogOpen(false);
          setEditing(null);
        }
      } else {
        const result = await createOperation(data);
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setOperations((prev) => [...prev, result.data]);
          toast.success("Operation created successfully");
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving operation:", error);
      toast.error("Failed to save operation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (operation: Operation) => {
    setOperationToDelete(operation);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!operationToDelete) return;

    try {
      const result = await deleteOperation(operationToDelete.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setOperations((prev) =>
          prev.map((op) => (op.id === operationToDelete.id ? result.data : op))
        );
        toast.success("Operation deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting operation:", error);
      toast.error("Failed to delete operation");
    } finally {
      setDeleteConfirmOpen(false);
      setOperationToDelete(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const result = await restoreOperation(id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setOperations((prev) =>
          prev.map((op) => (op.id === id ? result.data : op))
        );
        toast.success("Operation restored successfully");
      }
    } catch (error) {
      console.error("Error restoring operation:", error);
      toast.error("Failed to restore operation");
    }
  };

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || "-";

  return (
    <>
      <Card className=" border-dialog shadow-sm py-0">
        <CardHeader className="bg-Module-header p-4 rounded-t-lg text-white">
            <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ">
                <ClipboardList className="h-5 w-5" />
            </div>

            <div>
                <CardTitle className="text-2xl font-semibold">
                Operation List
                </CardTitle>
                <CardDescription className="mt-1 text-indigo-100">
                Manage all hospital operations in one place. Add, edit, search, and
                organize operations by category for quick and efficient access.
                </CardDescription>
            </div>
            </div>
        </CardHeader>

        <div className="flex flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search operation..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-muted/30 focus:bg-background transition"
                    disabled={loading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-deleted"
                  checked={showDeleted}
                  onCheckedChange={setShowDeleted}
                  disabled={loading}
                />
                <Label htmlFor="show-deleted">
                  {"Show Deleted"}
                </Label>
              </div>

            </div>
            <div className="flex gap-2">
              <Button
                  variant="default"
                  onClick={() => {
                      setEditing(null);  
                      setDialogOpen(true);
                  }}
                  disabled={loading || showDeleted}
                  >
                  <Plus className="h-4 w-4" />
                  Add Operation
              </Button>
              <ExcelUploadButton
                onClick={() => setOpen(true)}
                tooltip="Upload Operation Excel"
              />
            </div>
        </div>
        <ExcelUploadModal
          open={open}
          setOpen={setOpen}
          entity="operations"
          />
        <Separator />

        <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>Loading operations...</p>
              </div>
            ) : (
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
                        {showDeleted ? "No deleted operations" : "No operations found"}
                    </div>
                    </TableCell>
                </TableRow>
                ) : (
                filteredOperations.map((op) => (
                    <TableRow
                    key={op.id}
                    className={`hover:bg-muted/40 transition-colors ${op.isDeleted ? "opacity-60" : ""}`}
                    >
                    <TableCell className="font-medium flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        {op.name}
                        {op.isDeleted && (
                          <span className="ml-2 text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                            Deleted
                          </span>
                        )}
                    </TableCell>

                    <TableCell>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                        {getCategoryName(op.operationCategoryId)}
                        </span>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                        {!op.isDeleted ? (
                          <>
                            <Button
                            size="icon"
                            variant="outline"
                            className="hover:border-primary/50"
                            onClick={() => {
                                setEditing(op);
                                setDialogOpen(true);
                            }}
                            disabled={isSubmitting}
                            >
                            <Pencil className="h-4 w-4 text-primary" />
                            </Button>

                            <Button
                            size="icon"
                            variant="destructive"
                            className="hover:bg-destructive/90"
                            onClick={() => handleDeleteClick(op)}
                            disabled={isSubmitting}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                              size="icon"
                              variant="outline"
                              className="hover:border-green-600 text-green-600"
                              onClick={() => handleRestore(op.id)}
                              disabled={isSubmitting}
                          >
                              <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))
                )}
            </TableBody>
            </Table>
            )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Operation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {operationToDelete?.name}
              </span>
              ? This action can be undone from the deleted items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmDelete()}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OperationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSave}
        categories={categories}
        isLoading={isSubmitting}
        defaultData={
          editing
            ? { id: editing.id, name: editing.name, operationCategoryId: editing.operationCategoryId }
            : undefined
        }
      />
    </>
  );
}
