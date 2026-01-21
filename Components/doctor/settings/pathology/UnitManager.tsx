"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import UnitModal, { Unit } from "./UnitModal";
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
  getPathologyUnits,
  deletePathologyUnit,
} from "@/lib/actions/pathologyUnits";
import { toast } from "sonner";

export default function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const result = await getPathologyUnits();
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setUnits(result.data);
      }
    } catch (error) {
      toast.error("Failed to fetch units");
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedUnit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePathologyUnit(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Unit deleted successfully");
        fetchUnits();
      }
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  };

  const handleSaveSuccess = () => {
    fetchUnits();
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="p-0">
        <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
          <CardTitle className="text-2xl font-bold">Units</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit and manage measurement units.
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      No units found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit, index) => (
                    <TableRow key={unit.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        {unit.name}
                      </TableCell>

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

      <UnitModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        unit={selectedUnit}
        onSaveSuccess={handleSaveSuccess}
      />
    </>
  );
}
