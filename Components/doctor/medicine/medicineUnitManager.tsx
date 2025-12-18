"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { UnitModal, Unit } from "./medicineUnit";
import { getMedicineUnits, createMedicineUnit, updateMedicineUnit, deleteMedicineUnit } from "@/lib/actions/medicineUnits";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";

export default function MedicineUnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ability = useAbility();
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const result = await getMedicineUnits();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setUnits(result.data?.map(u => ({ id: u.id, unitName: u.name })) || []);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter((u) =>
      u.unitName.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  const handleSave = async (data: Unit) => {
    try {
      const exists = units.some((u) => u.id === data.id);

      let result;
      if (exists) {
        // Update existing unit
        result = await updateMedicineUnit(data.id, {
          name: data.unitName,
        });
      } else {
        // Create new unit
        result = await createMedicineUnit({
          name: data.unitName,
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Unit updated" : "Unit added");
      fetchUnits();
      setEditingUnit(undefined);
    } catch (error) {
      console.error("Error saving unit:", error);
      toast.error("Failed to save unit");
    }
  };

  const handleDeleteClick = (id: string) => {
    setUnitToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      const result = await deleteMedicineUnit(unitToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUnits((prev) => prev.filter((u) => u.id !== unitToDelete));
      toast.success("Unit deleted");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
    } finally {
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
    }
  };

  return (
    <Card className="w-full p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Medicine Units</CardTitle>
        <CardDescription>Manage Units here.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Search + Add */}
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Can I="create" a="medicineUnit" ability={ability}>
              <Button
                onClick={() => {
                  setEditingUnit(undefined);
                  setOpenModal(true);
                }}
              >
                Add Unit
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setOpen(true)} className="p-2">
                      <Upload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Unit Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Can>
          </div>
        </div>
        <ExcelUploadModal
          open={open}
          setOpen={setOpen}
          entity="medicineUnit"
        />
        {/* Table */}
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">S.No</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading units...
                  </TableCell>
                </TableRow>
              ) : filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                  <TableRow key={unit.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{unit.unitName}</TableCell>

                    <TableCell className="text-right space-x-3">
                      <Can I="update" a="medicineUnit" ability={ability}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingUnit(unit);
                            setOpenModal(true);
                          }}
                        >
                          <MdEdit size={18} />
                        </Button>
                      </Can>
                      <Can I="delete" a="medicineUnit" ability={ability}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(unit.id)}
                        >
                          <MdDelete size={18} className="text-red-500" />
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No units found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </CardContent>

      {/* Modal */}
      <UnitModal
        open={openModal}
        onOpenChange={setOpenModal}
        unit={editingUnit}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medicine unit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
