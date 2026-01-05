"use client";

import { useParams } from "next/navigation";
import { createIPDConsultation, getIPDConsultations, deleteIPDConsultation, restoreIPDConsultation } from "@/lib/actions/ipdActions";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { PlusCircle, Pencil, Trash2, UserRound, RotateCcw } from "lucide-react";
import AddConsultantRegisterDialog, {
  ConsultantRegisterInput,
} from "./addConsultantRegisterDialog";
import { useDischarge } from "../DischargeContext";

/* ---------------- Types ---------------- */
export interface ConsultantRegister
  extends ConsultantRegisterInput {
  id: string;
  isDeleted?: boolean;
}

/* ---------------- Page ---------------- */
export default function ConsultantRegisterPage() {
  const { isDischarged } = useDischarge();
  const params = useParams();
  const ipdAdmissionId = params?.id as string;

  const [data, setData] = useState<ConsultantRegister[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<ConsultantRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      if (!ipdAdmissionId) return;
      setLoading(true);
      const result = await getIPDConsultations(ipdAdmissionId, showDeleted);
      if (result.data) {
        const mappedData = result.data.map((item: any) => ({
          id: item.id,
          appliedDate: format(new Date(item.appliedDate), "yyyy-MM-dd"),
          consultantDate: format(new Date(item.consultationDate), "yyyy-MM-dd"),
          consultationTime: format(new Date(item.consultationTime), "HH:mm"),
          consultantDoctorName: item.consultantDoctorName,
          instruction: item.instruction,
          consultantDoctorId: "", // Not returned by getIPDConsultations but needed for type
          isDeleted: item.isDeleted,
        }));
        setData(mappedData);
      }
      setLoading(false);
    };
    fetchData();
  }, [ipdAdmissionId, showDeleted]);

  /* ---------------- Filter ---------------- */
  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter(
      (item) =>
        item.consultantDoctorName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.instruction
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.appliedDate.includes(search) ||
        item.consultantDate.includes(search)
    );
  }, [data, search]);

  /* ---------------- Add / Edit ---------------- */
  const handleSubmit = async (input: ConsultantRegisterInput) => {
    setIsSaving(true);
    try {
      if (editing) {
        // Update logic not requested yet, but we'll update local state for now
        setData((prev) =>
          prev.map((row) =>
            row.id === editing.id
              ? { ...input, id: row.id }
              : row
          )
        );
        toast.success("Register updated locally (Update action not implemented)");
      } else {
        const result = await createIPDConsultation({
          ...input,
          ipdAdmissionId,
        });

        if (result.success) {
          toast.success("Consultant register saved successfully");
          // Refresh data
          const freshData = await getIPDConsultations(ipdAdmissionId);
          if (freshData.data) {
            const mappedData = freshData.data.map((item: any) => ({
              id: item.id,
              appliedDate: format(new Date(item.appliedDate), "yyyy-MM-dd"),
              consultantDate: format(new Date(item.consultationDate), "yyyy-MM-dd"),
              consultationTime: format(new Date(item.consultationTime), "HH:mm"),
              consultantDoctorName: item.consultantDoctorName,
              instruction: item.instruction,
              consultantDoctorId: "",
            }));
            setData(mappedData);
          }
        } else {
          toast.error(result.error || "Failed to save register");
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
      setEditing(null);
      setOpen(false);
    }
  };

  /* ---------------- Delete ---------------- */
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteIPDConsultation(id, ipdAdmissionId);
      if (result.success) {
        toast.success("Consultant register deleted successfully");
        // Refresh data
        const freshData = await getIPDConsultations(ipdAdmissionId, showDeleted);
        if (freshData.data) {
          const mappedData = freshData.data.map((item: any) => ({
            id: item.id,
            appliedDate: format(new Date(item.appliedDate), "yyyy-MM-dd"),
            consultantDate: format(new Date(item.consultationDate), "yyyy-MM-dd"),
            consultationTime: format(new Date(item.consultationTime), "HH:mm"),
            consultantDoctorName: item.consultantDoctorName,
            instruction: item.instruction,
            consultantDoctorId: "",
            isDeleted: item.isDeleted,
          }));
          setData(mappedData);
        }
      } else {
        toast.error(result.error || "Failed to delete register");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    }
  };

  /* ---------------- Restore ---------------- */
  const handleRestore = async (id: string) => {
    try {
      const result = await restoreIPDConsultation(id, ipdAdmissionId);
      if (result.success) {
        toast.success("Consultant register restored successfully");
        // Refresh data
        const freshData = await getIPDConsultations(ipdAdmissionId, showDeleted);
        if (freshData.data) {
          const mappedData = freshData.data.map((item: any) => ({
            id: item.id,
            appliedDate: format(new Date(item.appliedDate), "yyyy-MM-dd"),
            consultantDate: format(new Date(item.consultationDate), "yyyy-MM-dd"),
            consultationTime: format(new Date(item.consultationTime), "HH:mm"),
            consultantDoctorName: item.consultantDoctorName,
            instruction: item.instruction,
            consultantDoctorId: "",
            isDeleted: item.isDeleted,
          }));
          setData(mappedData);
        }
      } else {
        toast.error(result.error || "Failed to restore register");
      }
    } catch (error) {
      toast.error("An error occurred during restoration");
    }
  };

  return (
    <div className="py-2 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <UserRound className="bg-dialog-header text-dialog-icon" />
            Consultant Register
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by doctor / instruction / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />

            <div className="flex items-center space-x-2 bg-background/50 p-2 rounded-lg border border-dialog">
              <Switch
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="show-deleted" className="text-sm font-medium text-dialog cursor-pointer">Show Deleted</Label>
            </div>

            {!isDischarged && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
              >
                <PlusCircle className="h-5 w-5" />
                Add Register
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Applied Date</TableHead>
                <TableHead className="text-dialog-icon">Consultant Date</TableHead>
                <TableHead className="text-dialog-icon">Consultation Time</TableHead>
                <TableHead className="text-dialog-icon">Consultant Doctor</TableHead>
                <TableHead className="text-dialog-icon">Instruction</TableHead>
                <TableHead className="text-center text-dialog-icon">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((row) => (
                  <TableRow key={row.id} className={`odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors`}>
                    <TableCell className="text-dialog-muted">
                      {row.appliedDate}
                    </TableCell>
                    <TableCell className="text-dialog-muted">
                      {row.consultantDate}
                    </TableCell>
                    <TableCell className="text-dialog-muted">
                      {row.consultationTime}
                    </TableCell>
                    <TableCell className="font-medium text-dialog-muted">
                      {row.consultantDoctorName}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate text-dialog-muted">
                      {row.instruction}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          {!row.isDeleted && !isDischarged && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => {
                                    setEditing(row);
                                    setOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          )}

                          {!row.isDeleted && !isDischarged && (
                            <ConfirmDialog
                              trigger={
                                <Button
                                  size="icon"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              title="Delete Consultant Register?"
                              description="Are you sure you want to delete this consultant register? This action will mark it as deleted."
                              actionLabel="Delete"
                              cancelLabel="Cancel"
                              onConfirm={() => handleDelete(row.id)}
                            />
                          )}

                          {row.isDeleted && !isDischarged && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="text-emerald-600 hover:text-emerald-400 font-bold"
                                  onClick={() => handleRestore(row.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No consultant register found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      {open && (
        <AddConsultantRegisterDialog
          open={open}
          isLoading={isSaving}
          initialData={editing || null}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}