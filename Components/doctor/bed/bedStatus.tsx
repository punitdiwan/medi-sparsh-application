"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
};

export default function BedStatusPage() {
  const [search, setSearch] = useState("");

  const [bedStatus, setBedStatus] = useState<BedStatus[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds");
    } finally {
      setLoading(false);
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
          {/* Search Bar */}
          <Input
            placeholder="Search beds..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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
                  <TableCell
                    className={
                      !item.isOccupied
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {item.isOccupied ? "Occupied" : "Available"}
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
