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

export type Specialization = {
  id: number;
  name: string;
  description: string;
};

export default function SpecializationsManager() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [editSpec, setEditSpec] = useState<Specialization | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Demo data for testing
  const demoData: Specialization[] = [
    {
      id: 1,
      name: "Cardiology",
      description: "Heart and cardiovascular system related treatments.",
    },
    {
      id: 2,
      name: "Dermatology",
      description: "Skin, hair, and nail care and disorders.",
    },
    {
      id: 3,
      name: "Neurology",
      description: "Nervous system and brain-related issues.",
    },
    {
      id: 4,
      name: "Orthopedics",
      description: "Bones, joints, and muscular system problems.",
    },
    {
      id: 5,
      name: "Pediatrics",
      description: "Healthcare for infants and children.",
    },
    {
      id: 6,
      name: "Ophthalmology",
      description: "Eye diseases and vision correction.",
    },
    {
      id: 7,
      name: "Gynecology",
      description: "Women’s reproductive system and health.",
    },
    {
      id: 8,
      name: "Psychiatry",
      description: "Mental health, mood, and behavioral issues.",
    },
  ];

  // ✅ Fetch mock data
  const fetchSpecializations = useCallback(async () => {
    // Simulate API delay
    setTimeout(() => {
      let filtered = demoData;
      if (searchTerm) {
        filtered = demoData.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setTotalCount(filtered.length);

      // Pagination
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setSpecializations(filtered.slice(start, end));
    }, 500);
  }, [currentPage, searchTerm]);

  // ✅ Update specialization (mock edit)
  const updateSpecialization = useCallback(async () => {
    if (!editSpec) return;
    const updatedList = specializations.map((item) =>
      item.id === editSpec.id ? editSpec : item
    );
    setSpecializations(updatedList);
    setIsEditOpen(false);
  }, [editSpec, specializations]);

  // ✅ Define columns
  const columns: ColumnDef<Specialization>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
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

      <div className="flex flex-wrap gap-3 items-center ">
        <AddDataModal
          title="Add Specialization"
          table="specializations"
          fields={[
            { name: "name", label: "Specialization Name" },
            { name: "description", label: "Description" },
          ]}
          onSuccess={fetchSpecializations}
        />

        <Input
          placeholder="Search specialization..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
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
        <DialogContent>
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
