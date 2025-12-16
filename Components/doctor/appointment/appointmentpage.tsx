"use client";

import { useContext, useEffect, useState } from "react";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { PaginationControl } from "@/components/pagination";
import AppointmentModal from "./AppointmentModal";
import { toast } from "sonner";
import { getShortId } from "@/utils/getShortId";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { AbilityContext } from "@/lib/casl/AbilityContext";
import { Can } from "@casl/react";

type Appointment = {
  id: number;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  status: string;
  patientName?: string;
  contact?: string;
};

export default function AppointmentPage() {
  const [allData, setAllData] = useState<Appointment[]>([]);
  const [filteredData, setFilteredData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState("active");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const ability = useContext(AbilityContext);
  //= FILTER STATES =//
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
      const result = await response.json();

      if (result.success) {
        setAllData(result.data || []);
      } else {
        setAllData([]);
      }
    } catch {
      setAllData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      setCancellingId(appointmentId);
      const response = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        toast.error(result.error || "Failed to cancel");
      }
    } catch {
      toast.error("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  //= UNIFIED FILTER SYSTEM =//
  useEffect(() => {
    let data = [...allData];

    // Status filter
    switch (appointmentFilter) {
      case "active":
        data = data.filter(
          (item) =>
            item.status === "scheduled" || item.status === "confirmed"
        );
        break;
      case "cancelled":
        data = data.filter((item) => item.status === "cancelled");
        break;
      case "closed":
        data = data.filter((item) => item.status === "completed");
        break;
      case "all":
      default:
        break;
    }

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter((item) =>
        Object.entries(item)
          .filter(([key]) => key !== "time")
          .some(([_, value]) =>
            value?.toString().toLowerCase().includes(s)
          )
      );
    }

    // Date
    if (date) {
      data = data.filter((item) => item.date === date);
    }

    setFilteredData(data);
    setCurrentPage(1);
  }, [allData, appointmentFilter, search, date]);

  //= TABLE COLUMNS =//
  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span>{getShortId(row.getValue("id"))}</span>
      ),
    },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "time", header: "Time" },
    { accessorKey: "status", header: "Status" },

    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const ap = row.original;

        return (
          <div className="flex items-center gap-2">
            <Can I="update" a="appointment" ability={ability}>
            {ap.status === "completed" ? (
              <Link
                href={`/doctor/appointment/vistiPatient/${ap.patient_id}?name=${encodeURIComponent(
                  ap.patientName || ""
                )}&appointmentId=${ap.id}&mode=edit`}
              >
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            ) : ap.status === "cancelled" ? (
              <Button variant="outline" size="sm" disabled>
                Visit
              </Button>
            ) : (
              <Link
                href={`/doctor/appointment/vistiPatient/${ap.patient_id}?name=${encodeURIComponent(
                  ap.patientName || ""
                )}&appointmentId=${ap.id}`}
              >
                <Button variant="outline" size="sm">
                  Visit
                </Button>
              </Link>
            )}
            </Can>
            <ConfirmDialog
              title="Cancel Appointment"
              description="Are you sure you want to cancel this appointment?"
              actionLabel="Yes, Cancel"
              onConfirm={() => handleCancelAppointment(ap.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={
                    ap.status === "cancelled" ||
                    ap.status === "completed" ||
                    cancellingId === ap.id
                  }
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="space-y-4 mt-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold">My Appointments</h3>
            <p className="text-sm text-muted-foreground">
              Manage and view patient appointments
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-2 items-center p-4 rounded-xl shadow-sm border bg-card">
          <Input
            placeholder="Search"
            className="w-52"
            onChange={(e) => setSearch(e.target.value)}
          />

          <Input
            type="date"
            className="w-44"
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            value={appointmentFilter}
            onValueChange={setAppointmentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setDate("");
              setAppointmentFilter("active");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 text-sm">
        {loading ? (
          <p className="h-[400px] flex justify-center items-center text-lg font-medium animate-pulse">
            Loading appointments...
          </p>
        ) : filteredData.length === 0 ? (
          <p className="text-muted-foreground mt-4">
            No appointments found.
          </p>
        ) : (
          <>
            <Table data={paginatedData} columns={columns} />

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
          </>
        )}
      </div>

      {/* MODAL */}
      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
