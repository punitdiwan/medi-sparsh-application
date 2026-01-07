"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BedGroupModal } from "./bedGroupModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { RotateCcw } from 'lucide-react';
type BedGroup = {
  id: string;
  name: string;
  description: string | null;
  floorId: string;
  floorName: string | null;
  hospitalId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BedGroupManager() {
  const [bedGroups, setBedGroups] = useState<BedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingBedGroup, setEditingBedGroup] = useState<BedGroup | null>(null);

  const ability = useAbility();

  const rowsPerPage = 20;

  // Fetch user role and bed groups on mount
  useEffect(() => {
    fetchUserRole();
    fetchBedGroups();
  }, []);

  // Refetch bed groups when showDeleted changes
  useEffect(() => {
    fetchBedGroups();
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

  const fetchBedGroups = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/bed-groups", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch bed groups");
      const data = await response.json();
      setBedGroups(data);
    } catch (error) {
      console.error("Error fetching bed groups:", error);
      toast.error("Failed to load bed groups");
    } finally {
      setLoading(false);
    }
  };

  // Filter bed groups by search
  const filteredGroups = useMemo(() => {
    return bedGroups.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.floorName?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [bedGroups, search]);

  // Pagination
  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSave = async (bedGroup: { id?: string; name: string; floorId: string; description?: string }) => {
    try {
      if (bedGroup.id) {
        // Update
        const response = await fetch(`/api/bed-groups/${bedGroup.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bedGroup.name,
            floorId: bedGroup.floorId,
            description: bedGroup.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to update bed group");
        const updatedBedGroup = await response.json();
        fetchBedGroups();
        setBedGroups((prev) => prev.map((b) => (b.id === bedGroup.id ? updatedBedGroup : b)));
        toast.success("Bed Group updated successfully");
      } else {
        // Add
        const response = await fetch("/api/bed-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bedGroup.name,
            floorId: bedGroup.floorId,
            description: bedGroup.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to create bed group");
        const newBedGroup = await response.json();
        fetchBedGroups();
        setBedGroups((prev) => [...prev, newBedGroup]);
        toast.success("Bed Group added successfully");
      }
    } catch (error) {
      console.error("Error saving bed group:", error);
      toast.error("Failed to save bed group");
    }
  };

  const handleSoftDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bed-groups/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete bed group");
      setBedGroups((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Group deleted successfully");
    } catch (error) {
      console.error("Error deleting bed group:", error);
      toast.error("Failed to delete bed group");
    }
  };

  const handleRestore = async (id: string) => {
    
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bed-groups/${id}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to permanently delete bed group");
      }

      setBedGroups((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Group permanently deleted");
    } catch (error) {
      console.error("Error permanently deleting bed group:", error);
      toast.error(error instanceof Error ? error.message : "Failed to permanently delete bed group");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Bed Group Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, update, delete and organize all hospital bed groups.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 space-y-4">
          {/* Top bar: Search + Switch + Add */}
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search bed group..."
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
            <Can I="create" a="bedGroups" ability={ability}>
              <Button onClick={() => {
                setEditingBedGroup(null);
                setOpen(true);
              }}>
                Add Bed Group
              </Button>
            </Can>
          </div>

          {/* Bed Group Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading bed groups...
                  </TableCell>
                </TableRow>
              ) : paginatedGroups.length > 0 ? (
                paginatedGroups.map((b) => (
                  <TableRow key={b.id} className={b.isDeleted ? "opacity-60" : ""}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.floorName || "-"}</TableCell>
                    <TableCell>{b.description || "-"}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {!b.isDeleted && (
                        <Can I="update" a="bedGroups" ability={ability}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBedGroup(b);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </Can>
                      )}
                      <Can I="delete" a="bedGroups" ability={ability}>
                      {b.isDeleted ? (
                        <div className="inline-flex gap-2">
                          <ConfirmDialog
                            title="Restore Bed Group?"
                            description="This bed group will be restored and become active again."
                            onConfirm={() => handleRestore(b.id)}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                              >
                                <RotateCcw />
                              </Button>
                            }
                          />
                          {userRole === "owner" ? (
                            <ConfirmDialog
                              title="Permanently Delete Bed Group?"
                              description="This action cannot be undone."
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
                          )}
                        </div>
                      ) : (
                        <ConfirmDialog
                          title="Delete Bed Group?"
                          description="Are you sure you want to delete this bed group?"
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No bed groups found.
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

          <BedGroupModal
            open={open}
            onOpenChange={(o) => {
              setOpen(o);
              if (!o) setEditingBedGroup(null);
            }}
            bedGroup={editingBedGroup || undefined}
            onSave={handleSave}
          />
        </div>
      </CardContent>
    </Card>
  );
}
