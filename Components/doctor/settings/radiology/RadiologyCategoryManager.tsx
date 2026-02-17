"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import RadiologyCategoryModal from "./RadiologyCategoryModal";
import {
  getRadiologyCategories,
  deleteRadiologyCategory,
} from "@/lib/actions/radiologyCategories";
import { toast } from "sonner";

/* -------------------- TYPES -------------------- */
export type RadiologyCategory = {
  id: string;
  name: string;
  description: string | null;
};

export default function RadiologyCategoryManager() {
  const [categories, setCategories] = useState<RadiologyCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RadiologyCategory | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await getRadiologyCategories();
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- FILTER -------------------- */
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* -------------------- HANDLERS -------------------- */
  const handleAdd = () => {
    setSelectedCategory(undefined);
    setOpen(true);
  };

  const handleEdit = (category: RadiologyCategory) => {
    setSelectedCategory(category);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteRadiologyCategory(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Category deleted successfully");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleSaveSuccess = () => {
    fetchCategories();
    setOpen(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <>
      <Card className="p-0">
        <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
          <CardTitle className="text-2xl font-bold">
            Radiology Categories
          </CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit and manage Radiology Categories.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search radiology category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.No</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-6"
                    >
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
                      <TableCell className="max-w-[280px] truncate">
                        {category.description || "-"}
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

      <RadiologyCategoryModal
        open={open}
        onOpenChange={setOpen}
        category={selectedCategory}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
