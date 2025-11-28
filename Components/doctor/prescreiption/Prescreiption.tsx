"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { getShortId } from "@/utils/getShortId";
import { PaginationControl } from "@/components/pagination";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileDownload } from "react-icons/fa";
import { MdLocalPrintshop } from "react-icons/md";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState<"today" | "all" | "old">("all");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/prescriptions");
        const result = await response.json();
        if (result.success) setData(result.data || []);
        else setData([]);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = item.date.split("T")[0];
      if (activeTab === "today") return itemDate === todayStr;
      if (activeTab === "old") return itemDate < todayStr;
      return true;
    });
  }, [data, activeTab, todayStr]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const activeCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return filteredData.length; 
  }, [filteredData]);

  const columns: ColumnDef<Prescription>[] = [
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span>{getShortId(row.original.id)}</span> },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "diagnosis", header: "Diagnosis" },
    { accessorKey: "date", header: "Date", cell: ({ row }) => new Date(row.original.date).toLocaleDateString() },
    { accessorKey: "followUpDate", header: "Follow-up", cell: ({ row }) =>
        row.original.followUpRequired && row.original.followUpDate
          ? new Date(row.original.followUpDate).toLocaleDateString()
          : "N/A",
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link href={`/doctor/prescription/${row.original.id}`}>
          <Button variant="outline" size="sm">View</Button>
        </Link>
      ),
    },
  ];

  const generatePDF = (type: "download" | "print") => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Prescriptions`, 14, 20);

    const tableColumn = ["ID", "Patient Name", "Diagnosis", "Date", "Follow-up"];
    const tableRows = filteredData.map((p) => [
      getShortId(p.id),
      p.patientName,
      p.diagnosis,
      new Date(p.date).toLocaleDateString(),
      p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : "N/A",
    ]);

    autoTable(doc, {
      startY: 45, // below header
      head: [["ID", "Patient Name", "Diagnosis", "Date", "Follow-up"]],
      body: filteredData.map((p) => [
        getShortId(p.id),
        p.patientName,
        p.diagnosis,
        new Date(p.date).toLocaleDateString(),
        p.followUpDate ? new Date(p.followUpDate).toLocaleDateString() : "N/A",
      ]),
      headStyles: { fillColor: [30, 144, 255], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { cellWidth: 50 }, 2: { cellWidth: 50 } },
      didDrawCell: (data) => {
        // Highlight today's prescription
        if (data.column.index === 3 && data.cell.raw === todayStr) {
          doc.setFillColor(255, 255, 0); // yellow
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
        }
      },
    });


    if (type === "download") {
      doc.save(`prescriptions_${activeTab}.pdf`);
    } else {
      doc.autoPrint({ variant: "non-conform" });
      doc.output("dataurlnewwindow");
    }
  };

  if (loading)
    return <p className="text-center mt-6 text-muted-foreground">Loading prescriptions...</p>;

  return (
    <div className="p-6 min-h-screen bg-background text-foreground">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold">Prescriptions ({activeCount})</h3>
          <p className="text-sm text-muted-foreground">Manage and view patient prescriptions</p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Button onClick={() => generatePDF("download")}><FaFileDownload/></Button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Download PDF
            </span>
          </div>
          <div className="relative group">
            <Button onClick={() => generatePDF("print")}><MdLocalPrintshop/></Button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Print PDF
            </span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as typeof activeTab); setCurrentPage(1); }}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Prescriptions</TabsTrigger>          
          <TabsTrigger value="today">Today Prescriptions</TabsTrigger>
          <TabsTrigger value="old">Old Prescriptions</TabsTrigger>
        </TabsList>

        {["today", "all", "old"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-xl overflow-hidden bg-background shadow-sm">
              {filteredData.length === 0 ? (
                <p className="text-center p-6 text-muted-foreground">No prescriptions found.</p>
              ) : (
                <Table data={paginatedData} columns={columns} />
              )}
            </div>

            {filteredData.length > rowsPerPage && (
              <div className="flex justify-center mt-4">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={(val) => { setRowsPerPage(val); setCurrentPage(1); }}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
