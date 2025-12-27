"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";

export interface ChargeCategoryItem {
  id: string;
  categoryType: string; // This is the Charge Type Name
  chargeTypeId: string;
  name: string;
  description: string;
  isDeleted?: boolean;
}

interface ChargeType {
  id: string;
  name: string;
}

export default function ChargeCategoryManager() {
  const [data, setData] = useState<ChargeCategoryItem[]>([]);
  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChargeCategoryItem | null>(null);

  const ability = useAbility();
  const rowsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Data
  useEffect(() => {
    fetchData();
    fetchChargeTypes();
  }, [showDeleted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/charge-categories?showDeleted=${showDeleted}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchChargeTypes = async () => {
    try {
      const response = await fetch("/api/charge-types");
      if (!response.ok) throw new Error("Failed to fetch charge types");
      const result = await response.json();
      setChargeTypes(result);
    } catch (error) {
      console.error("Error fetching charge types:", error);
    }
  };

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.categoryType && item.categoryType.toLowerCase().includes(search.toLowerCase()));

      return matchSearch;
    });
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSubmit = async (item: any) => {
    try {
      if (editItem) {
        // Update
        const response = await fetch(`/api/charge-categories/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to update category");

        toast.success("Category updated!");
      } else {
        // Create
        const response = await fetch("/api/charge-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to create category");

        toast.success("Category added!");
      }
      fetchData(); // Refresh list
      setModalOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/charge-categories/${id}`, {
        method: "DELETE",
      });

      if (response.status === 409) {
        toast.error("Cannot delete: Charges exist for this category");
        return;
      }

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Category soft deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/charge-categories/${id}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete permanently");

      toast.success("Category permanently deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const response = await fetch(`/api/charge-categories/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to restore");

      toast.success("Category restored");
      fetchData();
    } catch (error) {
      console.error("Error restoring category:", error);
      toast.error("Failed to restore category");
    }
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
        <Can I="create" a="ChargesCategory" ability={ability}>
          <Button
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
          >
            + Add Category
          </Button>
        </Can>
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.isDeleted ? "opacity-50" : ""}
                >
                  <TableCell>{item.categoryType || "N/A"}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="max-w-[300px] wrap-break-words whitespace-normal">{item.description || "-"}</TableCell>

                  <TableCell className="text-right space-x-2">
                    {!item.isDeleted ? (
                      <>
                      <Can I="update" a="ChargesCategory" ability={ability}>
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
                      </Can>
                      <Can I="delete" a="ChargesCategory" ability={ability}>
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
                        </Can>
                      </>
                    ) : (
                      <>
                      <Can I="delete" a="ChargesCategory" ability={ability}>
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
                      </Can>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-4 text-center text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
        defaultData={editItem}
        chargeTypes={chargeTypes}
      />
    </div>
  );
}

