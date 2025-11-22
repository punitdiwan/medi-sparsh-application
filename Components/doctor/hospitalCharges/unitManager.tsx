"use client";

import { useState, useMemo, JSX } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import UnitModal from "./unitmodel";

interface UnitItem {
  id: number;
  name: string;
}

export default function UnitManager(): JSX.Element {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState<UnitItem | null>(null);

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [units, setUnits] = useState<UnitItem[]>([
    { id: 1, name: "mg" },
    { id: 2, name: "ml" },
    { id: 3, name: "bottle" },
  ]);

  const filteredUnits = useMemo(() => {
    return units.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, units]);

  const totalPages = Math.ceil(filteredUnits.length / rowsPerPage);

  const paginated = filteredUnits.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleAddEdit = (data: { name: string }) => {
    if (editingData) {
      setUnits((prev) =>
        prev.map((item) =>
          item.id === editingData.id ? { ...item, name: data.name } : item
        )
      );
      toast.success("Unit updated successfully");
    } else {
      setUnits((prev) => [...prev, { id: Date.now(), name: data.name }]);
      toast.success("Unit added successfully");
    }

    setEditingData(null);
  };

  const handleDelete = (id: number) => {
    setUnits((prev) => prev.filter((item) => item.id !== id));
    toast.success("Unit deleted");
  };

  return (
    <div className="p-6 space-y-5">

      <Card className="border shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Unit Manager</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Input
            placeholder="Search unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          <Button
            onClick={() => {
              setEditingData(null);
              setOpenModal(true);
            }}
          >
            + Add Unit
          </Button>
        </CardContent>
      </Card>

      <Card >
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right w-40">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingData(item);
                          setOpenModal(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-5 text-muted-foreground"
                  >
                    No units found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <UnitModal
        open={openModal}
        defaultData={editingData}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddEdit}
      />
    </div>
  );
}
