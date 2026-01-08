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
import { toast } from "sonner";
import { getSuppliers, getCategories, getMedicinesByCategory, createPharmacyPurchase } from "@/lib/actions/pharmacyPurchase";
import { useRouter } from "next/navigation";
import { MdDelete } from "react-icons/md";
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
  salePrice: number;
  quantity: number;
  purchasePrice: number;
  amount: number;
};

export default function PurchaseMedicineModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [medicineOptions, setMedicineOptions] = useState<Record<string, Medicine[]>>({});

  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [billNo, setBillNo] = useState("");

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [nextItemId, setNextItemId] = useState(1);

  const [discount, setDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>("Cash");
  const [paymentNote, setPaymentNote] = useState<string>("");


  useEffect(() => {
    const initData = async () => {
      const [suppliersRes, categoriesRes] = await Promise.all([
        getSuppliers(),
        getCategories(),
      ]);

      if (suppliersRes.error) toast.error(suppliersRes.error);
      else if (suppliersRes.data) setSuppliers(suppliersRes.data);

      if (categoriesRes.error) toast.error(categoriesRes.error);
      else if (categoriesRes.data) setCategories(categoriesRes.data);
    };

    initData();
  }, []);

  const handleCategoryChange = async (itemId: number, categoryId: string) => {
    setPurchaseItems((prev) =>
      prev.map((p) => (p.id === itemId ? { ...p, categoryId, medicineId: "" } : p))
    );

    if (!medicineOptions[categoryId]) {
      const res = await getMedicinesByCategory(categoryId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setMedicineOptions((prev) => ({ ...prev, [categoryId]: res.data! }));
      }
    }
  };

  const handleMedicineChange = (itemId: number, medicineId: string) => {
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

        const numeric = ["mrp", "quantity", "purchasePrice", "salePrice"];

        const updated: PurchaseItem = {
          ...p,
          [field]: numeric.includes(field) ? Number(value) || 0 : value,
        };


        const qty = Number(updated.quantity) || 0;
        const price = Number(updated.purchasePrice) || 0;

        updated.amount = qty * price;

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
        salePrice: 0,
        quantity: 0,
        purchasePrice: 0,
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

  const taxAmount = (afterDiscount * taxPercent) / 100;

  const netAmount = afterDiscount + taxAmount;

  const handleSavePurchase = async () => {
    if (!selectedSupplier || !billNo || purchaseItems.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    const payload = {
      supplierId: selectedSupplier,
      billNo,
      items: purchaseItems,
      summary: {
        totalAmount,
        discountPercent: discount,
        taxPercent,
        netAmount,
      },
    };
    const res = await createPharmacyPurchase(payload);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Purchase saved successfully");
      router.push("/doctor/pharmacy/purchase"); // Redirect to list page
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 mt-6">
      <BackButton />
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
                    disabled={!item.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {(medicineOptions[item.categoryId] || []).map((m) => (
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
                  <Label>Sale Price</Label>
                  <Input
                    type="number"
                    value={item.salePrice}
                    onChange={(e) =>
                      handleInputChange(item.id, "salePrice", parseFloat(e.target.value) || 0)
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



                {/* AMOUNT */}
                <div className="w-[150px] flex flex-col gap-2">
                  <Label>Amount</Label>
                  <Input value={item.amount} readOnly />
                </div>

                {/* REMOVE BUTTON */}
                <div className="flex items-end">
                  <Button variant="destructive" onClick={() => removeItem(item.id)}>
                    <MdDelete />
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
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-2">
                <Label>Tax %</Label>
                <Input
                  type="number"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Tax Amount</Label>
                <Input value={taxAmount.toFixed(2)} readOnly />
              </div>
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

          <Button className="mt-4 w-auto" onClick={handleSavePurchase} disabled={loading}>
            {loading ? "Saving..." : "Save Purchase"}
          </Button>
        </CardContent>
      </Card>
    </div >
  );
}
