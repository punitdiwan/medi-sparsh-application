"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MdSearch } from "react-icons/md";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  doctorId: string;
  doctorName: string;
  shifts: Record<string, boolean>;
}

export default function DoctorShiftManagerPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctorShifts");
      if (res.ok) {
        const data = await res.json();
        setDoctors(data.doctors);
        setShifts(data.shifts);
      } else {
        toast.error("Failed to fetch doctor shifts");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDoctorShift = async (doctorId: string, shiftId: string, currentStatus: boolean) => {
    // Optimistic update
    const previousDoctors = [...doctors];
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.doctorId === doctorId
          ? {
            ...doc,
            shifts: {
              ...doc.shifts,
              [shiftId]: !currentStatus,
            },
          }
          : doc
      )
    );

    try {
      const res = await fetch("/api/doctorShifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          shiftId,
          assigned: !currentStatus,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }
      toast.success("Shift updated successfully");
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Failed to update shift");
      // Revert on error
      setDoctors(previousDoctors);
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDoctors.slice(start, start + rowsPerPage);
  }, [filteredDoctors, page]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  return (
      <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Doctor Shift Management</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Assign shifts to doctors.
            </CardDescription>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-6">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by doctor name..."
              className="pl-9 bg-background/50 border-muted focus:border-primary transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/50 overflow-hidden shadow-sm bg-background">
            <table className="w-full border-collapse">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-3 border-b text-left font-semibold text-muted-foreground">Doctor</th>
                  {shifts.map((shift) => (
                    <th key={shift.id} className="p-3 border-b text-center font-semibold text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <span>{shift.name}</span>
                        <span className="text-[10px] font-normal text-muted-foreground/70">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={1 + shifts.length} className="p-8 text-center text-muted-foreground animate-pulse">
                      Loading data...
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={1 + shifts.length} className="p-8 text-center text-muted-foreground">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((doc) => (
                    <tr key={doc.doctorId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{doc.doctorName}</td>
                      {shifts.map((shift) => (
                        <td key={shift.id} className="p-3 text-center">
                          <Checkbox
                            className="border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            checked={!!doc.shifts[shift.id]}
                            onCheckedChange={() =>
                              toggleDoctorShift(doc.doctorId, shift.id, !!doc.shifts[shift.id])
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{paginatedData.length}</span> of <span className="font-medium">{filteredDoctors.length}</span> doctors
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-8"
              >
                Previous
              </Button>

              <div className="text-sm font-medium px-2">
                Page {page} of {totalPages || 1}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-8"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
