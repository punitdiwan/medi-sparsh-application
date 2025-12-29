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
import { PlusCircle, Pill } from "lucide-react";
import { MedicationDialog } from "./medicationDialog";
import clsx from "clsx";

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

/* ================= PAGE ================= */

export default function MedicationManagerPage() {
  const [rows, setRows] = useState<MedicationRow[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  /* ================= ADD DOSE ================= */

  const handleSubmit = (data: {
    date: string;
    categoryName: string;
    medicineName: string;
    time: string;
    dosage: string;
  }) => {
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
          new Date(getValue<string>()).toLocaleDateString(
            "en-GB",
            { day: "2-digit", month: "short", year: "numeric" }
          ),
      },
      {
        header: "Medicine",
        accessorKey: "medicineName",
      },
      ...Array.from({ length: maxDoseCount }).map((_, i) => ({
        header: `Dose ${i + 1}`,
        cell: ({ row }) => {
          const dose = row.original.doses[i];
          if (!dose) return "—";

          return (
            <div className="min-w-[200px] rounded-md bg-muted/40 p-2 space-y-1">
              <p className="text-sm font-medium">
                Time: {dose.time}
              </p>
              <p className="text-sm">{dose.dosage}</p>
              <p className="text-xs text-muted-foreground">
                Created by: {dose.createdBy}
              </p>
            </div>
          );
        },
      })),
    ];
  }, [maxDoseCount]);

  /* ================= TABLE INSTANCE ================= */

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
            <Pill />
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
              className="flex gap-2"
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
                    className={clsx(
                      idx % 2 === 0
                        ? "bg-background"
                        : "bg-muted/40"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 align-top border-b whitespace-nowrap"
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
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
