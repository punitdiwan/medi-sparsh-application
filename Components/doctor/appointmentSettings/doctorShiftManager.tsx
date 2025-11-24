"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const DOCTORS = [
  { id: "1", name: "Dr. Amit Verma" },
  { id: "2", name: "Dr. Neha Sharma" },
  { id: "3", name: "Dr. Rahul Singh" },
  { id: "4", name: "Dr. Karan Mehta" },
  { id: "5", name: "Dr. Ritika Bhatia" },
  { id: "6", name: "Dr. Varun Patel" },
  { id: "7", name: "Dr. Aarti Kapoor" },
];

const SHIFTS = [
  { id: "morning", name: "Morning" },
  { id: "afternoon", name: "Afternoon" },
  { id: "evening", name: "Evening" },
  { id: "night", name: "Night" },
];

type ShiftKey = "morning" | "afternoon" | "evening" | "night";

type DoctorShift = {
  doctorId: string;
  doctorName: string;
  shifts: Record<ShiftKey, boolean>;
};

export default function DoctorShiftManagerPage() {
  const [search, setSearch] = useState("");

  const [doctorShiftData, setDoctorShiftData] = useState<DoctorShift[]>([
    {
      doctorId: "1",
      doctorName: "Dr. Amit Verma",
      shifts: { morning: true, afternoon: false, evening: true, night: false },
    },
    {
      doctorId: "2",
      doctorName: "Dr. Neha Sharma",
      shifts: { morning: false, afternoon: true, evening: false, night: false },
    },
    {
      doctorId: "3",
      doctorName: "Dr. Rahul Singh",
      shifts: { morning: false, afternoon: false, evening: true, night: true },
    },
    {
      doctorId: "4",
      doctorName: "Dr. Karan Mehta",
      shifts: { morning: true, afternoon: true, evening: false, night: false },
    },
    {
      doctorId: "5",
      doctorName: "Dr. Ritika Bhatia",
      shifts: { morning: false, afternoon: false, evening: false, night: true },
    },
    {
      doctorId: "6",
      doctorName: "Dr. Varun Patel",
      shifts: { morning: true, afternoon: true, evening: true, night: false },
    },
    {
      doctorId: "7",
      doctorName: "Dr. Aarti Kapoor",
      shifts: { morning: false, afternoon: false, evening: true, night: false },
    },
  ]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const toggleDoctorShift = (doctorId: string, shiftKey: ShiftKey) => {
    setDoctorShiftData((prev) =>
      prev.map((doc) =>
        doc.doctorId === doctorId
          ? {
              ...doc,
              shifts: {
                ...doc.shifts,
                [shiftKey]: !doc.shifts[shiftKey], 
              },
            }
          : doc
      )
    );
  };

  const filteredDoctors = doctorShiftData.filter((d) =>
    d.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredDoctors.slice(start, start + rowsPerPage);
  }, [filteredDoctors, page]);

  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  return (
    <div className="p-6 space-y-6">

      <div>
        <Input
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 border text-left">Doctor</th>

              {SHIFTS.map((shift) => (
                <th key={shift.id} className="p-3 border text-center">
                  {shift.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((doc) => (
              <tr key={doc.doctorId} className="border-b">
                <td className="p-3 border">{doc.doctorName}</td>

                {SHIFTS.map((shift) => (
                  <td key={shift.id} className="p-3 border text-center">
                    <Checkbox
                      className="border border-gray-500 dark:border-gray-300"
                      checked={doc.shifts[shift.id as ShiftKey]}
                      onCheckedChange={() =>
                        toggleDoctorShift(doc.doctorId, shift.id as ShiftKey)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}

            {paginatedData.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-gray-500"
                  colSpan={1 + SHIFTS.length}
                >
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-2">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * rowsPerPage + 1}–
          {Math.min(page * rowsPerPage, filteredDoctors.length)} of{" "}
          {filteredDoctors.length}
        </p>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>

          <span className="font-medium">
            Page {page} / {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
