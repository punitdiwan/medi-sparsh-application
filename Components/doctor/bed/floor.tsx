"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FloorModal } from "./floorModel";

type Floor = {
  id: string;
  name: string;
  description: string | null;
  hospitalId: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function FloorManager() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const rowsPerPage = 5;

  // Fetch user role and floors on mount
  useEffect(() => {
    fetchUserRole();
    fetchFloors();
  }, []);

  // Refetch floors when showDeleted changes
  useEffect(() => {
    fetchFloors();
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

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/floors", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch floors");
      const data = await response.json();
      setFloors(data);
    } catch (error) {
      console.error("Error fetching floors:", error);
      toast.error("Failed to load floors");
    } finally {
      setLoading(false);
    }
  };

  // Filter floors by search
  const filteredFloors = useMemo(() => {
    return floors.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [floors, search]);

  // Pagination
  const totalPages = Math.ceil(filteredFloors.length / rowsPerPage);
  const paginatedFloors = filteredFloors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSave = async (floor: { id?: string; name: string; description?: string }) => {
    try {
      if (floor.id) {
        // Update
        const response = await fetch(`/api/floors/${floor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: floor.name,
            description: floor.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to update floor");
        const updatedFloor = await response.json();
        setFloors((prev) => prev.map((f) => (f.id === floor.id ? updatedFloor : f)));
        toast.success("Floor updated successfully");
      } else {
        // Add
        const response = await fetch("/api/floors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: floor.name,
            description: floor.description,
          }),
        });

        if (!response.ok) throw new Error("Failed to create floor");
        const newFloor = await response.json();
        setFloors((prev) => [...prev, newFloor]);
        toast.success("Floor added successfully");
      }
    } catch (error) {
      console.error("Error saving floor:", error);
      toast.error("Failed to save floor");
    }
  };

  const handleDelete = async (id: string, isAlreadyDeleted: boolean = false) => {
    const floor = floors.find((f) => f.id === id);
    
    // If floor is already soft deleted and user is owner, offer permanent deletion
    if (isAlreadyDeleted && userRole === "owner") {
      const confirmPermanent = confirm(
        "This floor is already deleted. Click OK to permanently delete it, or Cancel to keep it."
      );
      
      if (confirmPermanent) {
        try {
          const response = await fetch(`/api/floors/${id}?permanent=true`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to permanently delete floor");
          }
          
          setFloors((prev) => prev.filter((f) => f.id !== id));
          toast.success("Floor permanently deleted");
        } catch (error) {
          console.error("Error permanently deleting floor:", error);
          toast.error(error instanceof Error ? error.message : "Failed to permanently delete floor");
        }
      }
    } else if (isAlreadyDeleted && userRole !== "owner") {
      toast.error("Only owner can permanently delete floors");
    } else {
      // Soft delete
      const confirmDelete = confirm("Are you sure you want to delete this floor?");
      if (confirmDelete) {
        try {
          const response = await fetch(`/api/floors/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete floor");
          setFloors((prev) => prev.filter((f) => f.id !== id));
          toast.success("Floor deleted successfully");
        } catch (error) {
          console.error("Error deleting floor:", error);
          toast.error("Failed to delete floor");
        }
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top bar: Search + Switch + Add */}
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search floor..."
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
        
        <FloorModal onSave={handleSave} />
      </div>

      {/* Floor Table */}
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
                Loading floors...
              </TableCell>
            </TableRow>
          ) : paginatedFloors.length > 0 ? (
            paginatedFloors.map((floor) => (
              <TableRow key={floor.id} className={floor.isDeleted ? "opacity-60" : ""}>
                <TableCell>{floor.name}</TableCell>
                <TableCell>{floor.description || "-"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {!floor.isDeleted && <FloorModal floor={floor} onSave={handleSave} />}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(floor.id, floor.isDeleted)}
                  >
                    {floor.isDeleted ? "Permanently Delete" : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No floors found.
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
          <span className="flex items-center px-2">Page {currentPage} of {totalPages}</span>
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
  );
}
