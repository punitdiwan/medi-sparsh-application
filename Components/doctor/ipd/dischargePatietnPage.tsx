"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  List,
  Search,
  FileText,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Table as DataTable } from "@/components/Table/Table";
import BackButton from "@/Components/BackButton";
import { getDischargedPatients } from "@/lib/actions/ipdActions";
import { useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
/* ---------------- Types ---------------- */
interface DischargedPatient {
  id: string;
  name: string;
  patientId: string;
  caseId: string;
  gender: string;
  phone: string;
  consultantDoctor: string;
  admissionDate: Date;
  dischargedDate: Date;
  dischargeStatus: string;
}

/* ---------------- Dummy Data ---------------- */

/* ---------------- Page ---------------- */
export default function IPDDischargedPatientManager() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DischargedPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getDischargedPatients();
      if (res.data) {
        setData(res.data as any);
      } else if (res.error) {
        toast.error(res.error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(s)
      )
    );
  }, [search, data]);
  /* ---------- Columns ---------- */
  const columns: ColumnDef<DischargedPatient>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    { accessorKey: "patientId", header: "Patient ID" },
    { accessorKey: "caseId", header: "Case ID" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "consultantDoctor", header: "Consultant Doctor" },
    {
      accessorKey: "admissionDate",
      header: "Admission Date",
      cell: ({ row }) => format(new Date(row.original.admissionDate), "dd-MM-yyyy"),
    },
    {
      accessorKey: "dischargedDate",
      header: "Discharged Date",
      cell: ({ row }) => format(new Date(row.original.dischargedDate), "dd-MM-yyyy"),
    },
    {
      accessorKey: "dischargeStatus",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.dischargeStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/doctor/IPD/ipdDetails/${row.original.id}/ipd`}>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
      ),
    },
  ];
  return (
    <div className="p-6 space-y-6 mt-4">
      <BackButton />
      {/* HEADER */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2">
            <List className="h-6 w-6 text-indigo-600" />
            IPD Discharged Patient
          </CardTitle>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discharged patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading discharged patients...</div>
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              fallback="No discharged patients found"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
