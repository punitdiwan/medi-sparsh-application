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
import ParameterModal, { PathologyParameter } from "./ParameterModal";
import { Unit } from "./UnitModal";
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
  getPathologyParameters,
  deletePathologyParameter,
} from "@/lib/actions/pathologyParameters";
import { getPathologyUnits } from "@/lib/actions/pathologyUnits";
import { toast } from "sonner";

export default function ParameterManager() {
  const [parameters, setParameters] = useState<PathologyParameter[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<PathologyParameter | undefined>();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [parametersResult, unitsResult] = await Promise.all([
        getPathologyParameters(),
        getPathologyUnits(),
      ]);

      if (parametersResult.error) {
        toast.error(parametersResult.error);
      } else if (parametersResult.data) {
        setParameters(parametersResult.data);
      }

      if (unitsResult.error) {
        toast.error(unitsResult.error);
      } else if (unitsResult.data) {
        setUnits(unitsResult.data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredParameters = parameters.filter((p) =>
    p.paramName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedParameter(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (parameter: PathologyParameter) => {
    setSelectedParameter(parameter);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deletePathologyParameter(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Parameter deleted successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete parameter");
    }
  };

  const handleSaveSuccess = () => {
    fetchData();
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="p-0">
        {/* Header */}
        <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
          <CardTitle className="text-2xl font-bold">
            Pathology Parameters
          </CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Add, edit and manage pathology test parameters.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          {/* Search + Action */}
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

          {/* Table */}
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
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredParameters.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      No parameters found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParameters.map((parameter, index) => (
                    <TableRow key={parameter.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        {parameter.paramName}
                      </TableCell>

                      <TableCell>
                        {parameter.fromRange} – {parameter.toRange}
                      </TableCell>

                      <TableCell>{parameter.unitName}</TableCell>

                      <TableCell className="max-w-[280px] truncate">
                        {parameter.description || "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(parameter)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Parameter</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <ConfirmDialog
                            title="Delete Parameter"
                            description={`Are you sure you want to delete "${parameter.paramName}"?`}
                            onConfirm={() => handleDelete(parameter.id)}
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

      {/* Modal */}
      <ParameterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        parameter={selectedParameter}
        onSaveSuccess={handleSaveSuccess}
        units={units}
      />
    </>
  );
}
