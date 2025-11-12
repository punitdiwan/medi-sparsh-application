"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { getShortId } from "@/utils/getShortId";

type Prescription = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  date: string;
  followUpDate: string | null;
  followUpRequired: boolean;
};

export default function PrescriptionPage() {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch prescriptions from API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/prescriptions");
        const result = await response.json();

        if (result.success) {
          console.log("Precsrip Data",result);
          setData(result.data || []);
        } else {
          console.log("Failed to fetch prescriptions:", result.error);
          setData([]);
        }
      } catch (error) {
        console.log("Error fetching prescriptions:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const columns: ColumnDef<Prescription>[] = [
    {
          accessorKey: "id",
          header: "ID",
          cell: ({ row }) => {
            const id = row.getValue("id") as string;
            return <span>{getShortId(id)}</span>;
          },
        },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "diagnosis", header: "Diagnosis" },
    { 
      accessorKey: "date", 
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString();
      }
    },
    { 
      accessorKey: "followUpDate", 
      header: "Follow-up",
      cell: ({ row }) => {
        if (row.original.followUpRequired && row.original.followUpDate) {
          const date = new Date(row.original.followUpDate);
          return date.toLocaleDateString();
        }
        return "N/A";
      }
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link href={`/doctor/prescription/${row.original.id}`}>
          <Button variant="outline" size="sm" className="cursor-pointer">
            View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
      </div>
      
      {loading ? (
        <p className="text-muted-foreground mt-4">Loading prescriptions...</p>
      ) : data.length === 0 ? (
        <p className="text-muted-foreground mt-4">No prescriptions found.</p>
      ) : (
        <div className="mt-6 text-sm">
          <Table data={data} columns={columns} />
        </div>
      )}
    </div>
  );
}
