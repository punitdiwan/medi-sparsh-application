"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TaxModal from "./taxModel";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

// ---------------- Types ----------------
interface Tax {
  id: string;
  name: string;
  percentage: number;
  isDeleted: boolean;
}

// ---------------------------------------

export default function TaxManager() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 5;

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<Tax | null>(null);

  // ------------ Load Dummy Data ------------
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTaxes([
        { id: "1", name: "GST", percentage: 18, isDeleted: false },
        { id: "2", name: "Service Tax", percentage: 12, isDeleted: false },
        { id: "3", name: "Luxury Tax", percentage: 28, isDeleted: true },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  // ------------ Filter & Search ------------
  const filtered = useMemo(() => {
    return taxes.filter((tax) => {
      const matchSearch =
        tax.name.toLowerCase().includes(search.toLowerCase()) ||
        tax.percentage.toString().includes(search);

      const matchDeleted = showDeleted ? tax.isDeleted : !tax.isDeleted;

      return matchSearch && matchDeleted;
    });
  }, [taxes, search, showDeleted]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ------------ Add / Edit Handler ------------
  const handleSubmit = (data: { name: string; percentage: number }) => {
    if (editData) {
      // Edit Mode
      setTaxes((prev) =>
        prev.map((t) =>
          t.id === editData.id ? { ...t, name: data.name, percentage: data.percentage } : t
        )
      );
      toast.success("Tax updated successfully!");
    } else {
      // Add Mode
      const newTax: Tax = {
        id: crypto.randomUUID(),
        name: data.name,
        percentage: data.percentage,
        isDeleted: false,
      };

      setTaxes((prev) => [...prev, newTax]);
      toast.success("Tax added successfully!");
    }

    setModalOpen(false);
    setEditData(null);
  };

  // ------------ Soft Delete ------------
  const handleDelete = (id: string) => {
    setTaxes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDeleted: true } : t))
    );
    toast.success("Tax deleted (soft)!");
  };

  // ------------ Permanent Delete ------------
  const handlePermanentDelete = (id: string) => {
    setTaxes((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tax permanently deleted!");
  };

  // ------------ Reactivate ------------
    const handleReactivate = (id: string) => {
    setTaxes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDeleted: false } : t))
    );
    toast.success("Tax reactivated successfully!");
    };


  return (
    <div className="p-4 space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search tax..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            id="show-deleted"
            checked={showDeleted}
            onCheckedChange={setShowDeleted}
          />
          <Label htmlFor="show-deleted">Show Deleted Only</Label>
        </div>

        <Button
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          Add Tax
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Percentage</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : paginated.length > 0 ? (
            paginated.map((tax) => (
              <TableRow key={tax.id} className={tax.isDeleted ? "opacity-60" : ""}>
                <TableCell>{tax.name}</TableCell>
                <TableCell>{tax.percentage}%</TableCell>

                <TableCell className="text-right space-x-2">
                {!tax.isDeleted && (
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setEditData(tax);
                        setModalOpen(true);
                    }}
                    >
                    Edit
                    </Button>
                )}

                {tax.isDeleted ? (
                    <>
                    {/* Reactivate with confirmation */}
                    <ConfirmDialog
                        title="Reactivate Tax?"
                        description="This will restore the tax back to active list."
                        onConfirm={() => handleReactivate(tax.id)}
                        trigger={
                        <Button variant="outline" size="sm">
                            Reactivate
                        </Button>
                        }
                    />

                    {/* Permanent Delete */}
                    <ConfirmDialog
                        title="Permanently delete?"
                        description="This action cannot be undone."
                        onConfirm={() => handlePermanentDelete(tax.id)}
                        trigger={
                        <Button variant="destructive" size="sm">
                            Permanent Delete
                        </Button>
                        }
                    />
                    </>
                ) : (
                    /* Soft Delete */
                    <ConfirmDialog
                    title="Delete Tax?"
                    description="This will soft delete the tax."
                    onConfirm={() => handleDelete(tax.id)}
                    trigger={
                        <Button variant="destructive" size="sm">
                        Delete
                        </Button>
                    }
                    />
                )}
                </TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No tax records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
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

      {/* Modal */}
      <TaxModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        defaultData={
          editData
            ? { name: editData.name, percentage: editData.percentage }
            : null
        }
      />
    </div>
  );
}
