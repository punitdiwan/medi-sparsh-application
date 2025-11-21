"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import BedModal from "./bedModel";
import { toast } from "sonner";

type Bed = {
  id: string;
  name: string;
  bedTypeId: string;
  bedGroupId: string;
  bedTypeName: string;
  bedGroupName: string;
  notAvailable: boolean;
  isDeleted: boolean;
};

export default function BedManager() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const dummyBeds: Bed[] = [
    {
      id: "1",
      name: "Bed A1",
      bedTypeId: "ICU",
      bedGroupId: "G1",
      bedTypeName: "ICU",
      bedGroupName: "General Ward",
      notAvailable: false,
      isDeleted: false,
    },
    {
      id: "2",
      name: "Bed B2",
      bedTypeId: "NICU",
      bedGroupId: "G2",
      bedTypeName: "NICU",
      bedGroupName: "Children Ward",
      notAvailable: true,
      isDeleted: false,
    },
    {
      id: "3",
      name: "Bed C3",
      bedTypeId: "Deluxe",
      bedGroupId: "G3",
      bedTypeName: "Deluxe",
      bedGroupName: "Premium Ward",
      notAvailable: false,
      isDeleted: true,
    },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filtered = showDeleted ? dummyBeds : dummyBeds.filter(b => !b.isDeleted);
      setBeds(filtered);
      setLoading(false);
    }, 500);
  }, [showDeleted]);

  const filteredBeds = useMemo(() => {
    return beds.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bedGroupName.toLowerCase().includes(search.toLowerCase()) ||
      b.bedTypeName.toLowerCase().includes(search.toLowerCase())
    );
  }, [beds, search]);

  const totalPages = Math.ceil(filteredBeds.length / rowsPerPage);
  const paginatedBeds = filteredBeds.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSave = async (bed: any) => {
    if (bed.id) {
      toast.success("Updated (Dummy)");
      setBeds(prev => prev.map(x => (x.id === bed.id ? { ...x, ...bed } : x)));
    } else {
      toast.success("Created (Dummy)");
      const newBed = { ...bed, id: Date.now().toString(), bedTypeName: "ICU", bedGroupName: "General" };
      setBeds(prev => [...prev, newBed]);
    }
  };

  const handleDelete = (id: string, isDeleted: boolean) => {
    const confirmDelete = confirm(
      isDeleted ? "Permanently delete this bed?" : "Delete this bed?"
    );
    if (!confirmDelete) return;

    toast.success(isDeleted ? "Permanently Deleted (Dummy)" : "Deleted (Dummy)");
    setBeds(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Search beds..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            id="deleted"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
          />
          <Label htmlFor="deleted">Show deleted</Label>
        </div>

        <BedModal onSave={handleSave} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Bed Type</TableHead>
            <TableHead>Bed Group</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading dummy beds...
              </TableCell>
            </TableRow>
          ) : paginatedBeds.length > 0 ? (
            paginatedBeds.map((b) => (
              <TableRow key={b.id} className={b.isDeleted ? "opacity-50" : ""}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.bedTypeName}</TableCell>
                <TableCell>{b.bedGroupName}</TableCell>
                <TableCell>{b.notAvailable ? "Not Available" : "Available"}</TableCell>

                <TableCell className="text-right space-x-2">
                  {!b.isDeleted && <BedModal initialData={b} onSave={handleSave} />}

                  <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id, b.isDeleted)}>
                    {b.isDeleted ? "Permanent Delete" : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No dummy beds found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </Button>

          <span className="px-2">
            Page {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
