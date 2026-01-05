"use client";

import { useMemo, useState, useEffect } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Layers,
  Tag,
  Inbox,
  RotateCcw,
} from "lucide-react";

import { OperationCategoryDialog } from "./operationCategoryDialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getOperationCategories,
  createOperationCategory,
  updateOperationCategory,
  deleteOperationCategory,
  restoreOperationCategory,
  getAllOperationCategories,
} from "@/lib/actions/operationCategories";
import { getOperationCountByCategory } from "@/lib/actions/operations";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  hospitalId: string;
  isDeleted: boolean | null;
  createdAt: Date;
}

export default function OperationCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [operationCounts, setOperationCounts] = useState<Record<string, number>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [showDeleted]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setCountsLoaded(false);
      const result = showDeleted
        ? await getAllOperationCategories()
        : await getOperationCategories();
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCategories(result.data);
        
        // Fetch operation counts for each category (only for non-deleted categories)
        if (!showDeleted) {
          const counts: Record<string, number> = {};
          for (const category of result.data) {
            const countResult = await getOperationCountByCategory(category.id);
            if (countResult.data !== undefined) {
              counts[category.id] = Number(countResult.data);
            }
          }
          setOperationCounts(counts);
          setCountsLoaded(true);
        } else {
          // Clear counts when showing deleted
          setOperationCounts({});
          setCountsLoaded(true);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch operation categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name.toLowerCase().includes(search.toLowerCase());
      if (showDeleted) {
        return matchesSearch && cat.isDeleted;
      }
      return matchesSearch && !cat.isDeleted;
    });
  }, [categories, search, showDeleted]);

  const handleAddOrEdit = async (name: string) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        const result = await updateOperationCategory(editingCategory.id, { name });
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? result.data : c))
          );
          toast.success("Operation category updated successfully");
          setDialogOpen(false);
          setEditingCategory(null);
        }
      } else {
        const result = await createOperationCategory({ name });
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setCategories((prev) => [...prev, result.data]);
          toast.success("Operation category created successfully");
          setDialogOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save operation category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const result = await deleteOperationCategory(categoryToDelete.id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryToDelete.id ? result.data : c))
        );
        toast.success("Operation category deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete operation category");
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const result = await restoreOperationCategory(id);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? result.data : c))
        );
        toast.success("Operation category restored successfully");
      }
    } catch (error) {
      console.error("Error restoring category:", error);
      toast.error("Failed to restore operation category");
    }
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
            <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-background"
                    disabled={loading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="deleted"
                  checked={showDeleted}
                  onCheckedChange={setShowDeleted}
                  disabled={loading}
                />
                <Label htmlFor="deleted">
                  {"Show Deleted"}
                </Label>
              </div>

            </div>

            <Button className="flex gap-2 bg-brand-gradient text-white hover:opacity-90"
                onClick={() => {setEditingCategory(null);setDialogOpen(true);}}
                disabled={loading || showDeleted}>
                <Plus className="h-4 w-4" />
                Add Category
            </Button>
        </div>

        <Separator />

        <CardContent>
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>Loading categories...</p>
              </div>
            ) : (
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
                    className={`hover:bg-muted/40 transition-colors ${category.isDeleted ? "opacity-60" : ""}`}
                >
                    <TableCell className="font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {category.name}
                    {category.isDeleted && (
                      <span className="ml-2 text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                        Deleted
                      </span>
                    )}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                    {!category.isDeleted ? (
                      <>
                        <Button
                            size="icon"
                            variant="outline"
                            className="hover:border-primary/50"
                            onClick={() => {
                            setEditingCategory(category);
                            setDialogOpen(true);
                            }}
                            disabled={isSubmitting}
                        >
                            <Pencil className="h-4 w-4 text-primary" />
                        </Button>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                  size="icon"
                                  variant="destructive"
                                  className="hover:bg-destructive/90"
                                  onClick={() => handleDeleteClick(category)}
                                  disabled={isSubmitting || !countsLoaded || (operationCounts[category.id] || 0) > 0}
                                  title={!countsLoaded ? "Loading..." : `Count: ${operationCounts[category.id] || 0}`}
                              >
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            {!countsLoaded && (
                              <TooltipContent className="bg-muted text-foreground">
                                Loading dependency info...
                              </TooltipContent>
                            )}
                            {countsLoaded && (operationCounts[category.id] || 0) > 0 && (
                              <TooltipContent className="bg-destructive text-destructive-foreground">
                                Cannot delete: {operationCounts[category.id]} operation(s) using this category
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <Button
                          size="icon"
                          variant="outline"
                          className="hover:border-green-600 text-green-600"
                          onClick={() => handleRestore(category.id)}
                          disabled={isSubmitting}
                      >
                          <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            )}

            {!loading && filteredCategories.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Inbox className="h-10 w-10 opacity-50" />
                <p>{showDeleted ? "No deleted categories" : "No categories found"}</p>
            </div>
            )}
        </CardContent>
        </Card>

        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Operation Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold">{categoryToDelete?.name}</span>? This action can be undone from the deleted categories view.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <OperationCategoryDialog
            open={dialogOpen}
            onClose={() => {
                setDialogOpen(false);
                setEditingCategory(null);
            }}
            onSubmit={handleAddOrEdit}
            defaultValue={editingCategory?.name}
            isLoading={isSubmitting}
            />
    </>
  );
}
