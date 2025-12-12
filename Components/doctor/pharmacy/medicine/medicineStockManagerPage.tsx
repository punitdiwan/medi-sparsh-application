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
import { toast } from "sonner";
import {
  getPharmacyMedicines,
  deletePharmacyMedicine,
  getPharmacyMedicineDropdowns,
} from "@/lib/actions/pharmacyMedicines";
import { PharmacyMedicineModal, PharmacyMedicine } from "./PharmacyMedicineModal";

type MedicineDisplay = {
  id: string;
  name: string;
  categoryName: string | null;
  companyName: string | null;
  unitName: string | null;
  groupName: string | null;
  categoryId: string;
  companyId: string;
  unitId: string;
  groupId: string;
};

export default function MedicineStockManagerPage() {
  const [medicines, setMedicines] = useState<MedicineDisplay[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<PharmacyMedicine | undefined>(undefined);
  const [dropdowns, setDropdowns] = useState<{
    categories: Array<{ id: string; name: string }>;
    companies: Array<{ id: string; name: string }>;
    units: Array<{ id: string; name: string }>;
    groups: Array<{ id: string; name: string }>;
  }>({
    categories: [],
    companies: [],
    units: [],
    groups: [],
  });

  const route = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [medicinesRes, dropdownsRes] = await Promise.all([
        getPharmacyMedicines(),
        getPharmacyMedicineDropdowns(),
      ]);

      if (medicinesRes.error) {
        toast.error(medicinesRes.error);
      } else if (medicinesRes.data) {
        setMedicines(medicinesRes.data);
      }

      if (dropdownsRes.error) {
        toast.error(dropdownsRes.error);
      } else if (dropdownsRes.data) {
        setDropdowns(dropdownsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter medicines
  const filtered = useMemo(() => {
    return medicines.filter((m) =>
      search
        ? m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.categoryName && m.categoryName.toLowerCase().includes(search.toLowerCase())) ||
        (m.companyName && m.companyName.toLowerCase().includes(search.toLowerCase()))
        : true
    );
  }, [search, medicines]);

  // Columns
  const columns: ColumnDef<MedicineDisplay>[] = [
    {
      header: "S.No",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "name", header: "Medicine Name" },
    { accessorKey: "categoryName", header: "Category" },
    { accessorKey: "companyName", header: "Company" },
    { accessorKey: "groupName", header: "Group" },
    { accessorKey: "unitName", header: "Unit" },

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

  const handleAdd = () => {
    setSelectedMedicine(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (med: MedicineDisplay) => {
    setSelectedMedicine({
      id: med.id,
      name: med.name,
      categoryId: med.categoryId,
      companyId: med.companyId,
      unitId: med.unitId,
      groupId: med.groupId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (med: MedicineDisplay) => {
    if (confirm(`Are you sure you want to delete ${med.name}?`)) {
      const result = await deletePharmacyMedicine(med.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Medicine deleted successfully");
        fetchData(); // Refresh list
      }
    }
  };

  const handleSave = (savedMedicine: PharmacyMedicine) => {
    fetchData(); // Refresh list to get updated names (joins)
  };

  return (
    <div className="p-6">
      <BackButton />
      {/* TITLE SECTION WITH BUTTONS */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Medicine Stock Manager</h1>
      </div>

      {/* Search + Buttons */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Input
        />

        <div className="flex gap-3">
          <Button variant="outline">
            <PiUploadBold size={16} /> Import Medicine
          </Button>
          <Button variant="outline" onClick={handleAdd}>
            <Plus size={16} /> Add Medicine
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <Table data={filtered} columns={columns} />
      )}

      <PharmacyMedicineModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        medicine={selectedMedicine}
        onSave={handleSave}
        categories={dropdowns.categories}
        companies={dropdowns.companies}
        units={dropdowns.units}
        groups={dropdowns.groups}
      />
    </div>
  );
}

