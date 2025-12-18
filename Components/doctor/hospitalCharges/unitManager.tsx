"use client";

import { useState, useMemo, useEffect, JSX } from "react";
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
import { toast } from "sonner";
import UnitModal from "./unitmodel";
import ExcelUploadModal from "@/Components/HospitalExcel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload } from "lucide-react";
import { Can } from "@casl/react";
import { useAbility } from "@/components/providers/AbilityProvider";
import { PermissionButton } from "@/Components/role/PermissionButton";
interface UnitItem {
  id: string;
  name: string;
}

export default function UnitManager(): JSX.Element {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingData, setEditingData] = useState<UnitItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const rowsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const ability = useAbility();

  const [units, setUnits] = useState<UnitItem[]>([]);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/units");
      if (!response.ok) throw new Error("Failed to fetch units");
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddEdit = async (data: { name: string }) => {
    try {
      if (editingData) {
        // Update
        const response = await fetch(`/api/units/${editingData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name }),
        });

        if (!response.ok) throw new Error("Failed to update unit");
        const updatedUnit = await response.json();

        setUnits((prev) =>
          prev.map((item) =>
            item.id === editingData.id ? updatedUnit : item
          )
        );
        toast.success("Unit updated successfully");
      } else {
        // Add
        const response = await fetch("/api/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name }),
        });

        if (!response.ok) throw new Error("Failed to create unit");
        const newUnit = await response.json();

        setUnits((prev) => [newUnit, ...prev]);
        toast.success("Unit added successfully");
      }
      setEditingData(null);
    } catch (error) {
      console.error("Error saving unit:", error);
      toast.error("Failed to save unit");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this unit?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/units/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete unit");
      }

      setUnits((prev) => prev.filter((item) => item.id !== id));
      toast.success("Unit deleted successfully");
    } catch (error) {
      console.error("Error deleting unit:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete unit");
    }
  };

  return (
    <div className="p-6 space-y-5">

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-row flex-wrap items-center gap-3">
          <Can I="create" a="ChargesUnit" ability={ability}>
            <Button
              onClick={() => {
                setEditingData(null);
                setOpenModal(true);
              }}
            >
              + Add Unit
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
                  <p>Upload Unit Excel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Can>
        </div>
      </div>
      <ExcelUploadModal
        open={open}
        setOpen={setOpen}
        entity="hopitalChargeUnit"
          />
      <Table>
        <TableHeader className="sticky top-0 items-center z-10">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right w-40">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-5 text-muted-foreground">
                Loading units...
              </TableCell>
            </TableRow>
          ) : paginated.length > 0 ? (
            paginated.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Can I="update" a="ChargesUnit" ability={ability}>
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
                  </Can>
                  <Can I="delete" a="ChargesUnit" ability={ability}>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </Can>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center py-5 text-muted-foreground"
              >
                No units found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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

