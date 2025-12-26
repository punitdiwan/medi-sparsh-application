"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

/* ---------------- Types ---------------- */
interface TreatmentHistory {
  ipdNo: string;
  symptoms: string;
  consultantDoctor: string;
  bed: string;
}

/* ---------------- Dummy Data ---------------- */
const DUMMY_DATA: TreatmentHistory[] = [
  {
    ipdNo: "IPD-1023",
    symptoms: "Fever, Cough",
    consultantDoctor: "Dr. Amit Sharma",
    bed: "Bed A-12",
  },
  {
    ipdNo: "IPD-1041",
    symptoms: "Chest Pain",
    consultantDoctor: "Dr. Neha Verma",
    bed: "Bed B-05",
  },
];

/* ---------------- Page ---------------- */
export default function TreatmentHistoryPage() {
  const [search, setSearch] = useState("");

  /* ---------------- Filter ---------------- */
  const filteredData = useMemo(() => {
    if (!search) return DUMMY_DATA;
    return DUMMY_DATA.filter(
      (t) =>
        t.ipdNo.toLowerCase().includes(search.toLowerCase()) ||
        t.symptoms.toLowerCase().includes(search.toLowerCase()) ||
        t.consultantDoctor
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        t.bed.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-dialog">
            <ClipboardList className="bg-dialog-header text-dialog-icon" />
            Treatment History
          </CardTitle>

          <Input
            placeholder="Search IPD / symptoms / doctor / bed"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:w-72"
          />
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">IPD No</TableHead>
                <TableHead className="text-dialog-icon">Symptoms</TableHead>
                <TableHead className="text-dialog-icon">Consultant Doctor</TableHead>
                <TableHead className="text-dialog-icon text-center">Bed</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length ? (
                filteredData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium text-dialog-muted">
                      {row.ipdNo}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-dialog-muted">
                      {row.symptoms}
                    </TableCell>
                    <TableCell className="text-dialog-muted">{row.consultantDoctor}</TableCell>
                    <TableCell className="text-dialog-muted text-center">{row.bed}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No treatment history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
