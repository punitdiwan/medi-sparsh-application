"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Table } from "@/components/Table/Table";
import BackButton from "@/Components/BackButton";
import AddDataModal from "@/Components/doctor/employees/AddSpecializationModel";
import { ColumnDef } from "@tanstack/react-table";

import {
  getSpecializationsAction,
  updateSpecializationAction,
  deleteSpecializationAction
} from "@/lib/actions/specializationActions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export type Specialization = {
  id: number;
  name: string;
  description: string | null;
};

export default function SpecializationsManager() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [editSpec, setEditSpec] = useState<Specialization | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch real data
  const fetchSpecializations = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSpecializationsAction();
      if (result.data) {
        let filtered = result.data as Specialization[];
        if (searchTerm) {
          filtered = filtered.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setTotalCount(filtered.length);

        // Pagination
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        setSpecializations(filtered.slice(start, end));
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
      toast.error("Failed to fetch specializations");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // ✅ Update specialization
  const updateSpecialization = useCallback(async () => {
    if (!editSpec) return;
    try {
      const result = await updateSpecializationAction(editSpec.id, {
        name: editSpec.name,
        description: editSpec.description || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Specialization updated successfully");
        setIsEditOpen(false);
        fetchSpecializations();
      }
    } catch (error) {
      console.error("Error updating specialization:", error);
      toast.error("Failed to update specialization");
    }
  }, [editSpec, fetchSpecializations]);

  // ✅ Delete specialization
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this specialization?")) return;
    try {
      const result = await deleteSpecializationAction(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Specialization deleted successfully");
        fetchSpecializations();
      }
    } catch (error) {
      console.error("Error deleting specialization:", error);
      toast.error("Failed to delete specialization");
    }
  };

  // ✅ Define columns
  const columns: ColumnDef<Specialization>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditSpec(row.original);
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

  return (
    <div className="p-6 my-4 space-y-6">
      <BackButton />
      <h2 className="text-2xl font-bold">Manage Specializations</h2>

      <div className="flex flex-wrap gap-3 items-center justify-between ">
        <Input
          placeholder="Search specialization..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
        />
        <AddDataModal
          title="Add Specialization"
          table="specializations"
          fields={[
            { name: "name", label: "Specialization Name" },
            { name: "description", label: "Description" },
          ]}
          onSuccess={fetchSpecializations}
        />


      </div>

      <Table columns={columns} data={specializations} />

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <span className="text-sm text-gray-400">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          onClick={() =>
            setCurrentPage((p) => (p < totalPages ? p + 1 : p))
          }
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Specialization</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-3">
            <Input
              value={editSpec?.name || ""}
              onChange={(e) =>
                setEditSpec((prev) =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              placeholder="Specialization Name"
            />
            <Input
              value={editSpec?.description || ""}
              onChange={(e) =>
                setEditSpec((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              placeholder="Description"
            />
          </div>
          <DialogFooter>
            <Button onClick={updateSpecialization}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
