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
import { MoreVertical, Upload } from "lucide-react";
import { toast } from "sonner";

import MedicineGroupModal, { MedicineGroup } from "./medicineGroupModel";
import { getMedicineGroups, createMedicineGroup, updateMedicineGroup, deleteMedicineGroup } from "@/lib/actions/medicineGroups";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";

export default function MedicineGroupManager() {
  const [groups, setGroups] = useState<MedicineGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [openMg, setOpenMg] = useState(false);
  const [editing, setEditing] = useState<MedicineGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const ability = useAbility();
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const result = await getMedicineGroups();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setGroups(result.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load medicine groups");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [search, groups]);

  const handleSave = async (item: MedicineGroup) => {
    try {
      const exists = groups.some((g) => g.id === item.id);

      let result;
      if (exists) {
        result = await updateMedicineGroup(item.id, { name: item.name });
      } else {
        result = await createMedicineGroup({ name: item.name });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Group updated" : "Group added");
      fetchGroups();
      setEditing(null);
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("Failed to save medicine group");
    }
  };

  const handleDeleteClick = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!groupToDelete) return;

    try {
      const result = await deleteMedicineGroup(groupToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete));
      toast.success("Group deleted");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete medicine group");
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Medicine Group Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Organize medicines into functional groups.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-5">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <Input
            placeholder="Search group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Can I="create" a="medicineGroup" ability={ability}>
              <Button onClick={() => setOpen(true)}>Add Medicine Group</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setOpenMg(true)} className="p-2">
                      <Upload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Medicine Group Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Can>
          </div>
        </div>
        {/* openMg */}

        <ExcelUploadModal
          open={openMg}
          setOpen={setOpenMg}
          entity="medicineGroup"
        />
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead className="w-[120px]">Usage</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Loading groups...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No groups found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>
                      {group.isUsed ? (
                        <span className="text-sm text-muted-foreground">
                          {group.usageCount} medicine(s)
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
                          <Can I="update" a="medicineGroup" ability={ability}>
                            <DropdownMenuItem onClick={() => { setEditing(group); setOpen(true); }}>
                              Edit
                            </DropdownMenuItem>
                          </Can>
                          <Can I="delete" a="medicineGroup" ability={ability}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(group.id)}
                              disabled={group.isUsed}
                            >
                              {group.isUsed ? "Delete (In Use)" : "Delete"}
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

      <MedicineGroupModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        group={editing ?? undefined}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medicine group.
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
