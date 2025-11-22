"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { MdEdit } from "react-icons/md";
import { ChargeCategoryModal } from "./chargeCategoryModal";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ChargeCategoryItem {
  id: string;
  categoryType: string;
  name: string;
  description: string;
  isDeleted?: boolean;
}

export default function ChargeCategoryManager() {
  const [data, setData] = useState<ChargeCategoryItem[]>([
    {
      id: "1",
      categoryType: "OPD",
      name: "Consultation Fee",
      description: "Doctor consultation charges.",
      isDeleted: false,
    },
    {
      id: "2",
      categoryType: "LAB",
      name: "Blood Test",
      description: "General blood test category.",
      isDeleted: true,
    },
  ]);

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChargeCategoryItem | null>(null);

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.categoryType.toLowerCase().includes(search.toLowerCase());

      const matchDeleted = showDeleted ? item.isDeleted : !item.isDeleted;

      return matchSearch && matchDeleted;
    });
  }, [data, search, showDeleted]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSubmit = (item: Omit<ChargeCategoryItem, "id"> & { id?: string }) => {
    if (editItem) {
      setData((prev) =>
        prev.map((i) => (i.id === editItem.id ? { ...editItem, ...item } : i))
      );
      toast.success("Category updated!");
    } else {
      const newItem: ChargeCategoryItem = {
        id: crypto.randomUUID(),
        ...item,
        isDeleted: false,
      };
      setData((prev) => [...prev, newItem]);
      toast.success("Category added!");
    }

    setModalOpen(false);
    setEditItem(null);
  };

  const handleSoftDelete = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: true } : i))
    );
    toast.success("Category soft deleted");
  };

  const handleHardDelete = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
    toast.success("Category permanently deleted");
  };

  const handleReactivate = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: false } : i))
    );
    toast.success("Category restored");
  };

  return (
    <div className="p-4 space-y-4">

      {/* Top Controls */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            id="deleted-filter"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
          />
          <Label htmlFor="deleted-filter">Show Deleted Only</Label>
        </div>

        <Button
          onClick={() => {
            setEditItem(null);
            setModalOpen(true);
          }}
        >
          + Add Category
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginated.length > 0 ? (
            paginated.map((item) => (
              <TableRow
                key={item.id}
                className={item.isDeleted ? "opacity-50" : ""}
              >
                <TableCell>{item.categoryType}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>

                <TableCell className="text-right space-x-2">
                  {!item.isDeleted ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditItem(item);
                          setModalOpen(true);
                        }}
                      >
                        <MdEdit />
                      </Button>

                      <ConfirmDialog
                        title="Delete Category?"
                        description="This will soft delete the category."
                        onConfirm={() => handleSoftDelete(item.id)}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <ConfirmDialog
                        title="Restore Category?"
                        description="This will reactivate the category."
                        onConfirm={() => handleReactivate(item.id)}
                        trigger={
                          <Button size="sm" variant="outline">
                            Restore
                          </Button>
                        }
                      />

                      <ConfirmDialog
                        title="Delete Permanently?"
                        description="This cannot be undone."
                        onConfirm={() => handleHardDelete(item.id)}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Delete Forever
                          </Button>
                        }
                      />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-4 text-center text-muted-foreground"
              >
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      <ChargeCategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleSubmit}
        defaultData={
          editItem
            ? {
                categoryType: editItem.categoryType,
                name: editItem.name,
                description: editItem.description,
              }
            : null
        }
      />
    </div>
  );
}
