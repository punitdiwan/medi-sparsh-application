"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import BackButton from "@/Components/BackButton";
import { Plus } from "lucide-react";
import { PiUploadBold } from "react-icons/pi";
import { IoReorderThree } from "react-icons/io5";

import MedicineAddModel, { MedicineForm } from "./medicineAddModel";

type Medicine = {
  id: string;
  name: string;
  category: string;
  company: string;
  unit: string;
  note: string;
};

export default function MedicineStockManagerPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: MedicineForm) => {
    console.log("Medicine Data:", data);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value as any);
    });

    const res = await fetch("/api/medicine", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return alert("Failed to save!");

    alert("Medicine Saved Successfully!");
    setOpen(false); // modal close

  };

  useEffect(() => {
    setMedicines([
      {
        id: "1",
        name: "Paracetamol",
        category: "Tablet",
        company: "Cipla",
        unit: "Strip",
        note: "Pain & Fever",
      },
      {
        id: "2",
        name: "Azithromycin",
        category: "Antibiotic",
        company: "Sun Pharma",
        unit: "Strip",
        note: "250mg",
      },
    ]);
  }, []);

  // Filter medicines
  const filtered = useMemo(() => {
    return medicines.filter((m) =>
      search
        ? m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.category.toLowerCase().includes(search.toLowerCase()) ||
          m.company.toLowerCase().includes(search.toLowerCase())
        : true
    );
  }, [search, medicines]);

  const columns: ColumnDef<Medicine>[] = [
    {
      header: "S.No",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "name", header: "Medicine Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "company", header: "Company" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "note", header: "Note" },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
            Edit
          </Button>

          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (med: Medicine) => console.log("Edit medicine:", med);
  const handleDelete = (med: Medicine) => console.log("Delete medicine:", med);

  return (
    <div className="p-6">
      <BackButton />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Medicine Stock Manager</h1>
      </div>

      {/* Search + Buttons */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Input
          placeholder="Search Medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-3">
          <Button variant="outline"><PiUploadBold size={16}/> Import Medicine</Button>

          <Button variant="outline" onClick={() => setOpen(true)}>
            <Plus size={16} /> Add Medicine
          </Button>

          <Button variant="outline" onClick={() => router.push('/doctor/pharmacy/purchase')}>
            <IoReorderThree size={16}/> Purchase
          </Button>
        </div>
      </div>

      <Table data={filtered} columns={columns} />

      <MedicineAddModel
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
