"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShiftModal } from "./shiftModal";
import { MdEdit, MdDelete, MdRestore } from "react-icons/md";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
export function ShiftManagerPage() {
  const [search, setSearch] = useState("");
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const ability = useAbility();
  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/shifts", window.location.origin);
      url.searchParams.set("showDeleted", showDeleted.toString());
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      } else {
        console.error("Failed to fetch shifts");
        toast.error("Failed to fetch shifts");
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      toast.error("Error fetching shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [showDeleted]);

  useEffect(() => {
    const result = shifts.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, shifts]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Add / Update
  const handleSave = async (data) => {
    try {
      if (data.id) {
        // Update existing
        const res = await fetch(`/api/shifts/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          fetchShifts();
          toast.success("Shift updated successfully");
        } else {
          toast.error("Failed to update shift");
        }
      } else {
        // Add new
        const res = await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          fetchShifts();
          toast.success("Shift added successfully");
        } else {
          toast.error("Failed to add shift");
        }
      }
    } catch (error) {
      console.error("Error saving shift:", error);
      toast.error("Error saving shift");
    }
  };

  const performDelete = async (id, isAlreadyDeleted) => {
    try {
      const url = new URL(`/api/shifts/${id}`, window.location.origin);
      if (isAlreadyDeleted) {
        url.searchParams.set("permanent", "true");
      }

      const res = await fetch(url.toString(), {
        method: "DELETE",
      });

      if (res.ok) {
        fetchShifts();
        toast.success(isAlreadyDeleted ? "Shift permanently deleted" : "Shift deleted successfully");
      } else {
        toast.error("Failed to delete shift");
      }
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Error deleting shift");
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await fetch(`/api/shifts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });

      if (res.ok) {
        fetchShifts();
        toast.success("Shift restored successfully");
      } else {
        toast.error("Failed to restore shift");
      }
    } catch (error) {
      console.error("Error restoring shift:", error);
      toast.error("Error restoring shift");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Shifts Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Create Shifts here.
          </CardDescription>
        </div>
      </CardHeader>
      {/* <Separator /> */}
      <CardContent>
        <div className="p-6 space-y-6">

          {/* Search & Add */}
          <div className="flex items-center justify-between">
            <Input
              placeholder="Search shift..."
              className="w-1/3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="deleted"
                  checked={showDeleted}
                  onCheckedChange={setShowDeleted}
                />
                <Label htmlFor="deleted">Show deleted</Label>
              </div>
              <Can I="create" a="hospitalShift" ability={ability}>
                <Button
                  onClick={() => {
                    setSelectedShift(null);
                    setModalOpen(true);
                  }}
                >
                  Add Shift
                </Button>
              </Can>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Shift Name</TableHead>
                  <TableHead className="text-center">From</TableHead>
                  <TableHead className="text-center">To</TableHead>
                  <TableHead className="w-32 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={item.id} className={item.isDeleted ? "opacity-60" : ""}>
                      <TableCell className="text-center">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>

                      <TableCell>{item.name}</TableCell>

                      <TableCell className="text-center">
                        {item.startTime}
                      </TableCell>

                      <TableCell className="text-center">
                        {item.endTime}
                      </TableCell>

                      <TableCell className="flex justify-center gap-3">
                        {!item.isDeleted ? (
                          <Can I="update" a="hospitalShift" ability={ability}>
                            <MdEdit
                              size={20}
                              className="cursor-pointer text-blue-600"
                              onClick={() => {
                                setSelectedShift(item);
                                setModalOpen(true);
                              }}
                            />
                          </Can>
                        ) : (
                          <Can I="delete" a="hospitalShift" ability={ability}>
                            <MdRestore
                              size={20}
                              className="cursor-pointer text-green-600"
                              onClick={() => handleRestore(item.id)}
                              title="Restore"
                            />
                          </Can>
                        )}
                        <Can I="delete" a="hospitalShift" ability={ability}>
                          <ConfirmDialog
                            trigger={
                              <MdDelete
                                size={20}
                                className="cursor-pointer text-red-600"
                              />
                            }
                            title={item.isDeleted ? "Permanently Delete Shift?" : "Delete Shift?"}
                            description={
                              item.isDeleted
                                ? "This shift is already deleted. Click confirm to permanently delete it."
                                : "Are you sure you want to delete this shift?"
                            }
                            actionLabel={item.isDeleted ? "Permanently Delete" : "Delete"}
                            cancelLabel="Cancel"
                            onConfirm={() => performDelete(item.id, item.isDeleted)}
                          />
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-3">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span>
              Page {page} of {totalPages || 1}
            </span>

            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>

          {/* Modal */}
          <ShiftModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleSave}
            initialData={selectedShift}
          />
        </div>
      </CardContent>
    </Card>
  );
}


