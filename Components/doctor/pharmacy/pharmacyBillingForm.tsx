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



import { getPharmacyMedicines } from "@/lib/actions/pharmacyMedicines";
import { getMedicineCategories } from "@/lib/actions/medicineCategories";
import { createPharmacySale } from "@/lib/actions/pharmacySales";
import { toast } from "sonner";
import { useEffect } from "react";

// ... (keep categories if needed, or fetch them too)

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
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [medicinesRes, categoriesRes] = await Promise.all([
        getPharmacyMedicines(),
        getMedicineCategories(),
      ]);

      if (medicinesRes.error) {
        toast.error(medicinesRes.error);
      } else if (medicinesRes.data) {
        // Map DB medicines to the format expected by the form/dialog
        const mapped = medicinesRes.data.map((m: any) => ({
          id: m.id,
          name: m.name,
          categoryId: m.categoryId,
          categoryName: m.categoryName,
          // expiry: m.expiry, // Check if expiry is available in pharmacyMedicines query
          availableQuantity: Number(m.quantity),
          sellingPrice: 0, // You might need to fetch selling price or let user input it
        }));
        setAllMedicines(mapped);
      }

      if (categoriesRes.error) {
        toast.error(categoriesRes.error);
      } else if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    };
    fetchData();
  }, []);

  // Recalculate billing details
  const recalcBilling = (
    currentMedicines: Medicine[],
    discountVal: number,
    discountType: "amount" | "percentage",
    taxVal: number,
    taxType: "amount" | "percentage"
  ) => {
    const total = currentMedicines.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    let discount = 0;
    let tax = 0;

    // Calculate Discount
    if (discountType === "percentage") {
      discount = (total * discountVal) / 100;
    } else {
      discount = discountVal;
    }

    // Calculate Tax (on amount after discount? usually on taxable value. Let's assume on total - discount)
    const taxableAmount = total - discount;
    if (taxType === "percentage") {
      tax = (taxableAmount * taxVal) / 100;
    } else {
      tax = taxVal;
    }

    const net = total - discount + tax;

    return {
      total,
      discount,
      tax,
      net,
    };
  };

  const updateBilling = (
    newMedicines: Medicine[],
    discVal: number,
    discType: "amount" | "percentage",
    taxVal: number,
    taxType: "amount" | "percentage"
  ) => {
    const { total, discount, tax, net } = recalcBilling(
      newMedicines,
      discVal,
      discType,
      taxVal,
      taxType
    );

    setMedicines(newMedicines);
    setTotalAmount(total);
    setDiscountAmount(discount);
    setTaxAmount(tax);
    setNetAmount(net);

    // Update percentage/amount states based on type to keep UI consistent
    if (discType === "percentage") {
      setDiscountPercentage(discVal);
      // discountAmount is already set from calc
    } else {
      setDiscountAmount(discVal);
      // calculate percentage if needed, or just leave as is
      setDiscountPercentage(total > 0 ? (discVal / total) * 100 : 0);
    }

    if (taxType === "percentage") {
      setTaxPercentage(taxVal);
    } else {
      setTaxAmount(taxVal);
      setTaxPercentage(taxableAmount > 0 ? (taxVal / taxableAmount) * 100 : 0);
    }
  };

  // Helper to get taxable amount for tax percentage calculation when updating by amount
  const taxableAmount = totalAmount - discountAmount;

  const handleSaveMedicine = (medicine: Medicine) => {
    let updatedList = [...medicines];
    const index = updatedList.findIndex((m) => m.id === medicine.id);

    if (index >= 0) {
      updatedList[index] = medicine;
    } else {
      updatedList.push(medicine);
    }

    // Recalculate with current discount/tax settings
    // We'll use the current percentage states as the source of truth for simplicity, 
    // or we could track which mode is active. 
    // For now, let's assume percentage is the driver if > 0, else amount.
    // Actually, let's just use the current values in state.
    // But wait, updateBilling takes specific values. 
    // Let's just re-run the calculation using current state values.

    // To simplify, let's just call a specialized update that uses current state
    const { total, discount, tax, net } = recalcBilling(
      updatedList,
      discountPercentage,
      "percentage", // Defaulting to percentage based calc for updates
      taxPercentage,
      "percentage"
    );

    setMedicines(updatedList);
    setTotalAmount(total);
    setDiscountAmount(discount);
    setTaxAmount(tax);
    setNetAmount(net);
    setEditMedicine(null);
  };

  const handleDeleteMedicine = (id: string) => {
    const updatedList = medicines.filter((m) => m.id !== id);

    const { total, discount, tax, net } = recalcBilling(
      updatedList,
      discountPercentage,
      "percentage",
      taxPercentage,
      "percentage"
    );

    setMedicines(updatedList);
    setTotalAmount(total);
    setDiscountAmount(discount);
    setTaxAmount(tax);
    setNetAmount(net);
  };

  const handleDiscountChange = (val: number, type: "amount" | "percentage") => {
    if (type === "percentage") {
      setDiscountPercentage(val);
      const { discount, net, tax } = recalcBilling(medicines, val, "percentage", taxPercentage, "percentage");
      setDiscountAmount(discount);
      setTaxAmount(tax);
      setNetAmount(net);
    } else {
      setDiscountAmount(val);
      // If changing amount, we recalculate percentage
      const total = medicines.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const newPerc = total > 0 ? (val / total) * 100 : 0;
      setDiscountPercentage(newPerc);

      const { net, tax } = recalcBilling(medicines, val, "amount", taxPercentage, "percentage");
      setTaxAmount(tax);
      setNetAmount(net);
    }
  };

  const handleTaxChange = (val: number, type: "amount" | "percentage") => {
    if (type === "percentage") {
      setTaxPercentage(val);
      const { tax, net } = recalcBilling(medicines, discountPercentage, "percentage", val, "percentage");
      setTaxAmount(tax);
      setNetAmount(net);
    } else {
      setTaxAmount(val);
      const total = medicines.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const taxable = total - discountAmount;
      const newPerc = taxable > 0 ? (val / taxable) * 100 : 0;
      setTaxPercentage(newPerc);

      const { net } = recalcBilling(medicines, discountPercentage, "percentage", val, "amount");
      setNetAmount(net);
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || medicines.length === 0 || !paymentMode) {
      toast.error("Please fill all required fields");
      return;
    }

    const billingData = {
      customerName,
      customerPhone,
      medicines: medicines.map(m => ({
        id: m.medicineId || m.id, // Ensure correct ID is sent
        batchNumber: m.batchNumber,
        quantity: Number(m.quantity),
        sellingPrice: Number(m.sellingPrice || 0), // Changed from unitPrice to sellingPrice
        amount: Number(m.amount)
      })),
      totalAmount,
      discountAmount,
      taxAmount,
      netAmount,
      paymentMode,
      note,
    };

    const res = await createPharmacySale(billingData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Billing saved successfully");
      // Reset form
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
    }
  };

  return (
    <div className="p-6 space-y-6 w-full mx-auto mt-4">
      <BackButton />
      <h1 className="text-2xl font-bold">Customer Billing</h1>

      {/* Customer Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="flex justify-end">
        <MedicineDialog
          onSave={handleSaveMedicine}
          editMedicine={editMedicine}
          setEditMedicine={setEditMedicine} // <-- add this
          categories={categories}
          medicines={allMedicines}
        />
      </div>
      <div className="flex gap-4 w-full">
        <div className="w-[35%]">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Billing Information</h2>

            <div className="max-w-sm flex flex-col gap-2 mb-2">
              <Label>Total Amount</Label>
              <Input type="number" value={totalAmount} readOnly />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 w-full">
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => handleDiscountChange(Number(e.target.value), "percentage")}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Discount Amount</Label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value), "amount")}
                  className="w-full"
                />
              </div>
            </div>

            {/* Tax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 w-full">
                <Label>Tax Percentage</Label>
                <Input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => handleTaxChange(Number(e.target.value), "percentage")}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Tax Amount</Label>
                <Input
                  type="number"
                  value={taxAmount}
                  onChange={(e) => handleTaxChange(Number(e.target.value), "amount")}
                  className="w-full"
                />
              </div>
            </div>


            {/* Net Amount & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="flex flex-col gap-1 w-full">
                <Label>Net Amount</Label>
                <Input type="number" value={netAmount} readOnly className="w-full" />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <Label>Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="w-full">
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

        <div className="w-[65%]">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Added Medicines</h2>

            {medicines.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-lg border rounded bg-background">
                No medicines added yet
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] rounded scrollbar-show">
                <Table className="min-w-[800px]">
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
                        <TableCell>{med.batchNumber}</TableCell>
                        <TableCell>{med.expiryDate}</TableCell>
                        <TableCell>{med.quantity}</TableCell>
                        <TableCell>{med.availableQuantity}</TableCell>
                        <TableCell>{med.amount}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditMedicine(med)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(med.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>


        </div>
      </div>

    </div>
  );
}
