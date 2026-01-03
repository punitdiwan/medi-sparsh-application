"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pill, Pencil, Trash2 } from "lucide-react";
import { MedicationDialog, MedicationInput } from "./medicationDialog";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  getIPDMedications,
  addIPDMedication,
  updateIPDMedication,
  deleteIPDMedication,
  getMedicines,
  getMedicineCategories,
  Dose,
} from "@/app/actions/ipdMedicationActions";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "@/Components/doctor/medicine/deleteConfirmationDialog";
import { useDischarge } from "../DischargeContext";

/* ================= TYPES ================= */

export type MedicationRow = {
  id: string;
  date: string;
  categoryName: string | null;
  medicineId: string;
  medicineName: string | null;
  doses: Dose[];
  note: string | null;
};

type EditPayload = {
  rowId: string;
  dose: Dose;
  date: string;
  medicineId: string;
  categoryId: string;
  categoryName: string;
  medicineName: string;
  note: string;
};

type Category = { id: string; name: string };
type Medicine = { id: string; name: string; categoryId: string };

/* ================= PAGE ================= */

export default function MedicationManagerPage({ ipdId }: { ipdId: string }) {
  const { isDischarged } = useDischarge();
  const [rows, setRows] = useState<MedicationRow[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<EditPayload | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ rowId: string; doseId: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, medicinesRes, categoriesRes] = await Promise.all([
        getIPDMedications(ipdId),
        getMedicines(),
        getMedicineCategories(),
      ]);

      if (medRes.success && medRes.data) {
        // Transform data if needed, but it should match mostly
        // @ts-ignore
        setRows(medRes.data.map(item => ({
          ...item,
          doses: item.dose as Dose[]
        })));
      }
      if (medicinesRes.success && medicinesRes.data) {
        setMedicines(medicinesRes.data);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ipdId) {
      fetchData();
    }
  }, [ipdId]);

  /* ================= ADD / EDIT DOSE ================= */

  const handleSubmit = async (data: MedicationInput) => {
    try {
      if (editData) {
        // EDIT MODE
        const res = await updateIPDMedication({
          rowId: editData.rowId,
          doseId: editData.dose.id,
          ipdAdmissionId: ipdId,
          date: data.date,
          medicineId: data.medicineId,
          time: data.time,
          dosage: data.dosage,
          note: data.remarks,
        });

        if (res.success) {
          toast.success("Medication updated successfully");
          setEditData(null);
          setOpen(false);
          fetchData();
        } else {
          toast.error(res.error || "Failed to update medication");
        }
        return;
      }

      // ADD MODE
      const res = await addIPDMedication({
        ipdAdmissionId: ipdId,
        date: data.date,
        medicineId: data.medicineId,
        time: data.time,
        dosage: data.dosage,
        note: data.remarks,
      });

      if (res.success) {
        toast.success("Medication added successfully");
        setOpen(false);
        fetchData();
      } else {
        toast.error(res.error || "Failed to add medication");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  /* ================= DELETE ================= */

  const handleDeleteClick = (rowId: string, doseId: string) => {
    setDeleteInfo({ rowId, doseId });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteInfo) return;

    setIsDeleting(true);
    try {
      const res = await deleteIPDMedication(deleteInfo.rowId, deleteInfo.doseId, ipdId);
      if (res.success) {
        toast.success("Dose deleted successfully");
        fetchData();
        setDeleteDialogOpen(false);
        setDeleteInfo(null);
      } else {
        toast.error(res.error || "Failed to delete dose");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter(
      (r) =>
        (r.medicineName && r.medicineName.toLowerCase().includes(search.toLowerCase())) ||
        r.date.includes(search)
    );
  }, [rows, search]);

  /* ================= MAX DOSE COUNT ================= */

  const maxDoseCount = useMemo(
    () => Math.max(1, ...rows.map((r) => r.doses.length)),
    [rows]
  );

  /* ================= COLUMNS ================= */

  const columns = useMemo<ColumnDef<MedicationRow>[]>(() => {
    return [
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) =>
          new Date(getValue<string>()).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        header: "Medicine",
        accessorKey: "medicineName",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.medicineName}</div>
            <div className="text-xs text-muted-foreground">{row.original.categoryName}</div>
            {row.original.note && (
              <div className="text-xs text-blue-500 mt-1">Note: {row.original.note}</div>
            )}
          </div>
        )
      },
      ...Array.from({ length: maxDoseCount }).map((_, i) => ({
        header: `Dose ${i + 1}`,
        cell: ({ row }: any) => {
          const dose = row.original.doses[i];
          if (!dose) return "—";

          return (
            <div className="w-[180px] rounded-md bg-[#eeeeee] dark:bg-gray-700 border-overview-strong shadow-lg  p-2 flex flex-col justify-between">
              {/* Dose info */}
              <div className="space-y-1 wrap-break-words">
                <div className="flex flex-row">
                  <p className="text-sm font-medium">Time: {dose.time}</p>
                  {/* Buttons */}
                  {!isDischarged && (
                    <div className="flex items-end justify-end gap-2 ml-auto">
                      {/* EDIT */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                // Find category ID for the medicine
                                const medicine = medicines.find(m => m.id === row.original.medicineId);
                                const categoryId = medicine?.categoryId || "";

                                setEditData({
                                  rowId: row.original.id,
                                  dose,
                                  date: row.original.date,
                                  medicineId: row.original.medicineId,
                                  medicineName: row.original.medicineName || "",
                                  categoryId,
                                  categoryName: row.original.categoryName || "",
                                  note: row.original.note || "",
                                });
                                setOpen(true);
                              }}
                              className="text-primary hover:opacity-80"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* DELETE */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleDeleteClick(row.original.id, dose.id)}
                              className="text-destructive hover:opacity-80"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                <p className="text-sm wrap-break-words">{dose.dosage}</p>
              </div>


            </div>
          );
        },
      })),
    ];
  }, [maxDoseCount, medicines]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* ================= RENDER ================= */

  return (
    <div className="py-2 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Pill className="bg-dialog-header text-dialog-icon" />
            Medication
          </CardTitle>

          <div className="flex gap-2">
            <Input
              placeholder="Search medicine / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
            {!isDischarged && (
              <Button
                onClick={() => {
                  setEditData(null);
                  setOpen(true);
                }}
                className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
              >
                <PlusCircle className="h-5 w-5" />
                Add Medication
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="border-dialog bg-dialog-header">
        <CardContent className="p-0">
          <div className="relative max-h-[65vh] overflow-auto scrollbar-show">
            <table className="min-w-max w-full border-collapse text-sm">
              {/* HEADER */}
              <thead className="sticky top-0 z-20 bg-dialog-header">
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {group.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-semibold whitespace-nowrap border-b"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              {/* BODY */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-10">Loading...</td>
                  </tr>
                ) : table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                  // className={clsx(
                  //   idx % 2 === 0 ? "bg-background" : "bg-muted/30"
                  // )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 border-b align-top"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {!loading && table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No medication data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      {open && (
        <MedicationDialog
          open={open}
          onClose={() => {
            setOpen(false);
            setEditData(null);
          }}
          onSubmit={handleSubmit}
          defaultValues={editData ? {
            date: editData.date,
            time: editData.dose.time,
            categoryId: editData.categoryId,
            categoryName: editData.categoryName,
            medicineId: editData.medicineId,
            medicineName: editData.medicineName,
            dosage: editData.dose.dosage,
            remarks: editData.note
          } : undefined}
          medicines={medicines}
          categories={categories}
        />
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Dose"
        description="Are you sure you want to delete this dose? This action cannot be undone."
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
