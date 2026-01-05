"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { PiUploadBold } from "react-icons/pi";
import { toast } from "sonner";
import {
  getPharmacyMedicines,
  deletePharmacyMedicine,
  getPharmacyMedicineDropdowns,
} from "@/lib/actions/pharmacyMedicines";
import { PharmacyMedicineModal, PharmacyMedicine } from "./PharmacyMedicineModal";
import { PiMagnifyingGlassDuotone } from "react-icons/pi";
import HospitalMedicineExcelModal from "./hospitalMedicineExcelModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
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
  quantity: number;
};

export default function MedicineStockManagerPage() {
  const [medicines, setMedicines] = useState<MedicineDisplay[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
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

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return medicines;

    return medicines.filter((m) => {
      return (
        (m.name && m.name.toLowerCase().includes(query)) ||
        (m.categoryName && m.categoryName.toLowerCase().includes(query)) ||
        (m.companyName && m.companyName.toLowerCase().includes(query)) ||
        (m.unitName && m.unitName.toLowerCase().includes(query)) ||
        (m.groupName && m.groupName.toLowerCase().includes(query)) ||
        m.id.toLowerCase().includes(query) // if ID should be searchable
      );
    });
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
    { accessorKey: "quantity", header: "Quantity" },

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
      <Card className="bg-Module-header text-white shadow-lg mb-6 px-6 py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Pharmacy Medicine Management
          </h1>
          <p className="text-sm text-white/80 max-w-2xl">
            Manage pharmacy medicines, stock quantity, categories, and suppliers.
            Add, edit, or upload medicines to keep inventory organized and up to date.
          </p>
        </div>
      </Card>

      {/* Search + Buttons */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Input
          placeholder="Search medicine, category, company, unit, group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-auto"
        />

        <div className="flex gap-3">

          <Button variant="default" onClick={handleAdd}>
            <Plus size={16} /> Add Medicine
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setOpen(true)}
                  className="p-2"
                >
                  <Upload className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
                <TooltipContent>
                  <p>Upload Patients Excel</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <HospitalMedicineExcelModal open={open} setOpen={setOpen} />
      </div>

      {isLoading && filtered.length == 0 ? (
        <div className="text-center py-4">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 
          border border-border rounded-xl bg-card/60 backdrop-blur-sm">
          <span className="text-4xl"><PiMagnifyingGlassDuotone /></span>
          <h3 className="text-lg font-semibold text-foreground">
            Nothing Found
          </h3>
          <p className="text-muted-foreground text-sm">
            No medicines match your search.
          </p>
        </div>

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

