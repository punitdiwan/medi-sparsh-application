"use client";

import { useState, useEffect, useMemo } from "react";
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
  Pill,
} from "lucide-react";
import { MedicationDialog } from "./medicationDialog";

/* ---------------- Types ---------------- */
export type Medication = {
  id: string;
  date: string;
  time: string;
  categoryId: string;
  categoryName: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  remarks?: string;
};

/* Dialog input (no id) */
export type MedicationInput = Omit<Medication, "id">;


/* ---------------- Page ---------------- */
export default function MedicationManagerPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);

  /* ---------------- Filter ---------------- */
  const filtered = useMemo(() => {
    if (!search) return medications;
    return medications.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(search.toLowerCase()) ||
        m.categoryName.toLowerCase().includes(search.toLowerCase()) ||
        m.date.includes(search)
    );
  }, [medications, search]);

  /* ---------------- Add / Edit ---------------- */
  const handleSubmit = (data: MedicationInput) => {
  if (editing) {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === editing.id
          ? { ...data, id: m.id }
          : m
      )
    );
  } else {
    setMedications((prev) => [
      ...prev,
      {
        ...data,
        id: crypto.randomUUID(),
      },
    ]);
  }

  setEditing(null);
  setOpen(false);
};


  /* ---------------- Delete ---------------- */
  const handleDelete = (id: string) => {
    if (confirm("Delete this medication?")) {
      setMedications((prev) => prev.filter((m) => m.id !== id));
    }
  };

  /* ---------------- Print ---------------- */
  const handlePrint = (med: Medication) => {
    alert(`Print medication: ${med.medicineName}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog dark:text-white flex items-center gap-2">
            <Pill className="bg-dialog-header text-dialog-icon" />
            Medication
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by medicine / category / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" />
              Add Medication
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Date</TableHead>
                <TableHead className="text-dialog-icon">Time</TableHead>
                <TableHead className="text-dialog-icon">Category</TableHead>
                <TableHead className="text-dialog-icon">Medicine</TableHead>
                <TableHead className="text-dialog-icon">Dosage</TableHead>
                <TableHead className="text-dialog-icon">Remarks</TableHead>
                <TableHead className="text-center text-dialog-icon">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length ? (
                filtered.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="text-dialog-muted">{med.date}</TableCell>
                    <TableCell className="text-dialog-muted">{med.time}</TableCell>
                    <TableCell className="text-dialog-muted">{med.categoryName}</TableCell>
                    <TableCell className="font-medium text-dialog-muted">
                      {med.medicineName}
                    </TableCell>
                    <TableCell className="text-dialog-muted">{med.dosage}</TableCell>
                    <TableCell className="text-dialog-muted">{med.remarks || "—"}</TableCell>
                    <TableCell >
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handlePrint(med)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Print</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditing(med);
                                  setOpen(true);
                                }}
                              >
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
                                onClick={() => handleDelete(med.id)}
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
                    colSpan={7}
                    className="text-center py-6 text-dialog-muted"
                  >
                    No medications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ADD / EDIT MODAL */}
      {open && (
        <MedicationDialog
          open={open}
          defaultValues={editing || undefined}
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
