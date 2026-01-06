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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { UnitModal, Unit } from "./medicineUnit";
import { getMedicineUnits, createMedicineUnit, updateMedicineUnit, deleteMedicineUnit } from "@/lib/actions/medicineUnits";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

export default function MedicineUnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined);
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

  const handleDeleteConfirm = async (id: string) => {
    try {
      const result = await deleteMedicineUnit(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUnits((prev) => prev.filter((u) => u.id !== id));
      toast.success("Unit deleted");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error("Failed to delete unit");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Medicine Unit Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Manage measurement units for medicines.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
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
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70px]">S.No</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
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
                    <TableCell className="text-right space-x-2">
                      <Can I="update" a="medicineUnit" ability={ability}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingUnit(unit);
                            setOpenModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Can>
                      <Can I="delete" a="medicineUnit" ability={ability}>
                        <ConfirmDialog
                          title="Delete Unit"
                          description="Are you sure you want to permanently delete this medicine unit? This action cannot be undone."
                          onConfirm={() => handleDeleteConfirm(unit.id)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          }
                        />
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
    </Card>
  );
}
