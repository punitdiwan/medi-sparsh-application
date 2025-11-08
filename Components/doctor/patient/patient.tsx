"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import FilterBar from "@/features/filterbar/FilterBar";
import { patientFilters } from "@/features/filterbar/configs/patientFilter";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

import { MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { PaginationControl } from "@/components/pagination";
import { FieldSelectorDropdown } from "@/components/FieldSelectorDropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PatientRegistrationForm from "@/Components/forms/PatientRegistrationFrom";
import { InputOTPForm } from "@/components/model/Otpmodel";

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
};
type TypedColumn<T> = ColumnDef<T> & { accessorKey?: string };

function PatientPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PatientFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpVerifyHandler, setOtpVerifyHandler] = useState<((otp: string) => Promise<void>) | null>(null);

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
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
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
        setLoading(false);
      }
    };

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
        ? item.createdAt?.split("T")[0] === filters.dateCheckIn
        : true;

      const matchesFrequency = (() => {
        if (!filters.frequency) return true;

        const today = new Date();
        const checkInDate = new Date(item.createdAt);
        const diffTime = today.getTime() - checkInDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (filters.frequency === "Daily") return diffDays <= 1;
        if (filters.frequency === "Weekly") return diffDays <= 7;
        if (filters.frequency === "Monthly") return diffDays <= 30;

        return true;
      })();

      return matchesSearch && matchesDate && matchesFrequency;
    });
  }, [filters, patients]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const allColumns: ColumnDef<Patient>[] = [
    { accessorKey: "id", header: "Patient ID" },
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
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
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
      <p className="h-screen flex justify-center items-center text-lg font-medium animate-pulse">
        Getting patients...
      </p>
    );

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Patients</h2>
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
          <Button onClick={() => setIsRegistrationOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <FilterBar fields={patientFilters} onFilter={setFilters} />
      </div>

      <div className="mt-6 text-sm ">
        {filteredData.length === 0 ? (
          <p className="text-muted-foreground mt-4">No patients found.</p>
        ) : (
          <Table data={paginatedData} columns={columns} />
        )}

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

      {/* Patient Registration Dialog */}
      <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <PatientRegistrationForm
            onSuccess={() => {
              setIsRegistrationOpen(false);
              setIsOtpOpen(false);
              // Refresh patient list
              const fetchPatients = async () => {
                try {
                  const response = await fetch("/api/patients");
                  const result = await response.json();
                  if (response.ok && result.success) {
                    setPatients(result.data);
                  }
                } catch (err) {
                  console.error("Error fetching patients:", err);
                }
              };
              fetchPatients();
            }}
            onCancel={() => setIsRegistrationOpen(false)}
            onOtpRequired={(data, verifyHandler) => {
              // Close registration dialog and open OTP dialog
              setIsRegistrationOpen(false);
              setOtpVerifyHandler(() => verifyHandler);
              setIsOtpOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Mobile Number</DialogTitle>
          </DialogHeader>
          <InputOTPForm
            onVerify={async (otp) => {
              if (otpVerifyHandler) {
                await otpVerifyHandler(otp);
              }
            }}
            onClose={() => {
              setIsOtpOpen(false);
              setIsRegistrationOpen(true); // Reopen registration form if OTP is cancelled
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientPage;
