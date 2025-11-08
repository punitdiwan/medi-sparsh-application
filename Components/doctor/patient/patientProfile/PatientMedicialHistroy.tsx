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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedPrescription.created_at
                  ).toLocaleDateString()}
                </p>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {selectedPrescription.doctor_name || "N/A"}
                </p>
                <p>
                  <strong>Patient:</strong>{" "}
                  {selectedPrescription.patient_name || "N/A"}
                </p>
                <p>
                  <strong>Diagnosis:</strong> {selectedPrescription.diagnosis}
                </p>
                {selectedPrescription.symptoms && (
                  <p className="col-span-2">
                    <strong>Symptoms:</strong> {selectedPrescription.symptoms}
                  </p>
                )}
                <p className="col-span-2">
                  <strong>Notes:</strong> {selectedPrescription.notes || "—"}
                </p>
              </div>

              {/* Medicines Table */}
              {selectedPrescription.medicines &&
                Array.isArray(selectedPrescription.medicines) && (
                  <div>
                    <h3 className="font-semibold mb-2 text-base">Medicines</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-muted">
                          <tr>
                            {Object.keys(selectedPrescription.medicines[0]).map(
                              (key) => (
                                <th
                                  key={key}
                                  className="border px-3 py-2 text-left capitalize"
                                >
                                  {key}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPrescription.medicines.map(
                            (med: any, i: number) => (
                              <tr key={i} className="hover:bg-muted/50">
                                {Object.values(med).map((val, j) => (
                                  <td key={j} className="border px-3 py-2">
                                    {String(val)}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Vitals Table */}
              {selectedPrescription.vitals &&
                typeof selectedPrescription.vitals === "object" && (
                  <div>
                    <h3 className="font-semibold mb-2 text-base">Vitals</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm border-collapse">
                        <tbody>
                          {Object.entries(selectedPrescription.vitals).map(
                            ([key, val]) => (
                              <tr key={key} className="hover:bg-muted/50">
                                <td className="border px-3 py-2 font-medium capitalize">
                                  {key}
                                </td>
                                <td className="border px-3 py-2">
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
