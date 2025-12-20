"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/components/Table/Table";

import { useParams } from "next/navigation";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Pill,
  HeartPulse,
  X,
} from "lucide-react"
interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  diagnosis: string;
  symptoms?: string;
  medicines?: any;
  vitals?: any;
  notes?: string;
  created_at: string | Date;
  doctor_name?: string;
  patient_name?: string;
}

export default function PatientMedicalHistory() {
  const [data, setData] = useState<Prescription[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [open, setOpen] = useState(false);

  const params = useParams();
  const { id } = params;
  const PatientId = id;

  const fixedColumns = ["created_at", "diagnosis", "notes"];

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    {
      doctor_name: true,
      patient_name: true,
    }
  );

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!PatientId) return;

      try {
        const response = await fetch(`/api/patients/${PatientId}/prescriptions`);
        const result = await response.json();

        if (result.success) {
          setData(result.data || []);
        } else {
          console.error("Failed to fetch prescriptions:", result.error);
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        setData([]);
      }
    };

    fetchPrescriptions();
  }, [PatientId]);

  const filteredData = data.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.patient_name?.toLowerCase().includes(term) ||
      item.diagnosis?.toLowerCase().includes(term)
    );
  });

  const columns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    { accessorKey: "doctor_name", header: "Doctor" },
    { accessorKey: "patient_name", header: "Patient" },
    { accessorKey: "diagnosis", header: "Diagnosis" },
    { accessorKey: "notes", header: "Notes" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedPrescription(row.original);
            setOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const visibleCols = columns.filter(
    (col) =>
      fixedColumns.includes((col as any).accessorKey) ||
      visibleColumns[(col as any).accessorKey as string] ||
      (col as any).id === "actions"
  );

  return (
    <div className="bg-background shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Search className="text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by Name or Diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[250px]"
          />
        </div>
        <FieldSelectorDropdown
          columns={columns.filter(
            (col) =>
              !fixedColumns.includes((col as any).accessorKey as string) &&
              (col as any).accessorKey !== undefined
          )}
          visibleFields={Object.keys(visibleColumns).filter(
            (key) => visibleColumns[key]
          )}
          onToggle={(key, checked) =>
            setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
          }
          label="Toggle Columns"
          buttonLabel="Columns"
          buttonVariant="outline"
        />
      </div>

      {filteredData.length > 0 ? (
        <Table columns={visibleCols} data={filteredData} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border rounded-md">
          <p className="text-lg font-medium">No medical history available</p>
          <p className="text-sm mt-1">
            This patient doesn't have any recorded prescriptions yet.
          </p>
        </div>
      )}
      {open && selectedPrescription && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-custom-gradient shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Prescription Details
                </h2>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Date */}
                <div className="rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                  shadow-md shadow-slate-900/10 dark:shadow-black/40
                  ring-1 ring-white/40 dark:ring-slate-700
                  hover:shadow-lg ">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedPrescription.created_at).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                {/* Doctor */}
                <div className="rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                  shadow-md shadow-slate-900/10 dark:shadow-black/40
                  ring-1 ring-white/40 dark:ring-slate-700
                  hover:shadow-lg ">
                  <Stethoscope className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs text-slate-500">Doctor</p>
                    <p className="font-medium">
                      {selectedPrescription.doctor_name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Patient */}
                <div className="rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                  shadow-md shadow-slate-900/10 dark:shadow-black/40
                  ring-1 ring-white/40 dark:ring-slate-700
                  hover:shadow-lg ">
                  <User className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-slate-500">Patient</p>
                    <p className="font-medium">
                      {selectedPrescription.patient_name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                  shadow-md shadow-slate-900/10 dark:shadow-black/40
                  ring-1 ring-white/40 dark:ring-slate-700
                  hover:shadow-lg ">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-slate-500">Diagnosis</p>
                    <p className="font-medium">
                      {selectedPrescription.diagnosis}
                    </p>
                  </div>
                </div>

                {/* Symptoms */}
                {selectedPrescription.symptoms && (
                  <div className="col-span-2 rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                    shadow-md shadow-slate-900/10 dark:shadow-black/40
                    ring-1 ring-white/40 dark:ring-slate-700
                    hover:shadow-lg ">
                    <HeartPulse className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="text-xs text-slate-500">Symptoms</p>
                      <p className="font-medium">
                        {selectedPrescription.symptoms}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="col-span-2 rounded-xl bg-white/80 border dark:bg-slate-800/80 p-4 flex gap-3 items-start
                  shadow-md shadow-slate-900/10 dark:shadow-black/40
                  ring-1 ring-white/40 dark:ring-slate-700
                  hover:shadow-lg ">
                  <FileText className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="font-medium">
                      {selectedPrescription.notes || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicines */}
              {Array.isArray(selectedPrescription.medicines) && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                    <Pill className="h-5 w-5 text-indigo-500" />
                    Medicines
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <table className="w-full text-sm">
                      <thead className="bg-indigo-50 dark:bg-slate-800">
                        <tr>
                          {Object.keys(selectedPrescription.medicines[0]).map(
                            (key) => (
                              <th
                                key={key}
                                className="px-4 py-2 text-left font-medium capitalize"
                              >
                                {key}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPrescription.medicines.map((med: any, i: number) => (
                          <tr
                            key={i}
                            className="border-t border-slate-200 dark:border-slate-700 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                          >
                            {Object.values(med).map((val, j) => (
                              <td key={j} className="px-4 py-2">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vitals */}
              {selectedPrescription.vitals && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                    <HeartPulse className="h-5 w-5 text-rose-500" />
                    Vitals
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <table className="w-full text-sm">
                      <tbody>
                        {Object.entries(selectedPrescription.vitals).map(
                          ([key, val]) => (
                            <tr
                              key={key}
                              className="border-t border-slate-200 dark:border-slate-700"
                            >
                              <td className="px-4 py-2 font-medium capitalize">
                                {key}
                              </td>
                              <td className="px-4 py-2">
                                {String(val)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
