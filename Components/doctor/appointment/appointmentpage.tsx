"use client";

import { useEffect, useState } from "react";
import FilterBar from "@/features/filterbar/FilterBar";
import { appointmentFilters } from "@/features/filterbar/configs/appointmentFilters";
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
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { PaginationControl } from "@/components/pagination";
import AppointmentModal from "./AppointmentModal";
import { toast } from "sonner";
import { getShortId } from "@/utils/getShortId";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

type Appointment = {
  id: number;
  patient_id: string;
  doctor_id: string;
  purpose: string;
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
  const [appointmentFilter, setAppointmentFilter] = useState<string>("active");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
      const result = await response.json();

      if (result.success) {
        setAllData(result.data || []);
        setFilteredData(result.data || []);
      } else {
        console.error("Failed to fetch appointments:", result.error);
        setAllData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAllData([]);
      setFilteredData([]);
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
        fetchAppointments(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return <span>{getShortId(id)}</span>;
      },
    },
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "purpose", header: "Purpose" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "time", header: "Time" },
    { accessorKey: "status", header: "Status" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => {
        const appointment = row.original;

        return (
          <div className="flex items-center gap-2">
            {/* Visit / Edit Button */}
            {appointment.status === "completed" ? (
              <Link
                href={`/doctor/appointment/vistiPatient/${appointment.patient_id}?name=${encodeURIComponent(
                  appointment.patientName || ""
                )}&appointmentId=${appointment.id}&mode=edit`}
              >
                <Button variant="outline" size="sm">Edit</Button>
              </Link>

            ) : appointment.status === "cancelled" ? (
              <Button variant="outline" size="sm" disabled>
                Visit
              </Button>
            ) : (
              <Link
                href={`/doctor/appointment/vistiPatient/${appointment.patient_id}?name=${encodeURIComponent(
                  appointment.patientName || ""
                )}&appointmentId=${appointment.id}`}
              >
                <Button variant="outline" size="sm">
                  Visit
                </Button>
              </Link>
            )}

            {/* Cancel Button */}
            <ConfirmDialog
              title="Cancel Appointment"
              description="Are you sure you want to cancel this appointment? This action cannot be undone."
              actionLabel="Yes, Cancel"
              cancelLabel="No"
              onConfirm={() => handleCancelAppointment(appointment.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={
                    cancellingId === appointment.id ||
                    appointment.status === "cancelled" ||
                    appointment.status === "completed"
                  }
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        );
      },
    }



  ];

  // Filter appointments based on appointment type
  useEffect(() => {
    let filtered = allData;

    switch (appointmentFilter) {
      case "active":
        // Active: scheduled and confirmed appointments
        filtered = allData.filter((item) =>
          item.status === "scheduled" || item.status === "confirmed"
        );
        break;
      case "cancelled":
        filtered = allData.filter((item) => item.status === "cancelled");
        break;
      case "closed":
        // Closed: completed appointments
        filtered = allData.filter((item) => item.status === "completed");
        break;
      case "all":
        filtered = allData;
        break;
      default:
        filtered = allData.filter((item) =>
          item.status === "scheduled" || item.status === "confirmed"
        );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [appointmentFilter, allData]);

  const handleFilter = (appliedFilters: Record<string, string>) => {
    // First filter by appointment type
    let statusFiltered = allData;

    switch (appointmentFilter) {
      case "active":
        statusFiltered = allData.filter((item) =>
          item.status === "scheduled" || item.status === "confirmed"
        );
        break;
      case "cancelled":
        statusFiltered = allData.filter((item) => item.status === "cancelled");
        break;
      case "closed":
        statusFiltered = allData.filter((item) => item.status === "completed");
        break;
      case "all":
        statusFiltered = allData;
        break;
      default:
        statusFiltered = allData.filter((item) =>
          item.status === "scheduled" || item.status === "confirmed"
        );
    }

    // Then apply other filters
    const filtered = statusFiltered.filter((item) => {
      const matchesSearch = appliedFilters.search
        ? item.patientName
          ?.toLowerCase()
          .includes(appliedFilters.search.toLowerCase()) ||
        item.id.toString() === appliedFilters.search
        : true;

      const matchesDate = appliedFilters.date
        ? item.date === appliedFilters.date
        : true;

      const matchesType = appliedFilters.appointmentType
        ? item.purpose?.toLowerCase() ===
        appliedFilters.appointmentType.toLowerCase()
        : true;

      return matchesSearch && matchesDate && matchesType;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Appointments</h2>

          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="btn-theme">
            <UserPlus className="mr-2 h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center p-4 rounded-xl shadow-sm border bg-card">
          {appointmentFilters.map((field) => {
            switch (field.type) {
              case "text":
                return (
                  <Input
                    key={field.key}
                    placeholder={field.placeholder || field.label}
                    className="w-52"
                    onChange={(e) => handleFilter({ [field.key]: e.target.value })}
                  />
                );
              case "date":
                return (
                  <Input
                    key={field.key}
                    type="date"
                    className="w-44"
                    onChange={(e) => handleFilter({ [field.key]: e.target.value })}
                  />
                );
              default:
                return null;
            }
          })}

          <Select
            value={appointmentFilter}
            onValueChange={setAppointmentFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleFilter({})}>
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-6 text-sm">
        {loading ? (
          <p className="h-[400px] flex justify-center items-center text-lg font-medium animate-pulse">Loading appointments...</p>
        ) : filteredData.length === 0 ? (
          <p className="text-muted-foreground mt-4">No appointments found.</p>
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

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
