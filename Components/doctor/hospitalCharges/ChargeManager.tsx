"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";
import { ChargeModal, ChargeItem } from "./chargeModal";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Types for auxiliary data
interface Option {
  id: string;
  name: string;
}

interface TaxOption extends Option {
  percent: string;
}

interface ChargeCategoryOption extends Option {
  chargeTypeId: string;
}

export default function ChargeManager() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auxiliary Data
  const [chargeTypes, setChargeTypes] = useState<Option[]>([]);
  const [chargeCategories, setChargeCategories] = useState<ChargeCategoryOption[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [taxCategories, setTaxCategories] = useState<TaxOption[]>([]);

  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);

  const ability = useAbility();
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Data
  useEffect(() => {
    fetchData();
    fetchAuxiliaryData();
  }, [showDeleted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/charges?showDeleted=${showDeleted}`);
      if (!response.ok) throw new Error("Failed to fetch charges");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching charges:", error);
      toast.error("Failed to load charges");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [typesRes, catsRes, unitsRes, taxesRes] = await Promise.all([
        fetch("/api/charge-types"),
        fetch("/api/charge-categories"),
        fetch("/api/units"),
        fetch("/api/tax-categories"),
      ]);

      if (typesRes.ok) setChargeTypes(await typesRes.json());
      if (catsRes.ok) setChargeCategories(await catsRes.json());
      if (unitsRes.ok) setUnits(await unitsRes.json());
      if (taxesRes.ok) setTaxCategories(await taxesRes.json());

    } catch (error) {
      console.error("Error fetching auxiliary data:", error);
    }
  };

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.chargeTypeName && item.chargeTypeName.toLowerCase().includes(search.toLowerCase())) ||
        (item.chargeCategoryName && item.chargeCategoryName.toLowerCase().includes(search.toLowerCase()));

      return matchSearch;
    });
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSubmit = async (item: ChargeItem) => {
    try {
      if (editData) {
        // Update
        const response = await fetch(`/api/charges/${editData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to update charge");
        toast.success("Charge updated!");
      } else {
        // Create
        const response = await fetch("/api/charges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        if (!response.ok) throw new Error("Failed to create charge");
        toast.success("Charge added!");
      }
      fetchData();
      setModalOpen(false);
      setEditData(null);
    } catch (error) {
      console.error("Error saving charge:", error);
      toast.error("Failed to save charge");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/charges/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Charge soft deleted!");
      fetchData();
    } catch (error) {
      console.error("Error deleting charge:", error);
      toast.error("Failed to delete charge");
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      const response = await fetch(`/api/charges/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to restore");

      toast.success("Charge restored!");
      fetchData();
    } catch (error) {
      console.error("Error restoring charge:", error);
      toast.error("Failed to restore charge");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/charges/${id}?permanent=true`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete permanently");

      toast.success("Charge permanently deleted!");
      fetchData();
    } catch (error) {
      console.error("Error deleting charge:", error);
      toast.error("Failed to delete charge");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Hospital Charges Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Manage all hospital charges and rates.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
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
            <Can I="create" a="hospitalCharger" ability={ability}>
              <Button
                onClick={() => {
                  setEditData(null);
                  setModalOpen(true);
                }}
              >
                + Add Charge
              </Button>
            </Can>
          </div>


          <div className="rounded-md border">
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
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginated.length > 0 ? (
                  paginated.map((item) => (
                    <TableRow
                      key={item.id}
                      className={item.isDeleted ? "opacity-50" : ""}
                    >
                      <TableCell>{item.chargeTypeName || "N/A"}</TableCell>
                      <TableCell>{item.chargeCategoryName || "N/A"}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.unitName || "N/A"}</TableCell>
                      <TableCell>
                        {item.taxCategoryName || "N/A"} ({item.taxPercent}%)
                      </TableCell>
                      <TableCell>₹{item.amount}</TableCell>

                      <TableCell className="text-right space-x-2">

                        {!item.isDeleted ? (
                          <>
                            <Can I="update" a="hospitalCharger" ability={ability}>
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
                            </Can>
                            <Can I="delete" a="hospitalCharger" ability={ability}>
                              <ConfirmDialog
                                title="Delete Charge?"
                                description="This will soft-delete the charge."
                                onConfirm={() => handleDelete(item.id)}
                                trigger={
                                  <Button size="sm" variant="destructive">
                                    Delete
                                  </Button>
                                }
                              />
                            </Can>
                          </>
                        ) : (
                          <>
                            <Can I="delete" a="hospitalCharger" ability={ability}>
                              <ConfirmDialog
                                title="Restore Charge?"
                                description="This will reactivate the charge."
                                onConfirm={() => handleReactivate(item.id)}
                                trigger={
                                  <Button size="sm" variant="outline">
                                    Restore
                                  </Button>
                                }
                              />

                              <ConfirmDialog
                                title="Permanently Delete?"
                                description="This cannot be undone."
                                onConfirm={() => handlePermanentDelete(item.id)}
                                trigger={
                                  <Button size="sm" variant="destructive">
                                    Delete Forever
                                  </Button>
                                }
                              />
                            </Can>
                          </>
                        )}

                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-4"
                    >
                      No charges found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </div>
      </CardContent>
      <ChargeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
        defaultData={editData}
        chargeTypes={chargeTypes}
        chargeCategories={chargeCategories}
        units={units}
        taxCategories={taxCategories}
      />
    </Card>
  );
}
