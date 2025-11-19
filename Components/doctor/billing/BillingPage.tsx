"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { Table } from "@/components/Table/Table"; 
import { type ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { getShortId } from "@/utils/getShortId";
import { useSidebar } from "@/components/ui/sidebar";
import { FaFileDownload } from "react-icons/fa";
import { MdLocalPrintshop } from "react-icons/md";
type Transaction = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;

  patientName: string | null;
  patientPhone: string | null;
  patientGender: string | null;

  appointmentDate: string | null;
  appointmentTime: string | null;
};


export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[]>([
    "patientPhone",
    "patientGender",
    "appointmentDate",
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(transactions.length / rowsPerPage);

  const paginatedData = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/transaction");
        const data = await res.json();

        if (!data.success) return toast.error("Failed to load transactions");
        console.log("tarnsaction data",data)
        setTransactions(data.data);
      } catch (err) {
        console.error(err);
        toast.error("Error loading transactions");
      }
    };

    load();
  }, []);


  const baseColumns: ColumnDef<Transaction>[] = [
    {
              accessorKey: "transactionId",
              header: "transactionId",
              cell: ({ row }) => {
                const id = row.getValue("transactionId") as string;
                return <span>{getShortId(id)}</span>;
              },
            },
    {
      header: "Patient Name",
      accessorKey: "patientName",
    },
    {
      header: "Amount (₹)",
      accessorKey: "amount",
      cell: ({ row }) => <span className="font-semibold">₹{row.original.amount}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => row.original.status?.toUpperCase(),
    },
    {
      header: "Payment",
      accessorKey: "paymentMethod",
    },
    
  ];

  const actionsColumn: ColumnDef<Transaction> = {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;

      return (
       <div className="flex gap-2">
        <div className="relative group">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/billing/print/${transaction.id}`, "_blank")}
          >
            <MdLocalPrintshop />
          </Button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Print
          </span>
        </div>
        <div className="relative group">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/billing/download/${transaction.id}`, "_blank")}
          >
            <FaFileDownload />
          </Button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Download
          </span>
        </div>
      </div>
      );
    },
  };


 const optionalColumns: ColumnDef<Transaction>[] = [
  { header: "Phone", accessorKey: "patientPhone" },
  { header: "Gender", accessorKey: "patientGender" },
  { header: "Appointment Date", accessorKey: "appointmentDate" },
  { header: "Appointment Time", accessorKey: "appointmentTime" },
];

  const columns: ColumnDef<Transaction>[] = [
  ...baseColumns,
  ...optionalColumns.filter(
    (col): col is ColumnDef<Transaction> & { accessorKey: keyof Transaction } =>
      "accessorKey" in col && visibleFields.includes(col.accessorKey as string)
  ),
  actionsColumn,
];
const { state } = useSidebar();
 const isCollapsed = state === "collapsed";
  return (
    <div className={`px-6 py-8 space-y-6 transition-all duration-200 ${
        isCollapsed
          ? "w-[calc(100vw-100px)]"
          : "w-[calc(100vw-60px)] md:w-[calc(100vw-310px)]"
      }`}>
      <div className="flex justify-between items-center mb-2 px-4">
        <h2 className="text-xl font-semibold">
          Transactions ({transactions.length})
        </h2>

        <FieldSelectorDropdown
          columns={optionalColumns}
          visibleFields={visibleFields}
          onToggle={(key: string, checked: boolean) =>
            setVisibleFields((prev) =>
              checked ? [...prev, key] : prev.filter((f) => f !== key)
            )
          }
        />
      </div>

      <Table data={paginatedData} columns={columns} />
          
      {transactions.length > rowsPerPage && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="flex items-center gap-2">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded-md bg-transparent"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
