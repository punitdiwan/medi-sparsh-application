"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Printer,
  FileText,
} from "lucide-react";
import PrescriptionModal from "./prescriptionModelPage";
import { getIPDPrescriptions, deleteIPDPrescription } from "@/app/actions/ipdPrescriptionActions";
import { getDoctors } from "@/lib/actions/doctorActions";
import { toast } from "sonner";

/* ---------------- Types ---------------- */
type Prescription = {
  id: string;
  prescriptionNo: string;
  date: string;
  findings: string;
  doctorName: string | null;
  doctorId: string | null;
  medicines: any;
  notes: string | null;
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

  /* ---------------- Actions ---------------- */
  const handleDelete = async (id: string) => {
    if (confirm("Delete this prescription?")) {
      const res = await deleteIPDPrescription(id, ipdId);
      if (res.success) {
        toast.success("Prescription deleted");
        fetchData();
      } else {
        toast.error("Failed to delete prescription");
      }
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

  const handlePrint = (p: Prescription) => {
    alert(`Print prescription: ${p.prescriptionNo}`);
  };

  return (
    <div className="p-6 space-y-6">
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
        open={open}
        onClose={() => setOpen(false)}
        ipdId={ipdId}
        doctors={doctors}
        editPrescriptionId={editPrescriptionId}
        prescriptions={prescriptions}
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
                      {p.prescriptionNo}
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
                                onClick={() => handlePrint(p)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
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
