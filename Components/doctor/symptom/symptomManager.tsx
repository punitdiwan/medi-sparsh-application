"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { SymptomModal } from "./symptomModal";
import { getSymptoms, createSymptom, updateSymptom, deleteSymptom } from "@/lib/actions/symptomActions";
import { getSymptomTypes } from "@/lib/actions/symptomTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ExcelUploadModal from "@/Components/HospitalExcel";

type Symptom = {
  id: string;
  name: string;
  description: string;
  symptomTypeId: string;
  symptomTypeName: string | null;
};

type SymptomType = {
  id: string;
  name: string;
};

export default function SymptomManager() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [symptomToDelete, setSymptomToDelete] = useState<string | null>(null);
  const [openEx, setOpenEx] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);
  const ability = useAbility();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both symptoms and symptom types
      const [symptomsResult, typesResult] = await Promise.all([
        getSymptoms(),
        getSymptomTypes(),
      ]);

      if (symptomsResult.error) {
        toast.error(symptomsResult.error);
      } else {
        setSymptoms(symptomsResult.data || []);
      }

      if (typesResult.error) {
        toast.error(typesResult.error);
      } else {
        setSymptomTypes(typesResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter by search
  const filteredSymptoms = useMemo(() => {
    if (!search.trim()) return symptoms;
    const q = search.toLowerCase();
    return symptoms.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.symptomTypeName?.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [symptoms, search]);

  // Add / Edit
  const handleSave = async (payload: { id?: string; name: string; symptomTypeId: string; description: string }) => {
    try {
      let result;
      if (payload.id) {
        // Update
        result = await updateSymptom(payload.id, {
          name: payload.name,
          symptomTypeId: payload.symptomTypeId,
          description: payload.description,
        });
      } else {
        // Create
        result = await createSymptom({
          name: payload.name,
          symptomTypeId: payload.symptomTypeId,
          description: payload.description,
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(payload.id ? "Symptom updated" : "Symptom added");
      setEditingSymptom(null);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Error saving symptom:", error);
      toast.error("Failed to save symptom");
    }
  };

  const handleDeleteClick = (id: string) => {
    setSymptomToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!symptomToDelete) return;

    try {
      const result = await deleteSymptom(symptomToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSymptoms((prev) => prev.filter((s) => s.id !== symptomToDelete));
      toast.success("Symptom deleted");
    } catch (error) {
      console.error("Error deleting symptom:", error);
      toast.error("Failed to delete symptom");
    } finally {
      setDeleteDialogOpen(false);
      setSymptomToDelete(null);
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <CardTitle className="text-2xl font-bold">Symptoms List</CardTitle>
        <CardDescription className="mt-1 text-indigo-100">Add, edit and manage patient symptoms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Search symptoms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Can I="create" a="symptom" ability={ability}>
              <Button onClick={() => setOpen(true)}>Add Symptom</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setOpenEx(true)}
                      className="p-2"
                    >
                      <Upload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Symptom Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Can>
          </div>
        </div>
        <ExcelUploadModal
          open={openEx}
          setOpen={setOpenEx}
          entity="symptoms"
        />
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table className="w-full">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Symptom Name</TableHead>
                <TableHead>Symptom Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Loading symptoms...
                  </TableCell>
                </TableRow>
              ) : filteredSymptoms.length > 0 ? (
                filteredSymptoms.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-normal max-w-[200px]">{s.name}</TableCell>
                    <TableCell className="whitespace-normal max-w-[150px]">
                      {s.symptomTypeName || "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-normal max-w-[400px]">{s.description}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Can I="update" a="symptom" ability={ability}>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingSymptom(s);
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </Can>
                          <Can I="delete" a="symptom" ability={ability}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(s.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No symptoms found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal */}
        <SymptomModal
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditingSymptom(null);
          }}
          symptomTypes={symptomTypes}
          initialData={editingSymptom ? {
            id: editingSymptom.id,
            name: editingSymptom.name,
            symptomTypeId: editingSymptom.symptomTypeId,
            description: editingSymptom.description,
          } : null}
          onSubmit={handleSave}
        />
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the symptom.
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

