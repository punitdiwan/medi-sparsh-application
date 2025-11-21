"use client";

import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FloorModal } from "./floorModel";

type Floor = {
  id: string;
  name: string;
  description: string;
};

export default function FloorManager() {
  const [floors, setFloors] = useState<Floor[]>([
    { id: "1", name: "Ground Floor", description: "Main entrance floor" },
    { id: "2", name: "First Floor", description: "Patient wards" },
    { id: "3", name: "Second Floor", description: "ICU and Labs" },
    // Add more mock data if needed
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Filter floors by search
  const filteredFloors = useMemo(() => {
    return floors.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [floors, search]);

  // Pagination
  const totalPages = Math.ceil(filteredFloors.length / rowsPerPage);
  const paginatedFloors = filteredFloors.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSave = (floor: { id?: string; name: string; description: string }) => {
    if (floor.id) {
      // Update
      setFloors((prev) => prev.map((f) => (f.id === floor.id ? { ...f, ...floor } : f)));
      toast.success("Floor updated successfully");
    } else {
      // Add
      const newFloor = { ...floor, id: Date.now().toString() };
      setFloors((prev) => [...prev, newFloor]);
      toast.success("Floor added successfully");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this floor?")) {
      setFloors((prev) => prev.filter((f) => f.id !== id));
      toast.success("Floor deleted successfully");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top bar: Search + Add */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search floor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
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
          {paginatedFloors.map((floor) => (
            <TableRow key={floor.id}>
              <TableCell>{floor.name}</TableCell>
              <TableCell>{floor.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <FloorModal floor={floor} onSave={handleSave} />
                <Button variant="destructive" size="sm" onClick={() => handleDelete(floor.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {paginatedFloors.length === 0 && (
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
