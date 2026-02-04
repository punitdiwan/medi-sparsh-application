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
import { Eye, Pencil, UserPlus, X, Calendar } from "lucide-react";
import { FaShareSquare } from "react-icons/fa";
import { FaPrescription } from "react-icons/fa6";
import { PaginationControl } from "@/components/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppointmentModal from "./AppointmentModal";
import { toast } from "sonner";
import { getShortId } from "@/utils/getShortId";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

import { Can } from "@casl/react";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AppointmentCard } from "./AppointmentCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export type Appointment = {
  id: number;
  patient_id: string;
  doctor_id: string;
  doctorName?: string;
  patientName?: string;
  contact?: string;
  email?: string;
  gender?: string;
  dob?: string;
  purpose?: string;
  notes?: string;
  services?: any[];
  date: string;
  time: string;
  status: string;
};

export default function AppointmentPage() {
  const [allData, setAllData] = useState<Appointment[]>([]);
  const [filteredData, setFilteredData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentFilter, setAppointmentFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const ability = useAbility();
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

  const handleEditAppointment = (ap: Appointment) => {
    setEditingAppointment(ap);
    setViewAppointment(null);
    setIsModalOpen(true);
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
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.date;
        return new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    },
    { accessorKey: "time", header: "Time" },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-center font-semibold text-muted-foreground">
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const style = statusStyles[status] ?? {
          label: status,
          className: "bg-gray-100 text-gray-700",
        };

        return (
          <div className="flex justify-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${style.className}`}
            >
              {style.label}
            </span>
          </div>
        );
      },
    },


    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const ap = row.original;

        const isCancelled = ap.status === "cancelled";
        const isCompleted = ap.status === "completed";

        return (
          <div className="flex justify-end items-center gap-1">
            <TooltipProvider>
              <Can I="update" a="appointment" ability={ability}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewAppointment(ap)}
                    >
                      <Eye size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>View Appointment</p>
                  </TooltipContent>
                </Tooltip>
                {isCompleted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/doctor/appointment/vistiPatient/${ap.patient_id}?name=${encodeURIComponent(
                          ap.patientName || ""
                        )}&appointmentId=${ap.id}&mode=edit`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                        >
                          <Pencil size={16} />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Edit Prescription</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {!isCompleted && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        {isCancelled ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-not-allowed opacity-50"
                          >
                            <FaPrescription size={16} />
                          </Button>
                        ) : (
                          <Link
                            href={`/doctor/appointment/vistiPatient/${ap.patient_id}?name=${encodeURIComponent(
                              ap.patientName || ""
                            )}&appointmentId=${ap.id}`}
                          >
                            <Button variant="ghost" size="icon">
                              <FaPrescription size={16} />
                            </Button>
                          </Link>
                        )}
                      </span>
                    </TooltipTrigger>

                    <TooltipContent side="top">
                      <p>
                        {isCancelled
                          ? "Not Allowed"
                          : "Add Prescription"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      {isCancelled ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-not-allowed opacity-50"
                        >
                          <FaShareSquare size={16} />
                        </Button>
                      ) : (
                        <Link href={`/doctor/IPD/registration?opdId=${ap.id}`}>
                          <Button variant="ghost" size="icon">
                            <FaShareSquare size={16} />
                          </Button>
                        </Link>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>
                      {isCancelled ? "Not Allowed" : "Move to IPD"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Can>

              <Can I="delete" a="appointment" ability={ability}>
                {isCancelled || isCompleted ? (
                      <span className="cursor-not-allowed">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled
                          className="text-destructive opacity-50 pointer-events-none"
                        >
                          <X size={16} />
                        </Button>
                      </span>
                ) : (
                  <ConfirmDialog
                    title="Cancel Appointment"
                    description="Are you sure you want to cancel this appointment?"
                    actionLabel="Yes, Cancel"
                    onConfirm={() => handleCancelAppointment(ap.id)}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X size={16} />
                      </Button>
                    }
                  />
                )}
              </Can>
            </TooltipProvider>
          </div>
        );
      },
    }
  ];

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const statusStyles: Record<
    string,
    { label: string; className: string }
  > = {
    scheduled: {
      label: "Scheduled",
      className: "bg-blue-100 text-indigo-700",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-700",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700",
    },
  };



  return (
    <div className="bg-background text-foreground min-h-screen p-6">
      <div className="space-y-4 mt-6">
        {/* HEADER */}
        <Card className="bg-Module-header text-white shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Calendar className="h-7 w-7" />
                My Appointments
              </CardTitle>
              <p className="text-sm text-indigo-100 mt-1">
                Manage and view patient appointments
              </p>
            </div>
            <Can I="create" a="appointment" ability={ability}>
              <Button
                className="bg-white text-indigo-700 hover:bg-indigo-50"
                onClick={() => setIsModalOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </Can>
          </CardHeader>
        </Card>

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-2 items-center p-4 rounded-xl shadow-lg border border-dialog bg-dialog-surface">
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
              setAppointmentFilter("all");
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
        ) : (
          <>
            <Table data={paginatedData} columns={columns} fallback={"No Appointments found"} />

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
        onOpenChange={(val) => {
          setIsModalOpen(val);
          if (!val) setEditingAppointment(null);
        }}
        onSuccess={fetchAppointments}
        appointment={editingAppointment}
      />

      <Dialog
        open={!!viewAppointment}
        onOpenChange={() => setViewAppointment(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-scroll border-overview-base bg-overview-base">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {viewAppointment && (
            <AppointmentCard data={viewAppointment} onEdit={handleEditAppointment} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
