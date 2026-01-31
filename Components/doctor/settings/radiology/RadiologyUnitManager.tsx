"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import RadiologyUnitModal, { RadiologyUnit } from "./RadiologyUnitModal";


/* -------------------- DUMMY DATA -------------------- */
const DUMMY_RADIOLOGY_UNITS: RadiologyUnit[] = [
  { id: "1", name: "mg/dL" },
  { id: "2", name: "mL" },
  { id: "3", name: "cm" },
];

export default function RadiologyUnitManager() {
  const [units, setUnits] = useState<RadiologyUnit[]>(DUMMY_RADIOLOGY_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<RadiologyUnit | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  /* -------------------- FILTER -------------------- */
  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  /* -------------------- HANDLERS -------------------- */
  const handleAdd = () => {
    setSelectedUnit(undefined);
    setOpen(true);
  };

  const handleEdit = (unit: RadiologyUnit) => {
    setSelectedUnit(unit);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSaveSuccess = (data: RadiologyUnit) => {
    setUnits((prev) => {
      const exists = prev.find((u) => u.id === data.id);
      if (exists) {
        return prev.map((u) => (u.id === data.id ? data : u));
      }
      return [...prev, { ...data, id: crypto.randomUUID() }];
    });
    setOpen(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <>
      <Card className="p-0">
        <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
          <CardTitle className="text-2xl font-bold">Radiology Units</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit and manage Radiology measurement units.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Search + Action */}
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.No</TableHead>
                  <TableHead>Unit Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No units found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit, index) => (
                    <TableRow key={unit.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(unit)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Unit</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <ConfirmDialog
                            title="Delete Unit"
                            description={`Are you sure you want to delete "${unit.name}"?`}
                            onConfirm={() => handleDelete(unit.id)}
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RadiologyUnitModal
        open={open}
        onOpenChange={setOpen}
        unit={selectedUnit}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
