"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type BedStatus = {
  id: string;
  name: string;
  bedTypeName: string | null;
  bedGroupName: string | null;
  floorName: string | null;
  isOccupied: boolean;
  status?: string | null;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
] as const;

const normalizeStatus = (status: string | null | undefined, isOccupied: boolean) => {
  const s = (status ?? "").toLowerCase().trim();
  if (s === "active" || s === "occupied" || s === "maintenance" || s === "disabled") return s;
  return isOccupied ? "occupied" : "active";
};

export default function BedStatusPage() {
  const [search, setSearch] = useState("");

  const [bedStatus, setBedStatus] = useState<BedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/beds");
      if (!response.ok) throw new Error("Failed to fetch beds");
      const data = await response.json();
      setBedStatus(data);

      setDraftStatus((prev) => {
        const next: Record<string, string> = { ...prev };
        for (const b of data as BedStatus[]) {
          next[b.id] = normalizeStatus(b.status, b.isOccupied);
        }
        return next;
      });
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEdit = async () => {
    if (!editing) {
      setDraftStatus(() => {
        const next: Record<string, string> = {};
        for (const b of bedStatus) {
          next[b.id] = normalizeStatus(b.status, b.isOccupied);
        }
        return next;
      });
      setEditing(true);
      return;
    }

    try {
      setSaving(true);

      const changes = bedStatus
        .map((b) => {
          const current = normalizeStatus(b.status, b.isOccupied);
          const next = draftStatus[b.id] ?? current;
          return { id: b.id, current, next };
        })
        .filter((x) => x.current !== x.next);

      for (const c of changes) {
        const res = await fetch(`/api/beds/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: c.next }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || "Failed to save bed status");
        }
      }

      toast.success("Bed statuses updated");
      setEditing(false);
      await fetchBeds();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to save bed status");
    } finally {
      setSaving(false);
    }
  };

  const filteredData = useMemo(() => {
    return bedStatus.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [bedStatus, search]);

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Bed Status Overview</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Live status of hospital beds across floors, groups, and types.
          </CardDescription>
        </div>
      </CardHeader>
      {/* <Separator /> */}
      <CardContent>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Search beds..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              variant={editing ? "default" : "outline"}
              disabled={loading || saving}
              onClick={handleToggleEdit}
            >
              {editing ? (saving ? "Saving..." : "Save") : "Edit"}
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Bed Type</TableHead>
                <TableHead>Bed Group</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Loading beds...
                  </TableCell>
                </TableRow>
              ) : filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.bedTypeName || "-"}</TableCell>
                  <TableCell>{item.bedGroupName || "-"}</TableCell>
                  <TableCell>{item.floorName || "-"}</TableCell>
                  <TableCell>
                    {editing && !item.isOccupied ? (
                      <Select
                        value={draftStatus[item.id] ?? normalizeStatus(item.status, item.isOccupied)}
                        onValueChange={(v) =>
                          setDraftStatus((prev) => ({ ...prev, [item.id]: v }))
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={item.status == "occupied" ? "text-red-500" : item.status == "maintenance" ? "text-yellow-600" : "text-green-600"}>{item.status == "occupied" ? "Occupied" : item.status == "active" ? "Available" : "Maintenance"}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No beds found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card >
  );
}
