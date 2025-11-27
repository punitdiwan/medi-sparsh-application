"use client";

import { useState, useMemo } from "react";
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
import { UnitModal, Unit } from "./medicineUnit";

export default function MedicineUnitManager() {
  const [units, setUnits] = useState<Unit[]>([
    { id: "1", unitName: "mm" },
    { id: "2", unitName: "mg" },
  ]);

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>(undefined);

  const filteredUnits = useMemo(() => {
    return units.filter((u) =>
      u.unitName.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  const handleSave = (data: Unit) => {
    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) => (u.id === data.id ? data : u))
      );
      toast.success("Unit updated");
    } else {
      setUnits((prev) => [...prev, data]);
      toast.success("Unit added");
    }

    setEditingUnit(undefined);
  };

  const handleDelete = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
    toast.success("Unit deleted");
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

          <Button
            onClick={() => {
              setEditingUnit(undefined);
              setOpenModal(true);
            }}
          >
            Add Unit
          </Button>
        </div>

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
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                  <TableRow key={unit.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{unit.unitName}</TableCell>

                    <TableCell className="text-right space-x-3">
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

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(unit.id)}
                      >
                        <MdDelete size={18} className="text-red-500" />
                      </Button>
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
