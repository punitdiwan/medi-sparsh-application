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
import { useAuth } from "@/context/AuthContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [activeTab, setActiveTab] = useState<"today" | "all" | "week" | "custom">("all");

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

  const filteredData = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const weekStart = new Date();
    weekStart.setDate(today.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    return data.filter((item) => {
      const itemDate = item.date.split("T")[0];

      if (activeTab === "today") return itemDate === todayStr;

      if (activeTab === "week") {
        return itemDate >= weekStartStr && itemDate <= todayStr;
      }

      if (activeTab === "custom") {
        if (!customFrom || !customTo) return true;
        return itemDate >= customFrom && itemDate <= customTo;
      }

      return true; 
    });
  }, [data, activeTab, customFrom, customTo]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const activeCount = filteredData.length;

  const columns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span>{getShortId(row.original.id)}</span>,
    },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "diagnosis", header: "Diagnosis" },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: "followUpDate",
      header: "Follow-up",
      cell: ({ row }) =>
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
  const { user } = useAuth();
  const generatePDF = (type: "download" | "print") => {
    const doc = new jsPDF();

    const hospitalName =
      user?.hospital?.name ?? "City Hospital";
    const hospitalAddress =
      user?.hospital?.metadata?.address ??
      "123 Main St, City, State";
    const hospitalPhone =
      user?.hospital?.metadata?.phone ?? "+91 9876543210";
    const hospitalEmail =
      user?.hospital?.metadata?.email ?? "info@cityhospital.com";

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(hospitalName, 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Address: ${hospitalAddress}`, 14, 27);
    doc.text(`Phone: ${hospitalPhone}`, 14, 32);
    doc.text(`Email: ${hospitalEmail}`, 14, 37);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeTab.toUpperCase()} Prescriptions`, 14, 45);

    // Table rows
    const rows = filteredData.map((p) => [
      getShortId(p.id),
      p.patientName,
      p.diagnosis,
      new Date(p.date).toLocaleDateString(),
      p.followUpDate
        ? new Date(p.followUpDate).toLocaleDateString()
        : "N/A",
    ]);

    let finalY = 0;

    autoTable(doc, {
      startY: 50,
      head: [["ID", "Patient", "Diagnosis", "Date", "Follow-up"]],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 144, 255],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: (data) => {
        if (data.cursor && typeof data.cursor.y === "number") {
          finalY = data.cursor.y;
        }
      },
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Records: ${filteredData.length}`, 14, finalY + 10);

    if (type === "download") doc.save(`prescriptions_${activeTab}.pdf`);
    else {
      doc.autoPrint();
      doc.output("dataurlnewwindow");
    }
  };
  const getButtonLabel = () => {
    switch (activeTab) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "custom":
        return "Custom Range";
      default:
        return "All";
    }
  };


  if (loading)
    return (
      <p className="text-center mt-6 text-muted-foreground">
        Loading prescriptions...
      </p>
    );

  return (
    <div className="p-6 mt-2 min-h-screen bg-background text-foreground">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold">
            Prescriptions ({activeCount})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage and view patient prescriptions
          </p>
        </div>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => generatePDF("download")}>
                <FaFileDownload />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download {getButtonLabel()}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => generatePDF("print")}>
                <MdLocalPrintshop />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Print {getButtonLabel()}</p>
            </TooltipContent>
          </Tooltip>
        </div>

      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as typeof activeTab);
          setCurrentPage(1);
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {["today", "all", "week"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-xl overflow-hidden bg-background shadow-sm">
              {filteredData.length === 0 ? (
                <p className="text-center p-6 text-muted-foreground">No prescriptions found.</p>
              ) : (
                <Table data={paginatedData} columns={columns} />
              )}
            </div>

            {(
              <div className="flex justify-center mt-4">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={(val) => {
                    setRowsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </TabsContent>
        ))}

        {/* CUSTOM FILTER */}
        <TabsContent value="custom">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground">From</label>
              <input
                type="date"
                className="border rounded p-2"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground">To</label>
              <input
                type="date"
                className="border rounded p-2"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden bg-background shadow-sm">
            {filteredData.length === 0 ? (
              <p className="text-center p-6 text-muted-foreground">
                No prescriptions found.
              </p>
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
                onRowsPerPageChange={(val) => {
                  setRowsPerPage(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
