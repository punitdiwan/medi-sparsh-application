// MedicineManager.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { MedicineModal, Medicine } from "./medicineModal";
import { getMedicines, deleteMedicine } from "@/lib/actions/medicines";
import { getMedicineCategories } from "@/lib/actions/medicineCategories";
import { getMedicineCompanies } from "@/lib/actions/medicineCompanies";
import { getMedicineUnits } from "@/lib/actions/medicineUnits";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";

export default function MedicineManager() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Medicine[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Medicine | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch medicines and related data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [medicinesRes, categoriesRes, companiesRes, unitsRes] = await Promise.all([
          getMedicines(),
          getMedicineCategories(),
          getMedicineCompanies(),
          getMedicineUnits(),
        ]);

        if (medicinesRes.data) {
          setData(medicinesRes.data as Medicine[]);
        }
        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (companiesRes.data) {
          setCompanies(companiesRes.data);
        }
        if (unitsRes.data) {
          setUnits(unitsRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load medicines");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const handleSave = (med: Medicine) => {
    if (editing) {
      setData((prev) => prev.map((x) => (x.id === med.id ? med : x)));
      toast.success("Medicine Updated");
    } else {
      setData((prev) => [...prev, med]);
      toast.success("Medicine Added");
    }
    setEditing(undefined);
  };

  const handleDeleteClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medicineToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteMedicine(medicineToDelete.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        setData((prev) => prev.filter((x) => x.id !== medicineToDelete.id));
        toast.success("Medicine deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast.error("Failed to delete medicine");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMedicineToDelete(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  };

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "-";
  };

  const getUnitName = (unitId: string) => {
    return units.find((u) => u.id === unitId)?.name || "-";
  };

  return (
    <Card className="w-full p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Medicine Manager</CardTitle>
        <CardDescription>Manage medicine here.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search + Add */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search Medicine..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            onClick={() => {
              setEditing(undefined);
              setOpenModal(true);
            }}
          >
            Add Medicine
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center">
                    Loading medicines...
                  </TableCell>
                </TableRow>
              ) : filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                    <TableCell>{getCompanyName(item.companyName)}</TableCell>
                    <TableCell>{getUnitName(item.unitId)}</TableCell>
                    <TableCell>{item.notes || "-"}</TableCell>
 
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(item);
                          setOpenModal(true);
                        }}
                      >
                        <MdEdit size={18} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <MdDelete size={18} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center">
                    No medicines found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal */}
        <MedicineModal
          open={openModal}
          onOpenChange={setOpenModal}
          medicine={editing}
          categories={categories}
          companies={companies}
          units={units}
          onSave={handleSave}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Medicine"
          description={`Are you sure you want to permanently delete "${medicineToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </CardContent>
    </Card>
  );
}
