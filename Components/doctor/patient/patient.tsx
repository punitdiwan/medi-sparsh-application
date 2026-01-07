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
import { MdDelete,MdRestore } from "react-icons/md";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { PaginationControl } from "@/components/pagination";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";

import PatientRegistrationForm from "@/Components/forms/PatientRegistrationFrom";
import { InputOTPForm } from "@/components/model/Otpmodel";
import HoneycombLoader from "@/components/HoneycombLoader";
import { getShortId } from "@/utils/getShortId";
import AddPatientDialog from "./AddPatientDialog";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { AbilityContext } from "@/lib/casl/AbilityContext";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationDialog } from "../medicine/deleteConfirmationDialog";
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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [open, setOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const ability = useAbility();

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
const fetchPatients = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/patients");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Failed to fetch patients");
    }
    console.log("Fetched patients:", result.data);
    setPatients(result.data);
  } catch (err) {
    console.error("Error fetching patients:", err);
    toast.error("Failed to load patients");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPatients();
}, []);


  const filteredData = useMemo(() => {
    return patients.filter((item) => {
      const matchesSearch = filters.search
        ? item.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.mobileNumber?.toString().includes(filters.search) ||
          item.id?.toString().includes(filters.search)
        : true;

      const matchesDate = filters.dateCheckIn
        ? new Date(item.createdAt).toLocaleDateString("en-CA") === filters.dateCheckIn
        : true;

      const matchesFrequency = (() => {
        if (!filters.frequency) return true;

        const today = new Date();
        const checkInDate = new Date(item.createdAt);
        const diffDays =
          (today.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24);

        if (filters.frequency === "Daily") return diffDays <= 1;
        if (filters.frequency === "Weekly") return diffDays <= 7;
        if (filters.frequency === "Monthly") return diffDays <= 30;

        return true;
      })();

      const matchesDeleted =
        filters.isDeleted === "true"
          ? item.isDeleted === true
          : filters.isDeleted === "false"
          ? item.isDeleted !== true
          : true;

      return matchesSearch && matchesDate && matchesFrequency && matchesDeleted;
    });
  }, [filters, patients]);


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
            href={`/doctor/patient/profile/${
              row.original.id
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
                      throw new Error(result.error || "Failed to delete patient");
                    }

                    setPatients((prev) =>
                      prev.filter((p) => p.id !== row.original.id)
                    );
                    toast.success("Patient deleted successfully!");
                  } catch (err) {
                    console.error("Error deleting patient:", err);
                    toast.error(err instanceof Error ? err.message : "Failed to delete patient");
                  }
                }}
              />
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setRestoreDialogOpen(true)}
                      >
                        <MdRestore className="text-green-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restore Patient</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>)
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
              <HoneycombLoader />
      </div>
    );

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <Card className="bg-Module-header text-white shadow-lg mb-6">
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
              columns={allColumns as TypedColumn<Patient>[]}
              visibleFields={visibleFields}
              onToggle={(key, checked) => {
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
      <div className="mt-2">
        <FilterBar fields={patientFilters} onFilter={setFilters} />
      </div>
      <ExcelUploadModal
        open={open}
        setOpen={setOpen}
        entity="patient"
      />

      <div className="mt-6 text-sm ">
        
          <Table data={paginatedData} columns={columns} fallback={"No patient found"}/>

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

        <DeleteConfirmationDialog
          open={restoreDialogOpen}
          onOpenChange={setRestoreDialogOpen}
          title="Restore Patient"
          description="Are you sure you want to restore this patient? This action cannot be undone."
          onConfirm={()=>{
            console.log("Restore action confirmed");
            setRestoreDialogOpen(false);
          }}
          isLoading={loading}
        />

      </div>

    </div>
  );
}

export default PatientPage;
