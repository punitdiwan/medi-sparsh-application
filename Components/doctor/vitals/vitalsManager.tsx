"use client";

import React, { useMemo, useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import { VitalModal } from "./vitalModel";

export type Vital = {
  id: string;
  name: string;
  from: string;
  to: string;
  unit: string;
};

const INITIAL_VITALS: Vital[] = [
  { id: "v1", name: "Weight", from: "0", to: "150", unit: "Kg" },
  { id: "v2", name: "Height", from: "1", to: "200", unit: "cm" },
  { id: "v3", name: "Pulse", from: "70", to: "100", unit: "bpm" },
  { id: "v4", name: "BP", from: "90/60", to: "140/90", unit: "mmHg" },
  { id: "v5", name: "Temperature", from: "95.8", to: "99.3", unit: "°F" },
];

export default function VitalsManager() {
  const [vitals, setVitals] = useState<Vital[]>(INITIAL_VITALS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Vital | null>(null);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return vitals;
    const q = filter.toLowerCase();
    return vitals.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.unit.toLowerCase().includes(q) ||
        v.from.toLowerCase().includes(q) ||
        (v.to ?? "").toLowerCase().includes(q)
    );
  }, [filter, vitals]);

  const handleSave = (item: Vital) => {
    setVitals((prev) => {
      const exists = prev.some((v) => v.id === item.id);
      return exists
        ? prev.map((v) => (v.id === item.id ? item : v))
        : [...prev, item];
    });
    setEditing(null);
  };

  return (
    <Card className="p-4 m-4 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Vitals</CardTitle>
        <CardDescription>
          Manage vitals with their range and unit type.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Search + Add */}
        <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
          <Input
            placeholder="Search vitals..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />

          <Button onClick={() => setOpen(true)}>Add Vital</Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-7 text-muted-foreground"
                  >
                    No vitals found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.from}</TableCell>
                    <TableCell>{v.to ?? "-"}</TableCell>
                    <TableCell>{v.unit}</TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(v);
                              setOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setVitals((p) => p.filter((a) => a.id !== v.id))
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal */}
      <VitalModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
        vital={editing ?? undefined}
        onSave={handleSave}
      />
    </Card>
  );
}
