"use client";

import { useState, useMemo, useEffect } from "react";
import {Card,CardHeader,CardTitle,CardContent,} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader,  TableRow,  TableHead,  TableCell,  TableBody,} from "@/components/ui/table";
import {  Tooltip,  TooltipTrigger,  TooltipContent,  TooltipProvider,} from "@/components/ui/tooltip";
import {  PlusCircle,  Pencil,  Trash2,   FileText,} from "lucide-react";
import PrescriptionModal from "./prescriptionModelPage";
import { getIPDPrescriptions, deleteIPDPrescription } from "@/app/actions/ipdPrescriptionActions";
import { getDoctors } from "@/lib/actions/doctorActions";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/Components/doctor/medicine/deleteConfirmationDialog";
import { PrescriptionViewDialog } from "./prescriptionViewDialog";
import { getShortId } from "@/utils/getShortId";

/* ---------------- Types ---------------- */
export type Prescription = {
  id: string;
  prescriptionNo: string;
  date: Date;
  doctorId: string;
  doctorName: string;
  findings: string;
  notes: string;
  medicines: {
    name: string;
    category: string;
    frequency: string;
    duration: string;
    timing: string;
    instruction?: string;
  }[];
};


type Doctor = {
  id: string;
  name: string | null;
};

/* ---------------- Page ---------------- */
export default function IPDPrescriptionPage({ ipdId }: { ipdId: string }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editPrescriptionId, setEditPrescriptionId] = useState<string | undefined>(undefined);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    const [prescriptionsRes, doctorsRes] = await Promise.all([
      getIPDPrescriptions(ipdId),
      getDoctors(),
    ]);

    if (prescriptionsRes.success && prescriptionsRes.data) {
      // @ts-ignore
      setPrescriptions(prescriptionsRes.data);
    }
    if (doctorsRes.data) {
      // @ts-ignore
      setDoctors(doctorsRes.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ipdId, open]); // Refetch when modal closes (saved)

  /* ---------------- Filter ---------------- */
  const filtered = useMemo(() => {
    if (!search) return prescriptions;
    return prescriptions.filter(
      (p) =>
        p.prescriptionNo.toLowerCase().includes(search.toLowerCase()) ||
        (p.findings && p.findings.toLowerCase().includes(search.toLowerCase())) ||
        (p.date && new Date(p.date).toLocaleDateString().includes(search))
    );
  }, [prescriptions, search]);


  const handleView = (p: Prescription) => {
    setViewPrescription(p);
    setViewOpen(true);
  };

  /* ---------------- Actions ---------------- */
  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const res = await deleteIPDPrescription(deleteId, ipdId);
    setIsDeleting(false);

    if (res.success) {
      toast.success("Prescription deleted");
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchData();
    } else {
      toast.error("Failed to delete prescription");
    }
  };

  const handleEdit = (id: string) => {
    setEditPrescriptionId(id);
    setOpen(true);
  };

  const handleAdd = () => {
    setEditPrescriptionId(undefined);
    setOpen(true);
  };

  return (
    <div className="py-2 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog dark:text-white flex items-center gap-2">
            <FileText className="text-dialog-icon" />
            Prescription
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by prescription / findings / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
            <Button className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
              onClick={handleAdd}>
              <PlusCircle className="h-5 w-5" />
              Add Prescription
            </Button>
          </div>
        </CardHeader>
      </Card>
      <PrescriptionModal
        key={editPrescriptionId ?? "add"}
        open={open}
        onClose={() => setOpen(false)}
        ipdId={ipdId}
        doctors={doctors}
        editPrescriptionId={editPrescriptionId}
        prescriptions={prescriptions}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Prescription"
        description="Are you sure you want to delete this prescription? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />

      <PrescriptionViewDialog
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewPrescription(null);
        }}
        data={viewPrescription}
      />

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">
                  Prescription No.
                </TableHead>
                <TableHead className="text-dialog-icon">Date</TableHead>
                <TableHead className="text-dialog-icon">Findings</TableHead>
                <TableHead className="text-center text-dialog-icon">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length ? (
                filtered.map((p) => (
                  <TableRow key={p.id} className="odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors ">
                    <TableCell className="font-medium text-dialog-muted">
                      {getShortId(p.prescriptionNo)}
                    </TableCell>
                    <TableCell className="text-dialog-muted">
                      {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-dialog-muted">
                      {p.findings}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleView(p)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" onClick={() => handleEdit(p.id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-dialog-muted"
                  >
                    No prescriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
