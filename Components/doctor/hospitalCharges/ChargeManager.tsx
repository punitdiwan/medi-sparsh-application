"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { ChargeModal ,ChargeItem} from "./chargeModal";


export default function ChargeManager() {
  const [data, setData] = useState<ChargeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ChargeItem | null>(null);

  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setData([
        {
            id: "1",
            chargeType: "OPD",
            category: "Consultation",
            unitType: "Per Visit",
            name: "General Consultation",
            taxCategory: "GST 18%",
            taxPercentage: 18,
            standardCharge: 500,
            description: "General OPD consultation charge",
            isDeleted: undefined
        },
        {
            id: "2",
            chargeType: "LAB",
            category: "Test",
            unitType: "Per Test",
            name: "Blood Test",
            taxCategory: "GST 12%",
            taxPercentage: 12,
            standardCharge: 300,
            description: "Routine CBC test",
            isDeleted: undefined
        },
      ]);

      setLoading(false);
    }, 400);
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.chargeType.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchDeleted = showDeleted ? item.isDeleted : !item.isDeleted;

      return matchSearch && matchDeleted;
    });
  }, [data, search, showDeleted]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSubmit = (item: ChargeItem) => {
    if (editData && item.id) {

      setData((prev) =>
        prev.map((i) => (i.id === item.id ? { ...item } : i))
      );
      toast.success("Charge updated!");
    } else {

      const newItem: ChargeItem = {
        ...item,
        id: crypto.randomUUID(),
        isDeleted: false,
      };
      setData((prev) => [...prev, newItem]);
      toast.success("Charge added!");
    }

    setModalOpen(false);
    setEditData(null);
  };

  const handleDelete = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: true } : i))
    );
    toast.success("Charge soft deleted!");
  };

  const handleReactivate = (id: string) => {
    setData((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isDeleted: false } : i))
    );
    toast.success("Charge restored!");
  };

  const handlePermanentDelete = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
    toast.success("Charge permanently deleted!");
  };

  return (
    <div className="p-4 space-y-4">

      <div className="flex items-center justify-between gap-4">

        <Input
          placeholder="Search charge..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            id="deleted-filter"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
          />
          <Label htmlFor="deleted-filter">Show Deleted Only</Label>
        </div>

        <Button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          + Add Charge
        </Button>
      </div>


      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Charge</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : paginated.length > 0 ? (
            paginated.map((item) => (
              <TableRow
                key={item.id}
                className={item.isDeleted ? "opacity-50" : ""}
              >
                <TableCell>{item.chargeType}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.unitType}</TableCell>
                <TableCell>
                  {item.taxCategory} ({item.taxPercentage}%)
                </TableCell>
                <TableCell>₹{item.standardCharge}</TableCell>

                <TableCell className="text-right space-x-2">

                  {!item.isDeleted ? (
                    <>
                      {/* Edit */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditData(item);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <ConfirmDialog
                        title="Delete Charge?"
                        description="This will soft-delete the charge."
                        onConfirm={() => handleDelete(item.id!)}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <ConfirmDialog
                        title="Restore Charge?"
                        description="This will reactivate the charge."
                        onConfirm={() => handleReactivate(item.id!)}
                        trigger={
                          <Button size="sm" variant="outline">
                            Restore
                          </Button>
                        }
                      />

                      <ConfirmDialog
                        title="Permanently Delete?"
                        description="This cannot be undone."
                        onConfirm={() => handlePermanentDelete(item.id!)}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Delete Forever
                          </Button>
                        }
                      />
                    </>
                  )}

                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No charges found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </Button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <ChargeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        defaultData={editData}
      />
    </div>
  );
}
