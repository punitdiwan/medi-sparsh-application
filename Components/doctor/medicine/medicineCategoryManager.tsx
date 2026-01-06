"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { MedicineCategoryModal, MedicineCategory } from "./medicineCategoryModel";
import { getMedicineCategories, createMedicineCategory, updateMedicineCategory, deleteMedicineCategory } from "../../../lib/actions/medicineCategories";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

export default function CategoryManager() {
  const [categories, setCategories] = useState<MedicineCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineCategory | null>(null);

  const ability = useAbility();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await getMedicineCategories();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCategories(result.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [search, categories]);

  const handleSave = async (item: MedicineCategory) => {
    try {
      const exists = categories.some((c) => c.id === item.id);

      let result;
      if (exists) {
        result = await updateMedicineCategory(item.id, { name: item.name });
      } else {
        result = await createMedicineCategory({ name: item.name });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Category updated" : "Category added");
      fetchCategories();
      setEditing(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const result = await deleteMedicineCategory(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Medicine Category Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Organize medicines into specific categories.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Can I="create" a="medicineCategory" ability={ability}>
            <Button onClick={() => setOpen(true)}>Add Category</Button>
          </Can>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Can I="update" a="medicineCategory" ability={ability}>
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(category); setOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Can>
                      <Can I="delete" a="medicineCategory" ability={ability}>
                        <ConfirmDialog
                          title="Delete Category"
                          description="Are you sure you want to permanently delete this medicine category? This action cannot be undone."
                          onConfirm={() => handleDeleteConfirm(category.id)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          }
                        />
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <MedicineCategoryModal
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}
        category={editing ?? undefined}
        onSave={handleSave}
      />
    </Card>
  );
}
