"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PriorityModal } from "./PriorityModal";
import { MdEdit, MdDelete } from "react-icons/md";

export function PriorityManagerPage() {
  const [search, setSearch] = useState("");
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtered, setFiltered] = useState([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/appointmentPriority");
      if (res.ok) {
        const data = await res.json();
        setPriorities(data);
      } else {
        console.error("Failed to fetch priorities");
      }
    } catch (error) {
      console.error("Error fetching priorities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  useEffect(() => {
    const result = priorities.filter((p) =>
      p.priority.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, priorities]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Add + Edit handler
  const handleSave = async (data) => {
    try {
      if (data.id) {
        // Update existing
        const res = await fetch(`/api/appointmentPriority/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: data.name }),
        });
        if (res.ok) {
          fetchPriorities();
        }
      } else {
        // Add new
        const res = await fetch("/api/appointmentPriority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: data.name }),
        });
        if (res.ok) {
          fetchPriorities();
        }
      }
    } catch (error) {
      console.error("Error saving priority:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this priority?")) return;
    try {
      const res = await fetch(`/api/appointmentPriority/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPriorities();
      }
    } catch (error) {
      console.error("Error deleting priority:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search priority..."
          className="w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
        >
          Add Priority
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">#</TableHead>
              <TableHead>Priority Name</TableHead>
              <TableHead className="text-center w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{(page - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>{item.priority}</TableCell>

                  <TableCell className="flex justify-center gap-3">
                    {/* Edit */}
                    <MdEdit
                      className="cursor-pointer text-blue-600"
                      size={20}
                      onClick={() => {
                        setSelected({ id: item.id, name: item.priority });
                        setModalOpen(true);
                      }}
                    />

                    {/* Delete */}
                    <MdDelete
                      className="cursor-pointer text-red-600"
                      size={20}
                      onClick={() => handleDelete(item.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
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
      <PriorityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialData={selected}
      />
    </div>
  );
}

