"use client";

import React, { useMemo, useState, useEffect } from "react";
import { getVitals, createVital, updateVital, deleteVital } from "@/lib/actions/vitals";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreVertical, Upload } from "lucide-react";
import { VitalModal } from "./vitalModel";
import { toast } from "sonner";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { TooltipProvider ,TooltipContent,  TooltipTrigger, Tooltip } from "@/components/ui/tooltip";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";



export type Vital = {
  id: string;
  name: string;
  from: string;
  to: string;
  unit: string;
};

export default function VitalsManager() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openEx, setOpenEx] = useState(false);
  const [editing, setEditing] = useState<Vital | null>(null);
  const [filter, setFilter] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vitalToDelete, setVitalToDelete] = useState<string | null>(null);

  const ability = useAbility();

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const result = await getVitals();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setVitals(result.data?.map(v => ({ ...v, unit: v.vitalsUnit || "" })) || []);
    } catch (error) {
      console.error("Error fetching vitals:", error);
      toast.error("Failed to load vitals");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!filter.trim()) return vitals;
    const q = filter.toLowerCase();
    return vitals.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.unit.toLowerCase().includes(q) ||
        v.from.toLowerCase().includes(q) ||
        (v.to ?? "").toLowerCase().includes(q)
    );
  }, [filter, vitals]);

  const handleSave = async (item: Vital) => {
    try {
      const exists = vitals.some((v) => v.id === item.id);

      let result;
      if (exists) {
        // Update existing vital
        result = await updateVital(item.id, {
          name: item.name,
          unit: item.unit,
          from: item.from,
          to: item.to,
        });
      } else {
        // Create new vital 
        result = await createVital({
          name: item.name,
          unit: item.unit,
          from: item.from,
          to: item.to,
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Vital updated successfully" : "Vital added successfully");
      fetchVitals();
      setEditing(null);
    } catch (error) {
      console.error("Error saving vital:", error);
      toast.error("Failed to save vital");
    }
  };

  const handleDeleteClick = (id: string) => {
    setVitalToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vitalToDelete) return;

    try {
      const result = await deleteVital(vitalToDelete);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setVitals((prev) => prev.filter((v) => v.id !== vitalToDelete));
      toast.success("Vital deleted successfully");
    } catch (error) {
      console.error("Error deleting vital:", error);
      toast.error("Failed to delete vital");
    } finally {
      setDeleteDialogOpen(false);
      setVitalToDelete(null);
    }
  };

  return (
    <Card className="p-4 m-4 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Vitals</CardTitle>
        <CardDescription>
          Manage vitals with their range and unit type.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search + Add */}
        <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
          <Input
            placeholder="Search vitals..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex flex-row flex-wrap items-center gap-3">
            <Can I="create" a="vitals" ability={ability}>
              <Button onClick={() => setOpen(true)}>Add Vital</Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => { console.log("vitals click"); setOpenEx(true); }}
                      className="p-2"
                    >
                      <Upload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Vitals Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Can>
          </div>
        </div>
        <ExcelUploadModal
                open={openEx}
                setOpen={setOpenEx}
                entity="vital"
              />
        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-7 text-muted-foreground"
                  >
                    Loading vitals...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-7 text-muted-foreground"
                  >
                    No vitals found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.from}</TableCell>
                    <TableCell>{v.to ?? "-"}</TableCell>
                    <TableCell>{v.unit}</TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <Can I="update" a="vitals" ability={ability}>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(v);
                                setOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          </Can>
                          <Can I="delete" a="vitals" ability={ability}>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(v.id)}
                            >
                              Delete
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

      {/* Modal */}
      <VitalModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        vital={editing ?? undefined}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vital sign.
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
