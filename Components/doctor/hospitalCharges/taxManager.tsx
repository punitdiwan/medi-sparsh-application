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
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
// ---------------- Types ----------------
interface Tax {
  id: string;
  name: string;
  percent: string; // API returns string for decimal
  isDeleted: boolean;
}

// ---------------------------------------

export default function TaxManager() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [showDeleted, setShowDeleted] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 5;

  const ability = useAbility();
  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<Tax | null>(null);

  // ------------ Fetch Data ------------
  useEffect(() => {
    fetchTaxes();
  }, [showDeleted]);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/tax-categories", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch tax categories");

      const data = await response.json();
      setTaxes(data);
    } catch (error) {
      console.error("Error fetching taxes:", error);
      toast.error("Failed to load tax categories");
    } finally {
      setLoading(false);
    }
  };

  // ------------ Filter & Search ------------
  const filtered = useMemo(() => {
    return taxes.filter((tax) => {
      const matchSearch =
        tax.name.toLowerCase().includes(search.toLowerCase()) ||
        tax.percent.toString().includes(search);

      // API handles showDeleted, but we filter search results locally
      return matchSearch;
    });
  }, [taxes, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ------------ Add / Edit Handler ------------
  const handleSubmit = async (data: { name: string; percentage: number }) => {
    try {
      if (editData) {
        // Edit Mode
        const response = await fetch(`/api/tax-categories/${editData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name, percent: data.percentage }),
        });

        if (!response.ok) throw new Error("Failed to update tax category");
        const updatedTax = await response.json();

        setTaxes((prev) =>
          prev.map((t) =>
            t.id === editData.id ? updatedTax : t
          )
        );
        toast.success("Tax updated successfully!");
      } else {
        // Add Mode
        const response = await fetch("/api/tax-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name, percent: data.percentage }),
        });

        if (!response.ok) throw new Error("Failed to create tax category");
        const newTax = await response.json();

        setTaxes((prev) => [newTax, ...prev]);
        toast.success("Tax added successfully!");
      }

      setModalOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Error saving tax:", error);
      toast.error("Failed to save tax category");
    }
  };

  // ------------ Soft Delete ------------
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tax-categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tax category");
      }

      // Remove from list (since we are showing active only)
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tax deleted (soft)!");
    } catch (error) {
      console.error("Error deleting tax:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete tax category");
    }
  };

  // ------------ Permanent Delete ------------
  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tax-categories/${id}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to permanently delete tax category");
      }

      setTaxes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tax permanently deleted!");
    } catch (error) {
      console.error("Error permanently deleting tax:", error);
      toast.error("Failed to permanently delete tax category");
    }
  };

  // ------------ Reactivate ------------
  const handleReactivate = async (id: string) => {
    try {
      const response = await fetch(`/api/tax-categories/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to restore tax category");

      // Remove from deleted list (since we are showing deleted only)
      setTaxes((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tax reactivated successfully!");
    } catch (error) {
      console.error("Error restoring tax:", error);
      toast.error("Failed to restore tax category");
    }
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
        <div className="flex flex-row flex-wrap items-center gap-3">
          <Can I="create" a="TaxCategory" ability={ability}>
            <Button
              onClick={() => {
                setEditData(null);
                setModalOpen(true);
              }}
            >
              Add Tax
            </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setOpen(true)}
                  className="p-2"
                >
                  <Upload className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload Tax Category Excel</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          </Can>
        </div>
      </div>
            <ExcelUploadModal
              open={open}
              setOpen={setOpen}
              entity="hospitalChargeTaxCategory"
            />
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
                <TableCell>{tax.percent}%</TableCell>

                <TableCell className="text-right space-x-2">
                  {!tax.isDeleted && (
                     <Can I="update" a="TaxCategory" ability={ability}>
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
                     </Can>
                  )}

                  {tax.isDeleted ? (
                    <>
                    <Can I="delete" a="TaxCategory" ability={ability}>
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
                      </Can>
                    </>
                  ) : (
                    <Can I="delete" a="TaxCategory" ability={ability}>
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
                    </Can>
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
            ? { name: editData.name, percentage: Number(editData.percent) }
            : null
        }
      />
    </div>
  );
}
