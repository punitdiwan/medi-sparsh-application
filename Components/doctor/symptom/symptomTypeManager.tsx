"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { getSymptomTypes, createSymptomType, updateSymptomType, deleteSymptomType } from "@/lib/actions/symptomTypes";

type SymptomType = {
  id: string;
  name: string;
  createdAt?: Date;
  usageCount?: number;
  isUsed?: boolean;
};

export default function SymptomTypeManager() {
  const [symptomTypes, setSymptomTypes] = useState<SymptomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SymptomType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<string | null>(null);
  const [name, setName] = useState("");

  const ability = useAbility();

  useEffect(() => {
    fetchSymptomTypes();
  }, []);

  const fetchSymptomTypes = async () => {
    try {
      setLoading(true);
      const result = await getSymptomTypes();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSymptomTypes(result.data || []);
    } catch (error) {
      console.error("Error fetching symptom types:", error);
      toast.error("Failed to load symptom types");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return symptomTypes;
    const q = search.toLowerCase();
    return symptomTypes.filter((t) => t.name.toLowerCase().includes(q));
  }, [search, symptomTypes]);

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        toast.error("Symptom type name is required");
        return;
      }

      let result;
      if (editing) {
        result = await updateSymptomType(editing.id, { name: name.trim() });
      } else {
        result = await createSymptomType({ name: name.trim() });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(editing ? "Symptom type updated" : "Symptom type added");
      fetchSymptomTypes();
      setOpen(false);
      setEditing(null);
      setName("");
    } catch (error) {
      console.error("Error saving symptom type:", error);
      toast.error("Failed to save symptom type");
    }
  };

  const handleDeleteClick = (id: string) => {
    setTypeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;

    try {
      const result = await deleteSymptomType(typeToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSymptomTypes((prev) => prev.filter((t) => t.id !== typeToDelete));
      toast.success("Symptom type deleted");
    } catch (error) {
      console.error("Error deleting symptom type:", error);
      toast.error("Failed to delete symptom type");
    } finally {
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  const handleOpenModal = (type?: SymptomType) => {
    if (type) {
      setEditing(type);
      setName(type.name);
    } else {
      setEditing(null);
      setName("");
    }
    setOpen(true);
  };

  return (
    <Card className="p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Symptom Types</CardTitle>
        <CardDescription>Manage all symptom types.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search symptom types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Can I="create" a="symptomsType" ability={ability}>
              <Button onClick={() => handleOpenModal()}>Add Symptom Type</Button>
            </Can>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Symptom Type Name</TableHead>
                <TableHead className="w-[120px]">Usage</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Loading symptom types...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No symptom types found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>
                      {type.isUsed ? (
                        <span className="text-sm text-muted-foreground">
                          {type.usageCount} symptom(s)
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not used</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Can I="update" a="symptomsType" ability={ability}>
                            <DropdownMenuItem onClick={() => handleOpenModal(type)}>
                              Edit
                            </DropdownMenuItem>
                          </Can>
                          <Can I="delete" a="symptomsType" ability={ability}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(type.id)}
                              disabled={type.isUsed}
                            >
                              {type.isUsed ? "Delete (In Use)" : "Delete"}
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add/Edit Modal */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editing ? "Edit Symptom Type" : "Add Symptom Type"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editing ? "Update the symptom type name." : "Enter a new symptom type name."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Symptom type name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setOpen(false); setEditing(null); setName(""); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              {editing ? "Update" : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the symptom type.
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
