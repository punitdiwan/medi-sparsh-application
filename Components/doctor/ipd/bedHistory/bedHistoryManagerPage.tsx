"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
import { BedDouble } from "lucide-react";

/* ---------------- Types ---------------- */
interface BedHistory {
  id: string;
  bedGroup: string;
  bed: string;
  fromDate: string;
  toDate: string;
  active: boolean;
}

/* ---------------- Dummy Data ---------------- */
const BED_HISTORY_DATA: BedHistory[] = [
  {
    id: "1",
    bedGroup: "ICU",
    bed: "ICU-01",
    fromDate: "2025-02-10",
    toDate: "2025-02-12",
    active: false,
  },
  {
    id: "2",
    bedGroup: "General Ward",
    bed: "GW-12",
    fromDate: "2025-02-12",
    toDate: "—",
    active: true,
  },
];

/* ---------------- Page ---------------- */
export default function BedHistoryManagerPage() {
  const [search, setSearch] = useState("");

  /* ---------------- Filter ---------------- */
  const filteredData = useMemo(() => {
    if (!search) return BED_HISTORY_DATA;

    return BED_HISTORY_DATA.filter(
      (b) =>
        b.bedGroup.toLowerCase().includes(search.toLowerCase()) ||
        b.bed.toLowerCase().includes(search.toLowerCase()) ||
        b.fromDate.includes(search) ||
        b.toDate.includes(search)
    );
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-dialog flex items-center gap-2">
            <BedDouble className="bg-dialog-header text-dialog-icon" />
            Bed History
          </CardTitle>

          <Input
            placeholder="Search by bed / group / date"
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
                <TableHead className="text-dialog-icon">Bed Group</TableHead>
                <TableHead className="text-dialog-icon">Bed</TableHead>
                <TableHead className="text-dialog-icon">From Date</TableHead>
                <TableHead className="text-dialog-icon">To Date</TableHead>
                <TableHead className="text-center text-dialog-icon">Active Bed</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredData.length ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-dialog-muted">
                      {item.bedGroup}
                    </TableCell>
                    <TableCell className="text-dialog-muted">{item.bed}</TableCell>
                    <TableCell className="text-dialog-muted">{item.fromDate}</TableCell>
                    <TableCell className="text-dialog-muted">{item.toDate}</TableCell>
                    <TableCell className="text-center">
                      {item.active ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          No
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No bed history found
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
