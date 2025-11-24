"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShiftModal } from "./shiftModal";
import { MdEdit, MdDelete } from "react-icons/md";

export function ShiftManagerPage() {
  const [search, setSearch] = useState("");

  const [shifts, setShifts] = useState([
    { id: 1, name: "Morning", timeFrom: "09:00", timeTo: "13:00" },
    { id: 2, name: "Afternoon", timeFrom: "13:00", timeTo: "17:00" },
    { id: 3, name: "Night", timeFrom: "17:00", timeTo: "22:00" },
  ]); // Dummy data

  const [filtered, setFiltered] = useState([]);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const result = shifts.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, shifts]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Add / Update
  const handleSave = (data) => {
    if (data.id) {
      setShifts((prev) =>
        prev.map((s) => (s.id === data.id ? { ...data } : s))
      );
    } else {
      setShifts((prev) => [
        ...prev,
        { id: Date.now(), ...data },
      ]);
    }
  };

  const handleDelete = (id) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="p-6 space-y-6">

      {/* Search & Add */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search shift..."
          className="w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          onClick={() => {
            setSelectedShift(null);
            setModalOpen(true);
          }}
        >
          Add Shift
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">#</TableHead>
              <TableHead>Shift Name</TableHead>
              <TableHead className="text-center">From</TableHead>
              <TableHead className="text-center">To</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No results found
                </TableCell>
              </TableRow>
            )}

            {paginatedData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-center">
                  {(page - 1) * pageSize + index + 1}
                </TableCell>

                <TableCell>{item.name}</TableCell>

                <TableCell className="text-center">
                  {item.timeFrom}
                </TableCell>

                <TableCell className="text-center">
                  {item.timeTo}
                </TableCell>

                <TableCell className="flex justify-center gap-3">
                  <MdEdit
                    size={20}
                    className="cursor-pointer text-blue-600"
                    onClick={() => {
                      setSelectedShift(item);
                      setModalOpen(true);
                    }}
                  />
                  <MdDelete
                    size={20}
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(item.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>

        <span>
          Page {page} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* Modal */}
      <ShiftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={selectedShift}
      />
    </div>
  );
}


