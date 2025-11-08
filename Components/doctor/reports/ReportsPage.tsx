"use client";
import React from 'react'
import Link from 'next/link';
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from '@/components/ui/button';

type Patient = {
  id: number;
  patientId: string;
  patientName: string;
  test: string;
  status: "completed" | "Incomplete";
};

const initialData: Patient[] = [
  {
    id: 1,
    patientId: "P001",
    patientName: "John Doe",
    test: "Blood Test",
    status: "completed",
  },
  {
    id: 2,
    patientId: "P002",
    patientName: "Jane Smith",
    test: "X-Ray",
    status: "Incomplete",
  },
  {
    id: 3,
    patientId: "P003",
    patientName: "Samuel Jackson",
    test: "MRI",
    status: "completed",
  },
  {
    id: 4,
    patientId: "P004",
    patientName: "Emily Johnson",
    test: "ECG",
    status: "Incomplete",
  },
  {
    id: 5,
    patientId: "P005",
    patientName: "Michael Brown",
    test: "CT Scan",
    status: "completed",
  },
  {
    id: 6,
    patientId: "P006",
    patientName: "Linda White",
    test: "Urine Test",
    status: "Incomplete",
  },
];

const columns: ColumnDef<Patient>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "patientId", header: "Patient ID" },
  { accessorKey: "patientName", header: "Patient Name" },
  { accessorKey: "test", header: "Test" },
  { accessorKey: "status", header: "Status" },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`/doctor/patient/profile/${row.original.id}?name=${encodeURIComponent(row.original.patientName)}`}
        className="hover:underline"
      >
        <Button variant="outline" size="sm" className="cursor-pointer">
          View
        </Button>
      </Link>
    ),
  },
];

export default function ReportsPage() {
  return (
    <div className='p-6'>
    <div className="mb-3 flex  justify-between">
      <h1 className="text-xl font-semibold mb-4">Lab Reports</h1>
     <Link href="/doctor/reports/uploadReport">
         <Button>upload reports</Button>     
     </Link>
      </div>

      <div>
      <Table data={initialData} columns={columns} />
    </div>
    </div>
  );
}
