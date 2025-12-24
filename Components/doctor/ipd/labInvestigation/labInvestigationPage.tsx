"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye,FlaskConical } from "lucide-react";

/* ---------------- Types ---------------- */
interface LabInvestigation {
  id: string;
  testName: string;
  lab: string;
  sampleCollected: string;
  expectedDate: string;
  approvedBy: string;
}

/* ---------------- Dummy Data ---------------- */
const DUMMY_LABS: LabInvestigation[] = [
  {
    id: "1",
    testName: "CBC",
    lab: "Apollo Lab",
    sampleCollected: "2025-12-24",
    expectedDate: "2025-12-25",
    approvedBy: "Dr. Anjali",
  },
  {
    id: "2",
    testName: "Lipid Profile",
    lab: "MedLife",
    sampleCollected: "2025-12-23",
    expectedDate: "2025-12-26",
    approvedBy: "Dr. Rekha",
  },
];

/* ---------------- Page ---------------- */
export default function LabInvestigationPage() {
  const [labs, setLabs] = useState<LabInvestigation[]>(DUMMY_LABS);
  const [search, setSearch] = useState("");

  /* ---------------- Filter ---------------- */
  const filteredLabs = useMemo(() => {
    if (!search) return labs;
    return labs.filter(
      (l) =>
        l.testName.toLowerCase().includes(search.toLowerCase()) ||
        l.lab.toLowerCase().includes(search.toLowerCase()) ||
        l.sampleCollected.includes(search) ||
        l.expectedDate.includes(search) ||
        l.approvedBy.toLowerCase().includes(search.toLowerCase())
    );
  }, [labs, search]);

  /* ---------------- View Action ---------------- */
  const handleView = (id: string) => {
    alert(`View lab investigation details: ${id}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-indigo-600" />
            Lab Investigation
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by Test Name, Lab, Date, or Approved By"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-96"
            />
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Name</TableHead>
                <TableHead>Lab</TableHead>
                <TableHead>Sample Collected</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredLabs.length ? (
                filteredLabs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.testName}</TableCell>
                    <TableCell>{l.lab}</TableCell>
                    <TableCell>{l.sampleCollected}</TableCell>
                    <TableCell>{l.expectedDate}</TableCell>
                    <TableCell>{l.approvedBy}</TableCell>
                    <TableCell className="flex justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleView(l.id)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No lab investigations found
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
