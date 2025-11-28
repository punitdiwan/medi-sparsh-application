"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import { getShortId } from "@/utils/getShortId";
import { useSidebar } from "@/components/ui/sidebar";
import { FaFileDownload } from "react-icons/fa";
import { MdLocalPrintshop } from "react-icons/md";
import { pdf, PDFDownloadLink } from "@react-pdf/renderer";
import { TransactionPDF } from "./TransactionPDF";
import { PaginationControl } from "@/components/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

type OrganizationMetaData = { address?: string; phone?: string; email?: string; };
type Transaction = {
  amount: number;
  appointmentDate: string;
  appointmentId: string;
  appointmentStatus: string;
  appointmentTime: string;
  createdAt: string;
  hospitalId: string;
  patientGender: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  paymentMethod: string;
  status: string;
  transactionId: string;
  orgName: string | null;
  orgLogo: string | null;
  orgMetaData: OrganizationMetaData | null;
  doctorName: string | null;
  doctorQualification: string | null;
  doctorExperience: string | null;
  doctorSpecialization: Array<{ name: string }> | null;
};
type AccessorColumn<T> = ColumnDef<T> & { accessorKey: keyof T };

export default function BillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleFields, setVisibleFields] = useState<string[]>(["patientPhone","patientGender","appointmentDate"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customRange, setCustomRange] = useState<{from: string|null; to: string|null}>({from: null, to: null});

  const { state } = useSidebar();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/transaction");
        const data = await res.json();
        if (!data.success) return toast.error("Failed to load transactions");

        const parsed = data.data.map((t: any) => ({...t, orgMetaData: t.orgMetaData ? JSON.parse(t.orgMetaData) : null}));
        setTransactions(parsed);
      } catch (err) {
        console.error(err);
        toast.error("Error loading transactions");
      }
    };
    load();
  }, []);

  const filteredData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(); startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return transactions.filter((t) => {
      const date = new Date(t.createdAt);
      if (activeTab === "today") return date.toDateString() === today.toDateString();
      if (activeTab === "week") return date >= startOfWeek && date <= today;
      if (activeTab === "month") return date >= startOfMonth && date <= today;
      if (activeTab === "custom" && customRange.from && customRange.to) {
        const from = new Date(customRange.from); const to = new Date(customRange.to);
        return date >= from && date <= to;
      }
      return true;
    });
  }, [transactions, activeTab, customRange]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);
  const {user}= useAuth();

  const exportBulk = () => {
  const doc = new jsPDF();

  const hospitalName = user?.hospital?.name ?? "City Hospital";
  const hospitalAddress = user?.hospital?.metadata?.address ?? "123 Main St.2.0, City, State";
  const hospitalPhone = user?.hospital?.metadata?.phone ?? "+91 9876543210";
  const hospitalEmail = user?.hospital?.metadata?.email ?? "info@cityhospital.com";

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(hospitalName, 14, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Address: ${hospitalAddress}`, 14, 27);
  doc.text(`Phone: ${hospitalPhone}`, 14, 32);
  doc.text(`Email: ${hospitalEmail}`, 14, 37);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${activeTab.toUpperCase()} Transactions`, 14, 45);

  const tableColumn = ["Txn ID", "Patient", "Amount", "Status", "Date"];

  const tableRows = filteredData.map((t) => [
    getShortId(t.transactionId),
    t.patientName,
    `${t.amount}`,
    t.status?.toUpperCase(),
    new Date(t.createdAt).toLocaleDateString(),
  ]);

  const totalAmount = filteredData.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalCount = filteredData.length;

  let finalY = 0;

  autoTable(doc, {
    startY: 50,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [30, 144, 255],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didDrawPage: (data) => {
      if (data.cursor && typeof data.cursor.y === "number") {
        finalY = data.cursor.y;
      }
    },
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Transactions: ${totalCount}`, 14, finalY + 10);
  doc.text(`Total Amount: ${totalAmount}`, 14, finalY + 15);

  doc.save(`transactions_${activeTab}.pdf`);
};




  const baseColumns: AccessorColumn<Transaction>[] = [
  { accessorKey: "transactionId", header: "Transaction ID", cell: ({ row }) => getShortId(row.original.transactionId) },
  { accessorKey: "patientName", header: "Patient Name" },
  { accessorKey: "amount", header: "Amount (₹)", cell: ({ row }) => `₹${row.original.amount}` },
  { accessorKey: "status", header: "Status", cell: ({ row }) => row.original.status?.toUpperCase() },
  { accessorKey: "paymentMethod", header: "Payment" },
];

  const optionalColumns: AccessorColumn<Transaction>[] = [
  { accessorKey: "patientPhone", header: "Phone" },
  { accessorKey: "patientGender", header: "Gender" },
  { accessorKey: "appointmentDate", header: "Appointment Date" },
  { accessorKey: "appointmentTime", header: "Appointment Time" },
];

  const actionsColumn: ColumnDef<Transaction> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const t = row.original;
      const handlePrint = async () => {
        const blob = await pdf(<TransactionPDF transaction={t} />).toBlob();
        const url = URL.createObjectURL(blob);
        const win = window.open(url); win?.print();
      };
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}><MdLocalPrintshop /></Button>
          <PDFDownloadLink document={<TransactionPDF transaction={t} />} fileName={`transaction-${t.transactionId}.pdf`}>
            <Button size="sm" variant="outline"><FaFileDownload/></Button>
          </PDFDownloadLink>
        </div>
      );
    },
  };

  const columns = [
  ...baseColumns,
  ...optionalColumns.filter(c => visibleFields.includes(c.accessorKey as string)),
  actionsColumn
];


  return (
    <div className={`p-6 min-h-screen w-full mx-auto bg-background text-foreground transition-all duration-200 ${state==="collapsed"?"w-[calc(100vw-100px)]":"w-[calc(100vw-60px)] md:w-[calc(100vw-280px)]"}`}>

      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold">Transactions({filteredData.length})</h3>
          <p className="text-sm text-muted-foreground">Manage patient transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val)=>{ setActiveTab(val as typeof activeTab); setCurrentPage(1); }}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {["all","today","week","month","custom"].map(tab=>(
          <TabsContent key={tab} value={tab}>
            {tab==="custom" && (
              <div className="flex flex-wrap gap-4 justify-center mb-4">
                <input type="date" className="border rounded-md p-2" value={customRange.from ?? ""} onChange={e=>setCustomRange(p=>({...p, from:e.target.value}))}/>
                <input type="date" className="border rounded-md p-2" value={customRange.to ?? ""} onChange={e=>setCustomRange(p=>({...p, to:e.target.value}))}/>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <FieldSelectorDropdown columns={optionalColumns} visibleFields={visibleFields} onToggle={(key, checked)=>setVisibleFields(p=>checked?[...p,key]:p.filter(f=>f!==key))}/>
              <div className="flex gap-2">
                <Button onClick={exportBulk}><FaFileDownload/> Download {tab}</Button>
                {/* <Button onClick={exportBulk}><MdLocalPrintshop/> Print {tab}</Button> */}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden bg-background shadow-sm">
              {filteredData.length===0
                ? <p className="text-center p-6 text-muted-foreground">No transactions found.</p>
                : <Table data={paginatedData} columns={columns}/>}
            </div>

            { (
              <div className="flex justify-center mt-4">
                <PaginationControl currentPage={currentPage} totalPages={totalPages} rowsPerPage={rowsPerPage} onPageChange={setCurrentPage} onRowsPerPageChange={val=>{setRowsPerPage(val); setCurrentPage(1);}}/>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
