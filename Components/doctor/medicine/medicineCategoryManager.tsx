"use client";

import React, { useMemo, useState } from "react";
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
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MedicineCategoryModal, MedicineCategory } from "./medicineCategoryModel";

export default function MedicineCategoryManager() {
  const [categories, setCategories] = useState<MedicineCategory[]>([
    { id: "c1", name: "Syrup" },
    { id: "c2", name: "Capsule" },
    { id: "c3", name: "Injection" },
  ]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicineCategory | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [search, categories]);

  const handleSave = (item: MedicineCategory) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === item.id);
      return exists
        ? prev.map((c) => (c.id === item.id ? item : c))
        : [...prev, item];
    });
    setEditing(null);
  };

  return (
    <Card className="p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Medicine Categories</CardTitle>
        <CardDescription>Manage medicine categories for inventory.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* Top row: Search + Add */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />

          <Button onClick={() => setOpen(true)}>Add Category</Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(cat);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setCategories((prev) => prev.filter((c) => c.id !== cat.id))
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal */}
      <MedicineCategoryModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        category={editing ?? undefined}
        onSave={handleSave}
      />
    </Card>
  );
}
