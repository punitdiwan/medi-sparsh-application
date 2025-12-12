"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import MedicineDialog, { Medicine } from "./pharmacyDialogContent";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BackButton from "@/Components/BackButton";

const categories = [
  { id: "cat1", name: "Tablet" },
  { id: "cat2", name: "Syrup" },
];

const allMedicines = [
  {
    id: "med1",
    name: "Paracetamol",
    categoryId: "cat1",
    expiry: "2026-08",
    availableQuantity: 200,
    sellingPrice: 10,
  },
  {
    id: "med2",
    name: "Crocin",
    categoryId: "cat1",
    expiry: "2027-01",
    availableQuantity: 150,
    sellingPrice: 12,
  },
  {
    id: "med3",
    name: "Cough Syrup",
    categoryId: "cat2",
    expiry: "2025-10",
    availableQuantity: 50,
    sellingPrice: 90,
  },
];

export default function PharmacyBillingForm() {
  // Customer + Billing Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Medicines
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [editMedicine, setEditMedicine] = useState<Medicine | null>(null);

  // -----------------------------
  // Billing calculations
  // -----------------------------
  const recalcBilling = (
    total: number,
    discPerc: number,
    discAmt: number,
    taxPerc: number,
    taxAmt: number
  ) => {
    let discount = discAmt;
    if (discPerc) discount = (total * discPerc) / 100;

    let tax = taxAmt;
    if (taxPerc) tax = ((total - discount) * taxPerc) / 100;

    const net = total - discount + tax;

    return { discount, tax, net };
  };

  const updateBilling = (updatedMedicines: Medicine[]) => {
    const total = updatedMedicines.reduce((sum, med) => sum + (med.amount || 0), 0);
    const { discount, tax, net } = recalcBilling(
      total,
      discountPercentage,
      discountAmount,
      taxPercentage,
      taxAmount
    );

    setTotalAmount(total);
    setDiscountAmount(discount);
    setTaxAmount(tax);
    setNetAmount(net);
  };

  // -----------------------------
  // Medicine handlers
  // -----------------------------
  const handleSaveMedicine = (medicine: any) => {
    const category = categories.find((c) => c.id === medicine.categoryId);
    const medNameObj = allMedicines.find((m) => m.id === medicine.medicineId);

    const medWithNames = {
      ...medicine,
      medicineCategory: category?.name || "",
      medicineName: medNameObj?.name || "",
    };

    setMedicines((prev) => {
      const exists = prev.some((m) => m.id === medicine.id);
      const updated = exists
        ? prev.map((m) => (m.id === medicine.id ? medWithNames : m))
        : [...prev, medWithNames];

      updateBilling(updated);
      return updated;
    });

    setEditMedicine(null);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      updateBilling(updated);
      return updated;
    });
  };

  // -----------------------------
  // Discount / Tax handlers
  // -----------------------------
  const handleDiscountChange = (value: number, type: "amount" | "percentage") => {
    let discAmt = discountAmount;
    let discPerc = discountPercentage;

    if (type === "amount") discAmt = value;
    else discPerc = value;

    const { discount, tax, net } = recalcBilling(totalAmount, discPerc, discAmt, taxPercentage, taxAmount);

    setDiscountAmount(discount);
    setDiscountPercentage(discPerc);
    setNetAmount(net);
  };

  const handleTaxChange = (value: number, type: "amount" | "percentage") => {
    let taxAmt = taxAmount;
    let taxPerc = taxPercentage;

    if (type === "amount") taxAmt = value;
    else taxPerc = value;

    const { discount, tax, net } = recalcBilling(totalAmount, discountPercentage, discountAmount, taxPerc, taxAmt);

    setTaxAmount(tax);
    setTaxPercentage(taxPerc);
    setNetAmount(net);
  };

  // -----------------------------
  // Submit handler
  // -----------------------------
  const handleSubmit = () => {
    const billingData = {
      customerName,
      customerPhone,
      medicines,
      totalAmount,
      discountAmount,
      discountPercentage,
      taxAmount,
      taxPercentage,
      netAmount,
      paymentMode,
      paymentAmount,
      note,
    };
    console.log("Billing Data:", billingData);
    alert("Billing saved! Check console for data.");

    // Reset customer and billing info for next entry
    setCustomerName("");
    setCustomerPhone("");
    setNote("");
    setMedicines([]);
    setTotalAmount(0);
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setTaxAmount(0);
    setTaxPercentage(0);
    setNetAmount(0);
    setPaymentMode("");
    setPaymentAmount(0);
  };

  return (
    <div className="p-6 space-y-6 w-full mx-auto mt-4">
      <BackButton/>
      <h1 className="text-2xl font-bold">Customer Billing</h1>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Customer Name</Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Customer Phone</Label>
          <Input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      <div className="flex justify-end">
        <MedicineDialog
          onSave={handleSaveMedicine}
          editMedicine={editMedicine}
          categories={categories}
          medicines={allMedicines}
        />
      </div>

      {/* Medicines Table */}
      {medicines.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Added Medicines</h2>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell>{med.medicineCategory}</TableCell>
                    <TableCell>{med.medicineName}</TableCell>
                    <TableCell>{med.expiryDate}</TableCell>
                    <TableCell>{med.quantity}</TableCell>
                    <TableCell>{med.availableQuantity}</TableCell>
                    <TableCell>{med.amount}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditMedicine(med)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(med.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Billing Information */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Billing Information</h2>

        {/* Total */}
        <div className="max-w-sm flex flex-col gap-2 mb-2">
          <Label>Total Amount</Label>
          <Input type="number" value={totalAmount} readOnly />
        </div>

        {/* Discount */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <Label>Discount Percentage</Label>
            <Input
              type="number"
              value={discountPercentage}
              onChange={(e) => handleDiscountChange(Number(e.target.value), "percentage")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Discount Amount</Label>
            <Input
              type="number"
              value={discountAmount}
              onChange={(e) => handleDiscountChange(Number(e.target.value), "amount")}
            />
          </div>
        </div>

        {/* Tax */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <Label>Tax Percentage</Label>
            <Input
              type="number"
              value={taxPercentage}
              onChange={(e) => handleTaxChange(Number(e.target.value), "percentage")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Tax Amount</Label>
            <Input
              type="number"
              value={taxAmount}
              onChange={(e) => handleTaxChange(Number(e.target.value), "amount")}
            />
          </div>
        </div>

        {/* Net Amount & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mt-2">
          <div className="flex flex-col gap-1">
            <Label>Net Amount</Label>
            <Input type="number" value={netAmount} readOnly />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Payment Mode</Label>
            <Select value={paymentMode} onValueChange={setPaymentMode}>
              <SelectTrigger>
                <SelectValue placeholder="Select Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div className="max-w-lg flex flex-col gap-2 mt-2">
          <Label>Note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add notes if any" />
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-6">
          <Button type="button" size="lg" onClick={handleSubmit}>
            Save Billing
          </Button>
        </div>
      </Card>
    </div>
  );
}
