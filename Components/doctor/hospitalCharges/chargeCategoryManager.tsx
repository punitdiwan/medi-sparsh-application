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

// ---------------- Types ----------------
export interface ChargeCategoryItem {
  id: string;
  categoryType: string;
  name: string;
  description: string;
  isDeleted?: boolean;
}
// ---------------------------------------

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

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChargeCategoryItem | null>(null);

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- Filter + Search ----------------
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

  // ---------------- Save (Add/Edit) ----------------
  const handleSubmit = (item: Omit<ChargeCategoryItem, "id"> & { id?: string }) => {
    if (editItem) {
      // Edit
      setData((prev) =>
        prev.map((i) => (i.id === editItem.id ? { ...editItem, ...item } : i))
      );
      toast.success("Category updated successfully!");
    } else {
      // Add
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

  // ---------------- Soft Delete ----------------
  const handleSoftDelete = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: true } : i))
    );
    toast.success("Category soft deleted");
  };

  // ---------------- Permanent Delete ----------------
  const handleHardDelete = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
    toast.success("Category permanently deleted");
  };

  // ---------------- Reactivate ----------------
  const handleReactivate = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: false } : i))
    );
    toast.success("Category restored");
  };

  return (
    <div className="p-6 space-y-4">
      {/* Search + Toggle + Add */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            id="show-deleted"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
          />
          <Label htmlFor="show-deleted">Show Deleted Only</Label>
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
      <div className="overflow-auto border rounded-md max-h-[430px]">
        <table className="w-full table-auto">
          <thead className="sticky top-0 bg-muted z-10">
            <tr>
              <th className="border p-2">Category Type</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted-foreground">
                  No Categories Found
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} className={item.isDeleted ? "opacity-60" : ""}>
                  <td className="border p-2">{item.categoryType}</td>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.description}</td>

                  <td className="border p-2 text-right space-x-2">
                    {!item.isDeleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditItem(item);
                          setModalOpen(true);
                        }}
                      >
                        <MdEdit />
                      </Button>
                    )}

                    {item.isDeleted ? (
                      <>
                        {/* Reactivate */}
                        <ConfirmDialog
                          title="Reactivate Category?"
                          description="This will restore the category."
                          onConfirm={() => handleReactivate(item.id)}
                          trigger={
                            <Button variant="outline" size="sm">
                              Reactivate
                            </Button>
                          }
                        />

                        {/* Hard Delete */}
                        <ConfirmDialog
                          title="Permanently remove?"
                          description="This action cannot be undone."
                          onConfirm={() => handleHardDelete(item.id)}
                          trigger={
                            <Button variant="destructive" size="sm">
                              Permanent Delete
                            </Button>
                          }
                        />
                      </>
                    ) : (
                      // Soft Delete
                      <ConfirmDialog
                        title="Delete Category?"
                        description="This will soft delete the category."
                        onConfirm={() => handleSoftDelete(item.id)}
                        trigger={
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        }
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center mt-3">
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

      {/* Add/Edit Modal */}
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
