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
import { PlusCircle, HeartPulse, Pencil, Trash2 } from "lucide-react";
import VitalsModal from "./vitalsModel";
import { deleteIPDVital, getIPDVitals } from "@/lib/actions/ipdVitals";
import { toast } from "sonner";
import { format } from "date-fns";
import { buildVitalsMatrix } from "@/lib/utils/vitals-table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ---------------- Types ---------------- */
export interface VitalEntry {
  id?: string;
  vitalId: string;
  vitalName: string;
  vitalValue: string;
  unit: string;
  range: string;
  date: string;
  time: string;
  recordId?: string;
}

export interface IPDVitalRecord {
  id: string;
  vitals: VitalEntry[];
  createdAt: Date;
}

export default function VitalsPage() {
  const params = useParams();
  const id = params.id as string;

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any[] | null>(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<IPDVitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const { headers, rows } = useMemo(() => buildVitalsMatrix(records), [records]);

  const fetchVitals = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getIPDVitals(id);
      if (result.data) setRecords(result.data as IPDVitalRecord[]);
      else if (result.error) toast.error(result.error);
    } catch (err) {
      toast.error("Failed to load vitals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const handleEdit = (vital: any) => {
    const headerInfo = headers.find(([name]) => name === vital.vitalName)?.[1] || {};
    setEditData([{
      id: vital.id,
      vitalId: vital.vitalId,
      vitalName: vital.vitalName,
      vitalValue: vital.value,
      unit: headerInfo.unit || "",
      range: headerInfo.range || "",
      date: vital.date,
      time: vital.time,
      recordId: vital.recordId,
    }]);


    setOpen(true);
  };

  const handleDelete = async (vital: any) => {
    if (!confirm("Are you sure you want to delete this vital?")) return;
    try {
      await deleteIPDVital(id, vital.id, vital.recordId);
      toast.success("Vital deleted");
      fetchVitals();
    } catch {
      toast.error("Failed to delete vital");
    }
  };

  function formatTime(time: string) {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
  return (
    <div className="py-2 space-y-6">
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
                <TableHead className="w-32">Date</TableHead>
                {headers.map(([name, meta]) => (
                  <TableHead key={name} className="text-center min-w-[160px]">
                    <div className="font-semibold">{name}</div>
                    {meta.range && (
                      <div className="text-[11px] text-muted-foreground">
                        ({meta.range} {meta.unit})
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(rows).map(([date, vitals]) => (
                <TableRow key={date} className="odd:bg-muted/40 even:bg-transparent hover:bg-muted/60 transition-colors ">
                  <TableCell className="font-medium">{date}</TableCell>
                  {headers.map(([name]) => (
                    <TableCell key={name} className="text-center align-top">
                      {vitals[name] ? (
                        <div className="flex flex-col gap-1">
                          {vitals[name].map((v: any) => (
                            <div
                              key={v.id} 
                              className="ml-4 flex justify-center gap-2 items-center group"
                            >
                              <span>
                                {v.value} ({formatTime(v.time)})
                              </span>

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleEdit({
                                            ...v,
                                            date,
                                            vitalName: name,
                                            vitalId: v.vitalId,
                                          })
                                        }
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <Pencil size={14} />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit Vital</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleDelete({
                                            ...v,
                                            date,
                                            vitalName: name,
                                            vitalId: v.vitalId,
                                          })
                                        }
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Vital</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}

                    </TableCell>
                  ))}
                </TableRow>
              ))}

            </TableBody>
          </Table>
        </CardContent>
      </Card>


      <VitalsModal
        open={open}
        onClose={() => { setOpen(false); setEditData(null); }}
        ipdAdmissionId={id}
        onSuccess={fetchVitals}
        initialData={editData || undefined}
      />

    </div>
  );
}
