"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Pencil, Trash2, Video } from "lucide-react";

/* ---------------- Types ---------------- */
interface LiveConsultation {
  id: string;
  consultation: string;
  title: string;
  date: string;
  createdBy: string;
  createdFor: string;
  patient: string;
  status: "Pending" | "Completed" | "Cancelled";
}

/* ---------------- Dummy Data ---------------- */
const DUMMY_DATA: LiveConsultation[] = [
  {
    id: "1",
    consultation: "Video",
    title: "Follow-up",
    date: "2025-12-25",
    createdBy: "Dr. Anjali",
    createdFor: "Reception",
    patient: "John Doe",
    status: "Pending",
  },
  {
    id: "2",
    consultation: "Audio",
    title: "Initial Checkup",
    date: "2025-12-24",
    createdBy: "Dr. Rekha",
    createdFor: "Reception",
    patient: "Jane Smith",
    status: "Completed",
  },
];

/* ---------------- Page ---------------- */
export default function LiveConsultationPage() {
  const [consultations, setConsultations] = useState<LiveConsultation[]>(
    DUMMY_DATA
  );
  const [search, setSearch] = useState("");

  /* ---------------- Filter ---------------- */
  const filtered = useMemo(() => {
    if (!search) return consultations;
    return consultations.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.patient.toLowerCase().includes(search.toLowerCase()) ||
        c.createdBy.toLowerCase().includes(search.toLowerCase()) ||
        c.createdFor.toLowerCase().includes(search.toLowerCase()) ||
        c.date.includes(search)
    );
  }, [consultations, search]);

  /* ---------------- Actions ---------------- */
  const handleEdit = (id: string) => {
    alert(`Edit consultation: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this consultation?")) {
      setConsultations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-indigo-600" />
            Live Consultation
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by title, patient, date, or created by/for"
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
                <TableHead>Consultation</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created For</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length ? (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.consultation}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.date}</TableCell>
                    <TableCell>{c.createdBy}</TableCell>
                    <TableCell>{c.createdFor}</TableCell>
                    <TableCell>{c.patient}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handleEdit(c.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDelete(c.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No consultations found
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
