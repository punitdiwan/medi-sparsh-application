"use client";

import { useState, useMemo } from "react";
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
  bedType: string;
  bedGroup: string;
  floor: string;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
};

export default function BedStatusPage() {
  const [search, setSearch] = useState("");

  const [bedStatus, setBedStatus] = useState<BedStatus[]>([
    {
      id: "1",
      name: "Bed-101",
      bedType: "General",
      bedGroup: "Group A",
      floor: "1st Floor",
      status: "Available",
    },
    {
      id: "2",
      name: "Bed-102",
      bedType: "ICU",
      bedGroup: "Group B",
      floor: "2nd Floor",
      status: "Occupied",
    },
    {
      id: "3",
      name: "Bed-103",
      bedType: "General",
      bedGroup: "Group A",
      floor: "1st Floor",
      status: "Cleaning",
    },
  ]);

  const filteredData = useMemo(() => {
    return bedStatus.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [bedStatus, search]);

  return (
    <Card className="shadow-md border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Bed Status Overview</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Live status of hospital beds across floors, groups, and types.
                </CardDescription>
            </div>
          </CardHeader>
          <Separator />
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
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.bedType}</TableCell>
                  <TableCell>{item.bedGroup}</TableCell>
                  <TableCell>{item.floor}</TableCell>
                  <TableCell
                    className={
                      item.status === "Available"
                        ? "text-green-600"
                        : item.status === "Occupied"
                        ? "text-red-600"
                        : item.status === "Cleaning"
                        ? "text-yellow-600"
                        : "text-orange-600"
                    }
                  >
                    {item.status}
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
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
    </Card>
  );
}
