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
import { getMedicineGroups } from "@/lib/actions/medicineGroups";
import { DeleteConfirmationDialog } from "./deleteConfirmationDialog";
import MedicineExcelModal from "./medicineExcelUploadModel";
import { Loader2, Upload } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function MedicineManager() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Medicine[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Medicine | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [units, setUnits] = useState<Array<{ id: string; name: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [medicinesRes, categoriesRes, companiesRes, unitsRes, groupsRes] = await Promise.all([
          getMedicines(),
          getMedicineCategories(),
          getMedicineCompanies(),
          getMedicineUnits(),
          getMedicineGroups(),
        ]);

        if (medicinesRes.data) {
          setData(medicinesRes.data as Medicine[]);
        }
        if (categoriesRes.data) setCategories(categoriesRes.data);
        if (companiesRes.data) setCompanies(companiesRes.data);
        if (unitsRes.data) setUnits(unitsRes.data);
        if (groupsRes.data) setGroups(groupsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load medicines");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => data.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  ), [search, data]);

  const handleSave = (med: Medicine) => {
    if (editing) {
      setData(prev => prev.map(x => x.id === med.id ? med : x));
      toast.success("Medicine Updated");
    } else {
      setData(prev => [...prev, med]);
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
      if (result.error) toast.error(result.error);
      else {
        setData(prev => prev.filter(x => x.id !== medicineToDelete.id));
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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "-";
  const getCompanyName = (id: string) => companies.find(c => c.id === id)?.name || "-";
  const getUnitName = (id: string) => units.find(u => u.id === id)?.name || "-";
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.name || "-";

  const refreshMedicines = async () => {
    try {
      setRefreshing(true);
      const medicinesRes = await getMedicines();
      if (medicinesRes.data) {
        setData(medicinesRes.data as Medicine[]);
        toast.success("Medicines updated");
      }
    } catch {
      toast.error("Error refreshing medicines");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Medicine Records Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Manage all medicine records and details.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <Input placeholder="Search Medicine..." className="max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setEditing(undefined); setOpenModal(true); }}>Add Medicine</Button>
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
            <Button variant="outline" onClick={refreshMedicines} disabled={refreshing}>
              {refreshing ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Refreshing...</span> : "Refresh"}
            </Button>
            <MedicineExcelModal open={open} setOpen={setOpen} />
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center">Loading medicines...</TableCell>
                </TableRow>
              ) : filtered.length > 0 ? filtered.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{getCategoryName(item.categoryId)}</TableCell>
                  <TableCell>{getCompanyName(item.companyName)}</TableCell>
                  <TableCell>{getUnitName(item.unitId)}</TableCell>
                  <TableCell>{getGroupName(item.groupId)}</TableCell>
                  <TableCell>{item.notes || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setOpenModal(true); }}>
                      <MdEdit size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item)}>
                      <MdDelete size={18} className="text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-6 text-center">No medicines found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <MedicineModal
          open={openModal}
          onOpenChange={setOpenModal}
          medicine={editing}
          categories={categories}
          companies={companies}
          units={units}
          groups={groups}
          onSave={handleSave}
        />

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
