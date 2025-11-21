"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BedTypeModal } from "./bedTypeModel";

type BedType = {
  id: string;
  name: string;
};

export default function BedTypeManager() {
  const [bedTypes, setBedTypes] = useState<BedType[]>([
    { id: "1", name: "General Bed" },
    { id: "2", name: "ICU Bed" },
    { id: "3", name: "Emergency Bed" },
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredBedTypes = useMemo(() => {
    return bedTypes.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [bedTypes, search]);

  const totalPages = Math.ceil(filteredBedTypes.length / rowsPerPage);
  const paginatedBedTypes = filteredBedTypes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSave = (bedType: { id?: string; name: string }) => {
    if (bedType.id) {
      // Update
      setBedTypes((prev) =>
        prev.map((b) => (b.id === bedType.id ? { ...b, ...bedType } : b))
      );
      toast.success("Bed Type updated successfully");
    } else {
      // Add
      const newBedType = { ...bedType, id: Date.now().toString() };
      setBedTypes((prev) => [...prev, newBedType]);
      toast.success("Bed Type added successfully");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this Bed Type?")) {
      setBedTypes((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Type deleted successfully");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search & Add */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search Bed Type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <BedTypeModal onSave={handleSave} />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBedTypes.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <BedTypeModal bedType={b} onSave={handleSave} />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(b.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {paginatedBedTypes.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground">
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
    </div>
  );
}
