// MedicineManager.tsx
"use client";

import { useMemo, useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MdEdit, MdDelete } from "react-icons/md";
import { toast } from "sonner";
import { MedicineModal, Medicine } from "./medicineModal";

export default function MedicineManager() {
  const categories = ["Tablet", "Syrup", "Injection"];
  const companies = ["Cipla", "Sun Pharma", "Alkem"];
  const units = ["mg", "ml", "mm"];

  const [search, setSearch] = useState("");
  const [data, setData] = useState<Medicine[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Medicine | undefined>(undefined);

  const filtered = useMemo(() => {
    return data.filter((m) =>
      m.medicineName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  const handleSave = (med: Medicine) => {
    if (editing) {
      setData((prev) => prev.map((x) => (x.id === med.id ? med : x)));
      toast.success("Medicine Updated");
    } else {
      setData((prev) => [...prev, med]);
      toast.success("Medicine Added");
    }
    setEditing(undefined);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((x) => x.id !== id));
    toast.success("Medicine Deleted");
  };

  return (
    <Card className="w-full p-4 shadow-sm">
      <CardHeader>
        <CardTitle>Medicine Manager</CardTitle>
        <CardDescription>Manage medicine here.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search + Add */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search Medicine..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button
            onClick={() => {
              setEditing(undefined);
              setOpenModal(true);
            }}
          >
            Add Medicine
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.company}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.note || "-"}</TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(item);
                          setOpenModal(true);
                        }}
                      >
                        <MdEdit size={18} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <MdDelete size={18} className="text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center">
                    No medicines found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal */}
        <MedicineModal
          open={openModal}
          onOpenChange={setOpenModal}
          medicine={editing}
          categories={categories}
          companies={companies}
          units={units}
          onSave={handleSave}
        />
      </CardContent>
    </Card>
  );
}
