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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, HeartPulse, Pencil } from "lucide-react";
import VitalsModal from "./vitalsModel";

/* ---------------- Types ---------------- */
interface Vital {
  vitalName: string;
  vitalValue: string;
  date: string;
}

/* ---------------- Page ---------------- */
export default function VitalsPage() {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [vitalsData, setVitalsData] = useState<Vital[]>([]);

  const vitalsList = ["BP", "Pulse", "Temp", "SpO₂", "Respiration"];

  /* ---------------- Filter ---------------- */
  const filteredVitals = useMemo(() => {
    if (!search) return vitalsData;
    return vitalsData.filter(
      (v) =>
        v.vitalName.toLowerCase().includes(search.toLowerCase()) ||
        v.vitalValue.toLowerCase().includes(search.toLowerCase()) ||
        v.date.includes(search)
    );
  }, [vitalsData, search]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-indigo-700 dark:text-white">
            <HeartPulse className="h-6 w-6 text-indigo-600" />
            Patient Vitals
          </CardTitle>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search by vital / value / date"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:w-72"
            />

            <Button
              onClick={() => {
                setEditIndex(null);
                setOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="h-5 w-5" />
              Add Vital
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vital Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVitals.length ? (
                filteredVitals.map((v, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      {v.vitalName}
                    </TableCell>
                    <TableCell>{v.vitalValue}</TableCell>
                    <TableCell>{v.date}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditIndex(idx);
                                setOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Vital</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No vitals recorded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL */}
      {open && (
        <VitalsModal
          open={open}
          onClose={() => setOpen(false)}
          vitalsList={vitalsList}
          initialData={editIndex !== null ? [vitalsData[editIndex]] : []}
          onSubmit={(data) => {
            if (editIndex !== null) {
              const updated = [...vitalsData];
              updated[editIndex] = data[0];
              setVitalsData(updated);
            } else {
              setVitalsData((prev) => [...prev, ...data]);
            }
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
