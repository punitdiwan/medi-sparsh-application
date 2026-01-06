"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Edit, Trash2, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";

import AddSupplierModal, { Supplier } from "@/components/model/AddSupplierModal";
import { getMedicineSuppliers, createMedicineSupplier, updateMedicineSupplier, deleteMedicineSupplier, restoreMedicineSupplier } from "@/lib/actions/medicineSuppliers";
import { useAbility } from "@/components/providers/AbilityProvider";
import { Can } from "@casl/react";
import { ConfirmDialog } from "@/components/model/ConfirmationModel";

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const ability = useAbility();

  useEffect(() => {
    fetchSuppliers();
  }, [showDeleted]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const result = await getMedicineSuppliers(showDeleted);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setSuppliers(result.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const q = search.toLowerCase();
    return suppliers.filter((s) =>
      s.supplierName.toLowerCase().includes(q) ||
      s.contactNumber.toLowerCase().includes(q) ||
      s.contactPerson.toLowerCase().includes(q) ||
      s.drugLicenseNumber.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  }, [search, suppliers]);

  const handleSave = async (item: Supplier) => {
    try {
      const exists = suppliers.some((s) => s.id === item.id);

      let result;
      if (exists) {
        result = await updateMedicineSupplier(item.id, {
          supplierName: item.supplierName,
          contactNumber: item.contactNumber,
          address: item.address,
          contactPerson: item.contactPerson,
          contactPersonNumber: item.contactPersonNumber,
          drugLicenseNumber: item.drugLicenseNumber,
        });
      } else {
        result = await createMedicineSupplier({
          supplierName: item.supplierName,
          contactNumber: item.contactNumber,
          address: item.address,
          contactPerson: item.contactPerson,
          contactPersonNumber: item.contactPersonNumber,
          drugLicenseNumber: item.drugLicenseNumber,
        });
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(exists ? "Supplier updated" : "Supplier added");
      fetchSuppliers();
      setEditing(null);
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("Failed to save supplier");
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const result = await deleteMedicineSupplier(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Supplier deleted");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const result = await restoreMedicineSupplier(id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Supplier restored");
      fetchSuppliers();
    } catch (error) {
      console.error("Error restoring supplier:", error);
      toast.error("Failed to restore supplier");
    }
  };

  return (
    <Card className="shadow-md border border-dialog bg-card/50 backdrop-blur-sm p-0">
      <CardHeader className="px-6 py-4 text-white bg-Module-header rounded-t-xl">
        <div>
          <CardTitle className="text-2xl font-bold">Supplier Management</CardTitle>
          <CardDescription className="mt-1 text-indigo-100">
            Manage medicine suppliers and their information.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <Input
            placeholder="Search Supplier..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex items-center gap-4">
            {/* Status Filter Switch */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-deleted"
                checked={showDeleted}
                onCheckedChange={setShowDeleted}
              />
              <Label htmlFor="show-deleted" className="cursor-pointer">
                Show Deleted
              </Label>
            </div>
            <Can I="create" a="medicineSupplier" ability={ability}>
              <Button
                className="flex gap-2"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                <Plus size={16} /> Add Supplier
              </Button>
            </Can>
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Person Phone</TableHead>
                <TableHead>License No.</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((supplier) => (
                  <TableRow key={supplier.id} className={supplier.isDeleted ? "opacity-60" : ""}>
                    <TableCell>{supplier.supplierName}</TableCell>
                    <TableCell>{supplier.contactNumber}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.contactPersonNumber}</TableCell>
                    <TableCell>{supplier.drugLicenseNumber}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>
                      {supplier.isDeleted ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!supplier.isDeleted ? (
                        <>
                          <Can I="update" a="medicineSupplier" ability={ability}>
                            <Button variant="ghost" size="icon" onClick={() => { setEditing(supplier); setOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Can>
                          <Can I="delete" a="medicineSupplier" ability={ability}>
                            <ConfirmDialog
                              title="Delete Supplier"
                              description="Are you sure you want to delete this supplier? You can restore it later."
                              onConfirm={() => handleDeleteConfirm(supplier.id)}
                              trigger={
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              }
                            />
                          </Can>
                        </>
                      ) : (
                        <Can I="delete" a="medicineSupplier" ability={ability}>
                          <Button variant="ghost" size="icon" onClick={() => handleRestore(supplier.id)}>
                            <RotateCcw className="w-4 h-4 text-green-500" />
                          </Button>
                        </Can>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* MODAL */}
      <AddSupplierModal
        open={open}
        setOpen={(o) => { setOpen(o); if (!o) setEditing(null); }}
        supplier={editing ?? undefined}
        onSave={handleSave}
      />
    </Card>
  );
}
