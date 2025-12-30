"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
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
import { PlusCircle, HeartPulse, Pencil } from "lucide-react";
import VitalsModal from "./vitalsModel";
import { getIPDVitals } from "@/lib/actions/ipdVitals";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ---------------- Types ---------------- */
interface VitalEntry {
  vitalId: string;
  vitalName: string;
  vitalValue: string;
  unit: string;
  range: string;
  date: string;
}

interface IPDVitalRecord {
  id: string;
  vitals: VitalEntry[];
  createdAt: Date;
}

/* ---------------- Page ---------------- */
export default function VitalsPage() {
  const params = useParams();
  const id = params.id as string;

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<IPDVitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVitals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getIPDVitals(id);
      if (result.data) {
        setRecords(result.data as IPDVitalRecord[]);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error fetching vitals:", error);
      toast.error("Failed to load vitals");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  /* ---------------- Flatten and Filter ---------------- */
  const flattenedVitals = useMemo(() => {
    const all: (VitalEntry & { recordId: string; createdAt: Date })[] = [];
    records.forEach((record) => {
      record.vitals.forEach((v) => {
        all.push({
          ...v,
          recordId: record.id,
          createdAt: record.createdAt,
        });
      });
    });

    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (v) =>
        v.vitalName.toLowerCase().includes(q) ||
        v.vitalValue.toLowerCase().includes(q) ||
        format(new Date(v.date), "dd-MM-yyyy").includes(search)
    );
  }, [records, search]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <Card className="border-dialog bg-dialog-header">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-dialog">
            <HeartPulse className="bg-dialog-header text-dialog-icon" />
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
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" />
              Add Vital
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* TABLE */}
      <Card className="shadow-lg border-dialog bg-dialog-header">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-dialog-icon">Vital Name</TableHead>
                <TableHead className="text-dialog-icon">Value</TableHead>
                <TableHead className="text-dialog-icon">Unit</TableHead>
                <TableHead className="text-dialog-icon">Reference Range</TableHead>
                <TableHead className="text-dialog-icon">Date</TableHead>
                {/* <TableHead className="text-dialog-icon">Actions</TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading vitals...
                  </TableCell>
                </TableRow>
              ) : flattenedVitals.length ? (
                flattenedVitals.map((v, idx) => (
                  <TableRow key={idx} className="odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors ">
                    <TableCell className="font-medium text-dialog-muted">
                      {v.vitalName}
                    </TableCell>
                    <TableCell className="text-dialog-muted">{v.vitalValue}</TableCell>
                    <TableCell className="text-dialog-muted">{v.date}</TableCell>
                    {/* <TableCell className="text-center">
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
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
      <VitalsModal
        open={open}
        onClose={() => setOpen(false)}
        ipdAdmissionId={id}
        onSuccess={fetchVitals}
      />
    </div>
  );
}

