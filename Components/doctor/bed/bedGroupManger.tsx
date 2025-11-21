"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BedGroupModal } from "./bedGroupModel";
type BedGroup = {
  id: string;
  name: string;
  floor: string;
  description: string;
};

export default function BedGroupManager() {
  const [bedGroups, setBedGroups] = useState<BedGroup[]>([
    { id: "1", name: "Group A", floor: "1st Floor", description: "General beds" },
    { id: "2", name: "Group B", floor: "2nd Floor", description: "ICU beds" },
  ]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const filteredGroups = useMemo(() => {
    return bedGroups.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.floor.toLowerCase().includes(search.toLowerCase())
    );
  }, [bedGroups, search]);

  const totalPages = Math.ceil(filteredGroups.length / rowsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSave = (bedGroup: { id?: string; name: string; floor: string; description: string }) => {
    if (bedGroup.id) {
      // Update existing group
      setBedGroups((prev) =>
        prev.map((b) => (b.id === bedGroup.id ? { ...b, ...bedGroup } : b))
      );
      toast.success("Bed Group updated successfully");
    } else {
      // Add new group
      const newGroup = { ...bedGroup, id: Date.now().toString() };
      setBedGroups((prev) => [...prev, newGroup]);
      toast.success("Bed Group added successfully");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this Bed Group?")) {
      setBedGroups((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bed Group deleted successfully");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Search & Add */}
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search Bed Group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <BedGroupModal onSave={handleSave} />
      </div>

      {/* Table */}
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
          {paginatedGroups.map((b) => (
            <TableRow key={b.id}>
              <TableCell>{b.name}</TableCell>
              <TableCell>{b.floor}</TableCell>
              <TableCell>{b.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <BedGroupModal bedGroup={b} onSave={handleSave} />
                <Button variant="destructive" size="sm" onClick={() => handleDelete(b.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {paginatedGroups.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No Bed Groups found.
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
