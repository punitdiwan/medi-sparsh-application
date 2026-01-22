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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RadiologyParameterModal, { RadiologyParameter } from "./RadiologyParameterModal";
import { RadiologyUnit } from "./RadiologyUnitModal";

/* -------------------- DUMMY DATA -------------------- */
const DUMMY_RADIOLOGY_UNITS: RadiologyUnit[] = [
  { id: "1", name: "mg/dL" },
  { id: "2", name: "mL" },
  { id: "3", name: "cm" },
];

const DUMMY_RADIOLOGY_PARAMETERS: RadiologyParameter[] = [
  { id: "1", paramName: "Hemoglobin", fromRange: "12", toRange: "16", unitId: "1", unitName: "mg/dL", description: "Normal Hemoglobin" },
  { id: "2", paramName: "WBC Count", fromRange: "4000", toRange: "11000", unitId: "2", unitName: "mL", description: "White Blood Cells" },
];

export default function RadiologyParameterManager() {
  const [parameters, setParameters] = useState<RadiologyParameter[]>(DUMMY_RADIOLOGY_PARAMETERS);
  const [units, setUnits] = useState<RadiologyUnit[]>(DUMMY_RADIOLOGY_UNITS);
  const [selectedParameter, setSelectedParameter] = useState<RadiologyParameter | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  /* -------------------- FILTER -------------------- */
  const filteredParameters = parameters.filter((p) =>
    p.paramName.toLowerCase().includes(search.toLowerCase())
  );

  /* -------------------- HANDLERS -------------------- */
  const handleAdd = () => {
    setSelectedParameter(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (param: RadiologyParameter) => {
    setSelectedParameter(param);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setParameters((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveSuccess = (data: RadiologyParameter) => {
    setParameters((prev) => {
      const exists = prev.find((p) => p.id === data.id);
      if (exists) return prev.map((p) => (p.id === data.id ? data : p));
      return [...prev, { ...data, id: crypto.randomUUID() }];
    });
    setIsModalOpen(false);
  };

  /* -------------------- UI -------------------- */
  return (
    <>
      <Card className="p-0">
        <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
          <CardTitle className="text-2xl font-bold">Radiology Parameters</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit and manage Radiology test parameters.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          <div className="flex justify-between items-center gap-4">
            <Input
              placeholder="Search parameter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Parameter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.No</TableHead>
                  <TableHead>Parameter Name</TableHead>
                  <TableHead>Reference Range</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredParameters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No parameters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParameters.map((param, index) => (
                    <TableRow key={param.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{param.paramName}</TableCell>
                      <TableCell>{param.fromRange} – {param.toRange}</TableCell>
                      <TableCell>{param.unitName}</TableCell>
                      <TableCell className="max-w-[280px] truncate">{param.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(param)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Parameter</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <ConfirmDialog
                            title="Delete Parameter"
                            description={`Are you sure you want to delete "${param.paramName}"?`}
                            onConfirm={() => handleDelete(param.id)}
                            trigger={<Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-red-500" /></Button>}
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

      <RadiologyParameterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        parameter={selectedParameter}
        onSaveSuccess={handleSaveSuccess}
        units={units}
      />
    </>
  );
}
