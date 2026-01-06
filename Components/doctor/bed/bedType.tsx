"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BedTypeModal } from "./bedTypeModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

type BedType = {
  id: string;
  name: string;
  description: string | null;
  hospitalId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BedTypeManager() {
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingBedType, setEditingBedType] = useState<BedType | null>(null);

  const ability = useAbility();
  const rowsPerPage = 20;

  // Fetch user role and bed types on mount
  useEffect(() => {
    fetchUserRole();
    fetchBedTypes();
  }, []);

  // Refetch bed types when showDeleted changes
  useEffect(() => {
    fetchBedTypes();
  }, [showDeleted]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch("/api/user/role");
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.data.member);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchBedTypes = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/bed-types", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch bed types");
      const data = await response.json();
      setBedTypes(data);
    } catch (error) {
      console.error("Error fetching bed types:", error);
      toast.error("Failed to load bed types");
    } finally {
      setLoading(false);
    }
  };

  // Filter bed types by search
  const filteredBedTypes = useMemo(() => {
    return bedTypes.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
  }, [bedTypes, search]);

  // Pagination
  const totalPages = Math.ceil(filteredBedTypes.length / rowsPerPage);
  const paginatedBedTypes = filteredBedTypes.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSave = async (bedType: { id?: string; name: string; description?: string }) => {
    try {
      if (bedType.id) {
        // Update
        const response = await fetch(`/api/bed-types/${bedType.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bedType.name,
            description: bedType.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to update bed type");
        const updatedBedType = await response.json();
        setBedTypes((prev) => prev.map((b) => (b.id === bedType.id ? updatedBedType : b)));
        toast.success("Bed Type updated successfully");
      } else {
        // Add
        const response = await fetch("/api/bed-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bedType.name,
            description: bedType.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to create bed type");
        const newBedType = await response.json();
        setBedTypes((prev) => [...prev, newBedType]);
        toast.success("Bed Type added successfully");
      }
    } catch (error) {
      console.error("Error saving bed type:", error);
      toast.error("Failed to save bed type");
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bed-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete bed type");
      }
      setBedTypes((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Type deleted successfully");
    } catch (error) {
      console.error("Error deleting bed type:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete bed type");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bed-types/${id}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to permanently delete bed type");
      }

      setBedTypes((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Type permanently deleted");
    } catch (error) {
      console.error("Error permanently deleting bed type:", error);
      toast.error(error instanceof Error ? error.message : "Failed to permanently delete bed type");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Bed Type Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, update, delete and organize all hospital bed types.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 space-y-4">
          {/* Top bar: Search + Switch + Add */}
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search bed type..."
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
              <Label htmlFor="show-deleted" className="cursor-pointer">
                Show Deleted Only
              </Label>
            </div>
            <Can I="create" a="bedType" ability={ability}>
              <Button onClick={() => {
                setEditingBedType(null);
                setOpen(true);
              }}>
                Add Bed Type
              </Button>
            </Can>
          </div>

          {/* Bed Type Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Loading bed types...
                  </TableCell>
                </TableRow>
              ) : paginatedBedTypes.length > 0 ? (
                paginatedBedTypes.map((b) => (
                  <TableRow key={b.id} className={b.isDeleted ? "opacity-60" : ""}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.description || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {!b.isDeleted && (
                        <Can I="update" a="bedType" ability={ability}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBedType(b);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </Can>
                      )}
                      <Can I="delete" a="bedType" ability={ability}>
                        {b.isDeleted ? (
                          userRole === "owner" ? (
                            <ConfirmDialog
                              title="Permanently Delete Bed Type?"
                              description="This action cannot be undone. This bed type will be permanently removed."
                              onConfirm={() => handlePermanentDelete(b.id)}
                              trigger={
                                <Button variant="destructive" size="sm">
                                  Permanently Delete
                                </Button>
                              }
                            />
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled
                              title="Only owner can permanently delete"
                            >
                              Permanently Delete
                            </Button>
                          )
                        ) : (
                          <ConfirmDialog
                            title="Delete Bed Type?"
                            description="Are you sure you want to delete this bed type? It will be soft deleted."
                            onConfirm={() => handleSoftDelete(b.id)}
                            trigger={
                              <Button variant="destructive" size="sm">
                                Delete
                              </Button>
                            }
                          />
                        )}
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No bed types found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-end space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="flex items-center px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}

          <BedTypeModal
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEditingBedType(null);
            }}
            bedType={editingBedType || undefined}
            onSave={handleSave}
          />
        </div>
      </CardContent>
    </Card>
  );
}
