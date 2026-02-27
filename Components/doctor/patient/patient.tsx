"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useContext } from "react";
import FilterBar from "@/features/filterbar/FilterBar";
import { patientFilters } from "@/features/filterbar/configs/patientFilter";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { UserPlus, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Can } from "@casl/react"
import { MdDelete, MdRestore } from "react-icons/md";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { PaginationControl } from "@/components/pagination";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FaFileDownload } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";

import PatientRegistrationForm from "@/Components/forms/PatientRegistrationFrom";
import { InputOTPForm } from "@/components/model/Otpmodel";
import HoneycombLoader from "@/components/HoneycombLoader";
import { getShortId } from "@/utils/getShortId";
import AddPatientDialog from "./AddPatientDialog";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Input } from "@/components/ui/input";

type Patient = {
  id: string;
  name: string;
  mobileNumber: string;
  gender: string;
  city: string;
  createdAt: string;
  isDeleted?: boolean;
};

type PatientFilters = {
  search?: string;
  dateCheckIn?: string;
  visitPurpose?: "Consultation" | "Follow-up" | "Emergency";
  frequency?: "Daily" | "Weekly" | "Monthly";
  isDeleted?: string;
};
type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [open, setOpen] = useState(false);
  const ability = useAbility();
  const { state } = useSidebar();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [customRange, setCustomRange] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const [visibleFields, setVisibleFields] = useState<string[]>([
    "name",
    "mobileNumber",
    "gender",
    "createdAt",
  ]);
  useEffect(() => {
    const saved = localStorage.getItem("visiblePatientFields");
    if (saved) setVisibleFields(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("visiblePatientFields", JSON.stringify(visibleFields));
  }, [visibleFields]);

  const fetchPatients = async (opts?: { initial?: boolean }) => {
    if (opts?.initial) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await fetch("/api/patients");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch patients");
      }
      setPatients(result.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      toast.error("Failed to load patients");
    } finally {
      if (opts?.initial) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPatients({ initial: true });
  }, []);


  const filteredData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return patients.filter((item) => {
      const date = new Date(item.createdAt);

      const matchesSearch = filters.search
        ? item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.mobileNumber?.toString().includes(filters.search) ||
        item.id?.toString().includes(filters.search)
        : true;

      let matchesDate = true;
      if (activeTab === "all") matchesDate = true;
      else if (activeTab === "today") matchesDate = date.toDateString() === today.toDateString();
      else if (activeTab === "week") matchesDate = date >= startOfWeek && date <= today;
      else if (activeTab === "month") matchesDate = date >= startOfMonth && date <= today;
      else if (activeTab === "custom") {
        if (!customRange.from || !customRange.to) matchesDate = true; // Show all if range not set? or none? Billing shows none.
        else {
          const from = new Date(customRange.from);
          const to = new Date(customRange.to);
          matchesDate = date >= from && date <= to;
        }
      }

      const matchesDeleted =
        filters.isDeleted === "true"
          ? item.isDeleted === true
          : filters.isDeleted === "false"
            ? item.isDeleted !== true
            : item.isDeleted !== true;

      return matchesSearch && matchesDate && matchesDeleted;
    });
  }, [filters, patients, activeTab, customRange]);

  const exportBulk = () => {
    const doc = new jsPDF();
    const hospitalName = user?.hospital?.name ?? "Hospital";
    const hospitalAddress = user?.hospital?.metadata?.address ?? "";
    const hospitalPhone = user?.hospital?.metadata?.phone ?? "";
    const hospitalEmail = user?.hospital?.metadata?.email ?? "";

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
    doc.text(`${activeTab.toUpperCase()} Patients Report`, 14, 45);

    const tableColumn = ["ID", "Name", "Number", "Gender", "City", "Date"];
    const tableRows = filteredData.map((p) => [
      getShortId(p.id),
      p.name,
      p.mobileNumber,
      p.gender,
      p.city,
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [30, 144, 255], textColor: 255, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 10, valign: "middle" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`patients_${activeTab}.pdf`);
  };


  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const allColumns: ColumnDef<Patient>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return <span>{getShortId(id)}</span>;
      },
    },
    { accessorKey: "name", header: "Patient Name" },
    { accessorKey: "mobileNumber", header: "Number" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "city", header: "City" },
    {
      accessorKey: "createdAt",
      header: "Registered Date",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex gap-2 ">
          <Link
            href={`/doctor/patient/profile/${row.original.id
              }?name=${encodeURIComponent(row.original.name)}`}
          >
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Can I="delete" a="patient" ability={ability}>
            {row.original.isDeleted !== true ?
              (<ConfirmDialog
                trigger={
                  <Button variant="destructive" size="icon">
                    <MdDelete />
                  </Button>
                }
                title="Are you absolutely sure?"
                description="This will soft delete this patient."
                actionLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={async () => {
                  try {
                    const response = await fetch(`/api/patients/${row.original.id}`, {
                      method: "DELETE",
                    });
                    const result = await response.json();

                    if (!response.ok || !result.success) {
                      toast.error(result.error || "Cannot delete patient");
                      return;
                    }


                    // Refresh the patient list to show updated status
                    await fetchPatients();
                    toast.success("Patient deleted successfully!");
                  } catch (err) {
                    console.error("Error deleting patient:", err);
                    toast.error(err instanceof Error ? err.message : "Failed to delete patient");
                  }
                }}
              />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                    >
                      <MdRestore className="text-green-500" />
                    </Button>
                  }
                  title="Restore Patient"
                  description="Are you sure you want to restore this patient? This will make the patient record active again."
                  actionLabel="Restore"
                  onConfirm={async () => {
                    try {
                      const response = await fetch(`/api/patients/${row.original.id}`, {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ isDeleted: false }),
                      });
                      const result = await response.json();

                      if (!response.ok || !result.success) {
                        toast.error(result.error || "Failed to restore patient");
                        return;
                      }

                      await fetchPatients();
                      toast.success("Patient restored successfully!");
                    } catch (err) {
                      console.error("Error restoring patient:", err);
                      toast.error(err instanceof Error ? err.message : "Failed to restore patient");
                    }
                  }}
                />
              )
            }
          </Can>
        </div>
      ),
    },
  ];

  const columns = allColumns.filter((col) => {
    const key = "accessorKey" in col ? col.accessorKey : undefined;
    return (
      col.id === "action" || (key && visibleFields.includes(key as string))
    );
  });

  if (initialLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <HoneycombLoader />
      </div>
    );

  return (
    <div className={`bg-background text-foreground min-h-screen p-6 transition-all duration-200 ${state === "collapsed" ? "w-[calc(100vw-100px)]" : "w-[calc(100vw-60px)] md:w-[calc(100vw-280px)]"}`}>
      <Card className="bg-Module-header text-white shadow-lg p-2 mb-2">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-7 w-7" />
              Patients
            </CardTitle>
            <p className="text-sm text-indigo-100 mt-1">
              Manage and view patients
            </p>
            <p className="text-sm text-indigo-100 mt-1">
              Total Patients: <span className="font-medium">({patients.length})</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <FieldSelectorDropdown
              columns={allColumns.filter(col => col.id !== "action") as TypedColumn<Patient>[]}
              visibleFields={visibleFields}
              onToggle={(key: string, checked: boolean) => {
                setVisibleFields((prev) =>
                  checked ? [...prev, key] : prev.filter((f) => f !== key)
                );
              }}
            />
            <Can I="create" a="patient" ability={ability}>
              <AddPatientDialog onPatientAdded={fetchPatients} />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(true)}
                      className="p-2 bg-white/20 border-white/20 text-gray-300 hover:bg-indigo-50"
                    >
                      <Upload className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload Patients Excel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Can>
          </div>
        </CardHeader>
      </Card>
      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as typeof activeTab); setCurrentPage(1); }}>
        <div className="flex justify-between items-center bg-background p-2 rounded-lg shadow-sm">
          <TabsList className="">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <div className="flex gap-4 items-center">
            {activeTab === "custom" && (
              <div className="flex gap-2">
                <Input type="date" className="h-9 w-40" value={customRange.from ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomRange(p => ({ ...p, from: e.target.value }))} />
                <Input type="date" className="h-9 w-40" value={customRange.to ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomRange(p => ({ ...p, to: e.target.value }))} />
              </div>
            )}
            {activeTab !== "all" && (
              <Button onClick={exportBulk} className="flex gap-2">
                <FaFileDownload /> Download PDF
              </Button>
            )}
          </div>
        </div>

        <ExcelUploadModal
          open={open}
          setOpen={setOpen}
          entity="patient"
        />

        <div>
          <FilterBar fields={patientFilters} onFilter={setFilters} />
        </div>

        {["all", "today", "week", "month", "custom"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-2">
            <div className="text-sm">
              <Table data={paginatedData} columns={columns} fallback={"No patient found"} />

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
          </TabsContent>
        ))}
      </Tabs>

    </div>
  );
}

export default PatientPage;
