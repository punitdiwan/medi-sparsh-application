"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import BedModal from "./bedModel";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Bed = {
  id: string;
  name: string;
  bedTypeId: string;
  bedGroupId: string;
  bedTypeName: string | null;
  bedGroupName: string | null;
  floorName: string | null;
  hospitalId: string;
  isDeleted: boolean;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BedManager() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const ability = useAbility();
  const rowsPerPage = 20;

  // Fetch user role and beds on mount
  useEffect(() => {
    fetchUserRole();
    fetchBeds();
  }, []);

  // Refetch beds when showDeleted changes
  useEffect(() => {
    fetchBeds();
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

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/beds", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch beds");
      const data = await response.json();
      setBeds(data);
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds");
    } finally {
      setLoading(false);
    }
  };

  // Filter beds by search
  const filteredBeds = useMemo(() => {
    return beds.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.bedGroupName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (b.bedTypeName?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [beds, search]);

  // Pagination
  const totalPages = Math.ceil(filteredBeds.length / rowsPerPage);
  const paginatedBeds = filteredBeds.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSave = async (bed: { id?: string; name: string; bedTypeId: string; bedGroupId: string }) => {
    try {
      if (bed.id) {
        // Update
        const response = await fetch(`/api/beds/${bed.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bed.name,
            bedTypeId: bed.bedTypeId,
            bedGroupId: bed.bedGroupId,
          }),
        });

        if (!response.ok) throw new Error("Failed to update bed");
        const updatedBed = await response.json();
        fetchBeds();
        setBeds((prev) => prev.map((b) => (b.id === bed.id ? updatedBed : b)));
        toast.success("Bed updated successfully");
      } else {
        // Add
        const response = await fetch("/api/beds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bed.name,
            bedTypeId: bed.bedTypeId,
            bedGroupId: bed.bedGroupId,
          }),
        });

        if (!response.ok) throw new Error("Failed to create bed");
        const newBed = await response.json();
        fetchBeds();
        setBeds((prev) => [...prev, newBed]);
        toast.success("Bed added successfully");
      }
    } catch (error) {
      console.error("Error saving bed:", error);
      toast.error("Failed to save bed");
    }
  };

  const handleDelete = async (id: string, isAlreadyDeleted: boolean = false) => {
    const bed = beds.find((b) => b.id === id);

    // If bed is already soft deleted and user is owner, offer permanent deletion
    if (isAlreadyDeleted && userRole === "owner") {
      // Use ConfirmDialog for permanent deletion
      return; // Will be triggered by ConfirmDialog
    } else if (isAlreadyDeleted && userRole !== "owner") {
      toast.error("Only owner can permanently delete beds");
    } else {
      // Soft delete - will be triggered by ConfirmDialog
      return;
    }
  };

  const performDelete = async (id: string, isAlreadyDeleted: boolean = false) => {
    try {
      if (isAlreadyDeleted && userRole === "owner") {
        // Permanent delete
        const response = await fetch(`/api/beds/${id}?permanent=true`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to permanently delete bed");
        }

        setBeds((prev) => prev.filter((b) => b.id !== id));
        toast.success("Bed permanently deleted");
      } else {
        // Soft delete
        const response = await fetch(`/api/beds/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete bed");
        setBeds((prev) => prev.filter((b) => b.id !== id));
        toast.success("Bed deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting bed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete bed");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Hospital Bed Manager</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit, remove and organize beds across groups and floors.
          </CardDescription>
        </div>
      </CardHeader>
      {/* <Separator /> */}
      <CardContent>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search beds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />

            <div className="flex items-center gap-2">
              <Switch
                id="deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="deleted">Show deleted</Label>
            </div>
            <Can I="create" a="bed" ability={ability}>
              <BedModal onSave={handleSave} />
            </Can>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Bed Type</TableHead>
                <TableHead>Bed Group</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading beds...
                  </TableCell>
                </TableRow>
              ) : paginatedBeds.length > 0 ? (
                paginatedBeds.map((b) => (
                  <TableRow key={b.id} className={b.isDeleted ? "opacity-60" : ""}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.bedTypeName || "-"}</TableCell>
                    <TableCell>{b.bedGroupName || "-"}</TableCell>
                    <TableCell>{b.floorName || "-"}</TableCell>

                    <TableCell className="text-right space-x-2">
                      {!b.isDeleted && <Can I="update" a="bed" ability={ability}><BedModal initialData={b} onSave={handleSave} /></Can>}
                      <Can I="delete" a="bed" ability={ability}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={b.isOccupied ? "cursor-not-allowed" : ""}>
                                <ConfirmDialog
                                  trigger={
                                    <Button size="sm" variant="destructive" disabled={b.isOccupied}>
                                      {b.isDeleted ? "Permanently Delete" : "Delete"}
                                    </Button>
                                  }
                                  title={b.isDeleted ? "Permanently Delete Bed?" : "Delete Bed?"}
                                  description={
                                    b.isDeleted
                                      ? "This bed is already deleted. Click confirm to permanently delete it."
                                      : "Are you sure you want to delete this bed?"
                                  }
                                  actionLabel={b.isDeleted ? "Permanently Delete" : "Delete"}
                                  cancelLabel="Cancel"
                                  onConfirm={() => performDelete(b.id, b.isDeleted)}
                                />
                              </span>
                            </TooltipTrigger>
                            {b.isOccupied && (
                              <TooltipContent>
                                <p>Bed is occupied by the patient and cannot be deleted.</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No beds found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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
        </div>
      </CardContent>
    </Card>
  );
}
