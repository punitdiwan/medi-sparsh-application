"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash } from "lucide-react";

import AddSupplierModal, {
  SupplierFormData
} from "@/components/model/AddSupplierModal";

export default function SupplierManager() {
  const [openModal, setOpenModal] = useState(false);
  const [editingSupplier, setEditingSupplier] =
    useState<SupplierFormData | null>(null);

  const [search, setSearch] = useState("");

  const [suppliers, setSuppliers] = useState<SupplierFormData[]>([
    {
      supplierName: "HealthCare Distributors",
      supplierContact: "9876543210",
      contactPersonName: "Ramesh Kumar",
      contactPersonPhone: "9876501234",
      drugLicenseNumber: "DL-456789",
      address: "Delhi, India"
    }
  ]);

  // ADD OR UPDATE SUPPLIER
  const handleSubmitSupplier = (data: SupplierFormData) => {
    if (editingSupplier) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.supplierName === editingSupplier.supplierName ? data : s
        )
      );
      setEditingSupplier(null);
    } else {
      setSuppliers([...suppliers, data]);
    }
  };

  // EDIT
  const handleEdit = (supplier: SupplierFormData) => {
    setEditingSupplier(supplier);
    setOpenModal(true);
  };

  // DELETE
  const handleDelete = (supplier: SupplierFormData) => {
    setSuppliers((prev) =>
      prev.filter((s) => s.supplierName !== supplier.supplierName)
    );
  };

  // FILTER SUPPLIERS
  const filteredSuppliers = suppliers.filter((s) => {
    const text = search.toLowerCase();
    return (
      s.supplierName.toLowerCase().includes(text) ||
      s.supplierContact.toLowerCase().includes(text) ||
      s.contactPersonName.toLowerCase().includes(text) ||
      s.drugLicenseNumber.toLowerCase().includes(text) ||
      s.address.toLowerCase().includes(text)
    );
  });

  return (
    <>
      <Card className="w-full p-4 shadow-sm">
        <CardHeader >
            <CardTitle>Supplier Manager</CardTitle>
            <CardDescription>Manage Supplier here.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <Input
              placeholder="Search Supplier..."
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              className="flex gap-2"
              onClick={() => {
                setEditingSupplier(null);
                setOpenModal(true);
              }}
            >
              <Plus size={16} /> Add Supplier
            </Button>
          </div>

          {/* TABLE */}
          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Person Phone</TableHead>
                  <TableHead>License No.</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSuppliers.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{s.supplierName}</TableCell>
                    <TableCell>{s.supplierContact}</TableCell>
                    <TableCell>{s.contactPersonName}</TableCell>
                    <TableCell>{s.contactPersonPhone}</TableCell>
                    <TableCell>{s.drugLicenseNumber}</TableCell>
                    <TableCell>{s.address}</TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(s)}
                        >
                          <Pencil size={14} /> Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(s)}
                        >
                          <Trash size={14} /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL */}
      <AddSupplierModal
        open={openModal}
        setOpen={setOpenModal}
        onSubmit={handleSubmitSupplier}
        initialData={editingSupplier}
      />
    </>
  );
}
