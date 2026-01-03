"use client";

import { useMemo, useState } from "react";
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
import { MedicationDialog } from "./medicationDialog";
import clsx from "clsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ================= TYPES ================= */

export type Dose = {
  id: string;
  time: string;
  dosage: string;
  createdBy: string;
};

export type MedicationRow = {
  id: string;
  date: string;
  categoryName: string;
  medicineName: string;
  doses: Dose[];
};

type EditPayload = {
  rowId: string;
  dose: Dose;
};
/* ================= PAGE ================= */
const dummyMedicationData: MedicationRow[] = [
  {
    id: "row-1",
    date: "2026-01-02",
    categoryName: "Antibiotic",
    medicineName: "Amoxicillin",
    doses: [
      {
        id: "dose-1",
        time: "08:00 AM",
        dosage: "500 mg",
        createdBy: "Dr. Sharma (1001)",
      },
      {
        id: "dose-2",
        time: "08:00 PM",
        dosage: "500 mg",
        createdBy: "Dr. Sharma (1001)",
      },
    ],
  },
  {
    id: "row-2",
    date: "2026-01-02",
    categoryName: "Pain Killer",
    medicineName: "Paracetamol",
    doses: [
      {
        id: "dose-3",
        time: "09:00 AM",
        dosage: "650 mg",
        createdBy: "Nurse Anita (2003)",
      },
    ],
  },
  {
    id: "row-3",
    date: "2026-01-03",
    categoryName: "Diabetes",
    medicineName: "Metformin",
    doses: [
      {
        id: "dose-4",
        time: "07:30 AM",
        dosage: "500 mg",
        createdBy: "Dr. Mehta (1007)",
      },
      {
        id: "dose-5",
        time: "07:30 PM",
        dosage: "500 mg",
        createdBy: "Dr. Mehta (1007)",
      },
      {
        id: "dose-6",
        time: "11:00 PM",
        dosage: "250 mg",
        createdBy: "Dr. Mehta (1007)",
      },
    ],
  },
  {
    id: "row-4",
    date: "2026-01-03",
    categoryName: "Cardiac",
    medicineName: "Amlodipine",
    doses: [
      {
        id: "dose-7",
        time: "08:30 AM",
        dosage: "5 mg",
        createdBy: "Super Admin (9001)",
      },
    ],
  },
];

export default function MedicationManagerPage() {
  const [rows, setRows] = useState<MedicationRow[]>(dummyMedicationData);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<EditPayload | null>(null);
  /* ================= ADD DOSE ================= */

  const handleSubmit = (data: {
    date: string;
    categoryName: string;
    medicineName: string;
    time: string;
    dosage: string;
  }) => {
    if (editData) {
      // EDIT MODE
      setRows((prev) =>
        prev.map((r) =>
          r.id === editData.rowId
            ? {
                ...r,
                doses: r.doses.map((d) =>
                  d.id === editData.dose.id
                    ? {
                        ...d,
                        time: data.time,
                        dosage: data.dosage,
                      }
                    : d
                ),
              }
            : r
        )
      );
      setEditData(null);
      return;
    }

    // ADD MODE
    setRows((prev) => {
      const existing = prev.find(
        (r) =>
          r.date === data.date &&
          r.medicineName === data.medicineName
      );

      if (existing) {
        return prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                doses: [
                  ...r.doses,
                  {
                    id: crypto.randomUUID(),
                    time: data.time,
                    dosage: data.dosage,
                    createdBy: "Super Admin (9001)",
                  },
                ],
              }
            : r
        );
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          date: data.date,
          categoryName: data.categoryName,
          medicineName: data.medicineName,
          doses: [
            {
              id: crypto.randomUUID(),
              time: data.time,
              dosage: data.dosage,
              createdBy: "Super Admin (9001)",
            },
          ],
        },
      ];
    });
  };

  /* ================= DELETE ================= */

  const deleteDose = (rowId: string, doseId: string) => {
    setRows((prev) =>
      prev
        .map((r) =>
          r.id === rowId
            ? {
                ...r,
                doses: r.doses.filter((d) => d.id !== doseId),
              }
            : r
        )
        .filter((r) => r.doses.length > 0)
    );
  };
  /* ================= FILTER ================= */

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter(
      (r) =>
        r.medicineName.toLowerCase().includes(search.toLowerCase()) ||
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
                  <div className="flex items-end justify-end gap-2 ml-auto">
                    {/* EDIT */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setEditData({
                                rowId: row.original.id,
                                dose,
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
                            onClick={() => deleteDose(row.original.id, dose.id)}
                            className="text-destructive hover:opacity-80"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <p className="text-sm wrap-break-words">{dose.dosage}</p>
              </div>

              
            </div>
          );
        },
      })),
    ];
  }, [maxDoseCount]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* ================= RENDER ================= */

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Pill className="bg-dialog-header text-dialog-icon"/>
            Medication
          </CardTitle>

          <div className="flex gap-2">
            <Input
              placeholder="Search medicine / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />
            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" />
              Add Medication
            </Button>
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
              {table.getRowModel().rows.map((row, idx) => (
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

              {table.getRowModel().rows.length === 0 && (
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
          defaultValues={editData ?? undefined}
        />
      )}
    </div>
  );
}
