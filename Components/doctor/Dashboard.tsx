'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Cards from "@/Components/Cards";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { UsersRound, CalendarDays, CheckCircle, Clock } from "lucide-react";
import AreaGraph from "../graph/AreaGraph";
import PieGraph from "../graph/PieGraph";

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  purpose: string;
  time: string;
  date: string;
};

type DashboardData = {
  stats: {
    todayPatients: number;
    totalAppointments: number;
    completed: number;
    pending: number;
  };
  upcomingAppointments: Appointment[];
  monthlyTrends: Array<{
    month: string;
    consultations: number;
    followups: number;
  }>;
  statusDistribution: Array<{
    type: string;
    count: number;
  }>;
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard");
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
      } else {
        console.error("Failed to fetch dashboard data:", result.error);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const DashboardCardData = [
    { 
      title: "Today's Patients", 
      value: dashboardData?.stats.todayPatients || 0, 
      icon: UsersRound, 
      color: "text-blue-500" 
    },
    { 
      title: "Total Appointments", 
      value: dashboardData?.stats.totalAppointments || 0, 
      icon: CalendarDays, 
      color: "text-purple-500" 
    },
    { 
      title: "Completed", 
      value: dashboardData?.stats.completed || 0, 
      icon: CheckCircle, 
      color: "text-green-500" 
    },
    { 
      title: "Pending", 
      value: dashboardData?.stats.pending || 0, 
      icon: Clock, 
      color: "text-orange-500" 
    },
  ];

  const columns: ColumnDef<Appointment>[] = [
    { accessorKey: "patientName", header: "Patient Name" },
    { accessorKey: "doctorName", header: "Doctor Name" },
    { accessorKey: "purpose", header: "Purpose" },
    { accessorKey: "time", header: "Time" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Link
          href={`/doctor/appointment/vistiPatient/${
            row.original.id
          }?name=${encodeURIComponent(row.original.patientName)}`}
        
        >
          <Button variant="outline" size="sm" className="cursor-pointer">
            Visit
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <Cards cardData={DashboardCardData} onRefresh={fetchDashboardData} />

      <div>
        <h2 className="text-lg font-semibold text-muted-foreground mb-4">
          Upcoming Appointments
        </h2>

        <div className="text-sm">
          {loading ? (
            <p className="h-[200px] flex justify-center items-center text-lg font-medium animate-pulse">Loading appointments...</p>
          )  : (
            <Table data={dashboardData?.upcomingAppointments || []} columns={columns} fallback={"No upcoming appointments."} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <div className="w-full aspect-[4/3]">
          <AreaGraph data={dashboardData?.monthlyTrends || []} />
        </div>
        <div className="w-full aspect-[4/3]">
          <PieGraph data={dashboardData?.statusDistribution || []} />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
