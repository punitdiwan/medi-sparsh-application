"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BackButton from "@/Components/BackButton";

type Supplier = { id: string; name: string };
type Category = { id: string; name: string };
type Medicine = { id: string; name: string; };

type PurchaseItem = {
  id: number;
  categoryId: string;
  medicineId: string;
  batchNo: string;
  expiry: string;
  mrp: number;
  batchAmount: number;
  salePrice: number;
  packingQty: number;
  quantity: number;
  purchasePrice: number;
  taxPercent: number;
  amount: number;
};

export default function PurchaseMedicineModelPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [billNo, setBillNo] = useState("");

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [nextItemId, setNextItemId] = useState(1);

  const [discount, setDiscount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const [paymentNote, setPaymentNote] = useState<string>("");

  useEffect(() => {
    setSuppliers([
      { id: "s1", name: "HealthCare Suppliers" },
      { id: "s2", name: "MediPharma" },
    ]);
    setCategories([
      { id: "c1", name: "Tablet" },
      { id: "c2", name: "Syrup" },
    ]);
  }, []);

  const handleCategoryChange = (itemId: number, categoryId: string) => {
    setPurchaseItems((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, categoryId, medicineId: "" } : p))
    );

    if (categoryId === "c1")
      setMedicines([{ id: "m1", name: "Paracetamol"}]);
    else setMedicines([{ id: "m2", name: "Cough Syrup" }]);
  };

  const handleMedicineChange = (itemId: number, medicineId: string) => {
    const med = medicines.find((m) => m.id === medicineId);

    setPurchaseItems((prev) =>
      prev.map((p) =>
        p.id === itemId
          ? {
              ...p,
              medicineId,
            }
          : p
      )
    );
  };

  const handleInputChange = (
  itemId: number,
  field: keyof PurchaseItem,
  value: number | string
) => {
  setPurchaseItems((prev) =>
    prev.map((p) => {
      if (p.id !== itemId) return p;

      const numeric = ["mrp", "batchAmount", "salePrice", "packingQty", "quantity", "purchasePrice", "taxPercent"];

      const updated: PurchaseItem = {
        ...p,
        [field]: numeric.includes(field) ? Number(value) || 0 : value,
      };


      const qty = Number(updated.quantity) || 0;
      const price = Number(updated.purchasePrice) || 0;
      const taxPercent = Number(updated.taxPercent) || 0;

      const amountBeforeTax = qty * price;

      const taxAmount = (amountBeforeTax * taxPercent) / 100;

      updated.amount = amountBeforeTax + taxAmount;

      return updated;
    })
  );
};


  const addNewItem = () => {
    setPurchaseItems((prev) => [
      ...prev,
      {
        id: nextItemId,
        categoryId: "",
        medicineId: "",
        batchNo: "",
        expiry: "",
        mrp: 0,
        batchAmount: 0,
        salePrice: 0,
        packingQty: 0,
        quantity: 0,
        purchasePrice: 0,
        taxPercent: 0,
        amount: 0,
      },
    ]);

    setNextItemId(nextItemId + 1);
  };

  const removeItem = (id: number) => {
    setPurchaseItems((prev) => prev.filter((p) => p.id !== id));
  };


  const totalAmount = purchaseItems.reduce((sum, p) => sum + p.amount, 0);

  const discountAmount = (totalAmount * discount) / 100;

  const afterDiscount = totalAmount - discountAmount;

  const avgTaxPercent =
    purchaseItems.reduce((sum, p) => sum + Number(p.taxPercent || 0), 0) /
    (purchaseItems.length || 1);

  const taxAmount = (afterDiscount * avgTaxPercent) / 100;

  const netAmount = afterDiscount + taxAmount;

  const handleSavePurchase = () => {
  const payload = {
    supplierId: selectedSupplier,
    billNo,
    items: purchaseItems,
    summary: {
      totalAmount,
      discountPercent: discount,
      discountAmount,
      taxAmount,
      netAmount,
    },
    payment: {
      mode: paymentMode,
      note: paymentNote,
      paidAmount: netAmount,
    },
  };

  console.log("PURCHASE DATA:", payload);
};

  return (
    <div className="p-6 space-y-6">
        <BackButton/>
      <h1 className="text-3xl font-bold">Purchase Medicine</h1>

      <Card>
        <CardContent className="space-y-6 py-6">

          {/* SUPPLIER + BILL NO */}
          <div className="flex flex-wrap gap-6">
            <div className="w-[250px] flex flex-col gap-2">
              <Label>Supplier</Label>
              <Select
                value={selectedSupplier}
                onValueChange={(v) => setSelectedSupplier(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[250px] flex flex-col gap-2">
              <Label>Bill No</Label>
              <Input
                placeholder="Enter Bill Number"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
              />
            </div>
          </div>

         {purchaseItems.map((item) => (
            <Card key={item.id} className="p-4 mb-4">
                <div className="flex flex-wrap gap-4">

                {/* CATEGORY */}
                <div className="w-auto flex flex-col gap-2">
                    <Label>Category</Label>
                    <Select
                    value={item.categoryId}
                    onValueChange={(v) => handleCategoryChange(item.id, v)}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                            {c.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                {/* MEDICINE */}
                <div className="w-auto flex flex-col gap-2">
                    <Label>Medicine</Label>
                    <Select
                    value={item.medicineId}
                    onValueChange={(v) => handleMedicineChange(item.id, v)}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Medicine" />
                    </SelectTrigger>
                    <SelectContent>
                        {medicines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                            {m.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                {/* BATCH NO */}
                <div className="w-[120px] flex flex-col gap-2">
                    <Label>Batch No</Label>
                    <Input
                    value={item.batchNo}
                    onChange={(e) =>
                        handleInputChange(item.id, "batchNo", e.target.value)
                    }
                    />
                </div>

                {/* EXPIRY */}
                <div className="w-auto flex flex-col gap-2">
                    <Label>Expiry</Label>
                    <Input
                    type="date"
                    value={item.expiry}
                    onChange={(e) =>
                        handleInputChange(item.id, "expiry", e.target.value)
                    }
                    />
                </div>

                <div className="w-[120px] flex flex-col gap-2">
                    <Label>MRP</Label>
                    <Input
                    type="number"
                    value={item.mrp}
                    onChange={(e) =>
                        handleInputChange(item.id, "mrp", parseFloat(e.target.value) || 0)
                    }
                    />
                </div>

                <div className="w-[120px] flex flex-col gap-2">
                    <Label>Batch Amount</Label>
                    <Input
                    type="number"
                    value={item.batchAmount}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "batchAmount",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                <div className="w-[120px] flex flex-col gap-2">
                    <Label>Sale Price</Label>
                    <Input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "salePrice",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                <div className="w-[100px] flex flex-col gap-2">
                    <Label>Packing Qty</Label>
                    <Input
                    type="number"
                    value={item.packingQty}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "packingQty",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                <div className="w-[100px] flex flex-col gap-2">
                    <Label>Qty</Label>
                    <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "quantity",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                <div className="w-[120px] flex flex-col gap-2">
                    <Label>Purchase Price</Label>
                    <Input
                    type="number"
                    value={item.purchasePrice}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "purchasePrice",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                {/* TAX % */}
                <div className="w-[100px] flex flex-col gap-2">
                    <Label>Tax %</Label>
                    <Input
                    type="number"
                    value={item.taxPercent}
                    onChange={(e) =>
                        handleInputChange(
                        item.id,
                        "taxPercent",
                        parseFloat(e.target.value) || 0
                        )
                    }
                    />
                </div>

                {/* AMOUNT */}
                <div className="w-[150px] flex flex-col gap-2">
                    <Label>Amount</Label>
                    <Input value={item.amount} readOnly />
                </div>

                {/* REMOVE BUTTON */}
                <div className="flex items-end">
                    <Button variant="destructive" onClick={() => removeItem(item.id)}>
                    Remove
                    </Button>
                </div>
                </div>
            </Card>
            ))}



          <Button onClick={addNewItem}>+ Add Medicine</Button>

          {/* SUMMARY */}
          <div className="border p-4 rounded-lg flex flex-col gap-4 mt-6">
            <div className="flex flex-col gap-2 w-auto">
              <Label>Total</Label>
              <Input value={totalAmount.toFixed(2)} readOnly />
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col gap-2">
                <Label>Discount %</Label>
                <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
                </div>
                <div className="flex flex-col gap-2">
                <Label>Discount Amount</Label>
                <Input value={discountAmount.toFixed(2)} readOnly />
                </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tax Amount</Label>
              <Input value={taxAmount.toFixed(2)} readOnly />
            </div>
            <div className="md:col-span-2">
              <Label>Net Amount</Label>
              <Input value={netAmount.toFixed(2)} readOnly />
            </div>
          </div>

          {/* PAYMENT */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="w-[200px] flex flex-col gap-2">
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px] flex flex-col gap-2">
              <Label>Payment Amount</Label>
              <Input value={netAmount.toFixed(2)} readOnly />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label>Payment Note</Label>
              <Textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </div>

          <Button className="mt-4 w-auto" onClick={handleSavePurchase}>Save Purchase</Button>
        </CardContent>
      </Card>
    </div>
  );
}
