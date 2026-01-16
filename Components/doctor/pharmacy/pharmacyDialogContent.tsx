"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPharmacyStock } from "@/lib/actions/pharmacyStock";
import { toast } from "sonner";
export type BatchAllocation = {
  batchNumber: string;
  qty: number;
  sellingPrice: number;
  expiryDate: string;
};

export type Medicine = {
  id: string;
  medicineId: string;
  categoryId: string;
  medicineName?: string;
  quantity: number;
  sellingPrice: number;
  amount: number;

  allocations: BatchAllocation[]; // ⭐ IMPORTANT
};


export default function MedicineDialog({
  onSave,
  editMedicine,
  setEditMedicine, // add this from parent
  categories,
  medicines,
}: any) {
  const [open, setOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [expiry, setExpiry] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);
  const [allocations, setAllocations] = useState<any[]>([]);

  // Update amount whenever quantity or price changes
  useEffect(() => {
    setAmount(quantity * sellingPrice);
  }, [quantity, sellingPrice]);

  // Load batches when selectedMedicineId changes
  useEffect(() => {
    if (!selectedMedicineId) {
      setBatches([]);
      return;
    }

    const fetchBatches = async () => {
      const res = await getPharmacyStock(selectedMedicineId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        const sortedBatches = res.data
          .filter((b: any) => b.quantity > 0) // sirf available batches
          .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()); // nearest expiry pehle

        setBatches(sortedBatches);

        if (sortedBatches.length > 0) {
          const firstBatch = sortedBatches[0];
          setSelectedBatch(firstBatch.batchNumber);
          setExpiry(firstBatch.expiryDate);
          setAvailableQuantity(Number(firstBatch.quantity));
          setSellingPrice(Number(firstBatch.sellingPrice));
          setQuantity(1);
        }
      }
    };

    fetchBatches();
  }, [selectedMedicineId]);


  useEffect(() => {
    if (quantity <= 0 || batches.length === 0) {
      setAmount(0);
      setAllocations([]);
      return;
    }

    const result = allocateBatchesFIFO(batches, quantity);

    if ("error" in result) {
      toast.error(result.error);
      setAmount(0);
      setAllocations([]);
      return;
    }

    // Find the maximum selling price among the allocated batches
    const maxPrice = Math.max(...result.allocations.map(a => a.sellingPrice));
    setSellingPrice(maxPrice);

    const updatedAllocations = result.allocations.map(a => ({
      ...a,
      sellingPrice: maxPrice
    }));

    setAllocations(updatedAllocations);

    const total = updatedAllocations.reduce(
      (sum, a) => sum + a.qty * a.sellingPrice,
      0
    );

    setAmount(total);
  }, [quantity, batches]);




  // Load values when editing
  useEffect(() => {
    if (editMedicine) {
      setSelectedCategory(editMedicine.categoryId);
      setSelectedMedicineId(editMedicine.medicineId);
      // We need to fetch batches first, then set selectedBatch
      // But for now, let's just set the values directly if possible, or trigger fetch
      // Since fetch depends on selectedMedicineId, it will run.
      // We might need a way to set selectedBatch after batches are loaded.
      // For simplicity, let's assume we just set the ID and let the user re-select batch if needed,
      // OR we can pass the batch info in editMedicine and set it.
      setSelectedBatch(editMedicine.batchNumber);
      setExpiry(editMedicine.expiryDate);
      setQuantity(editMedicine.quantity);
      setAvailableQuantity(editMedicine.availableQuantity);
      setSellingPrice(editMedicine.sellingPrice);
      setAmount(editMedicine.amount);
      setOpen(true);
    }
  }, [editMedicine]);

  // Reset all form fields
  const resetForm = () => {
    setSelectedCategory("");
    setSelectedMedicineId("");
    setSelectedBatch("");
    setBatches([]);
    setExpiry("");
    setAvailableQuantity(0);
    setSellingPrice(0);
    setQuantity(0);
    setAmount(0);
  };

  const handleAddClick = () => {
    resetForm();
    setEditMedicine(null); // now this works
    setOpen(true);
  };


  const handleSubmit = () => {
    const result = allocateBatchesFIFO(batches, quantity);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    // Find the maximum selling price among the allocated batches
    const maxPrice = Math.max(...result.allocations.map(a => a.sellingPrice));

    const updatedAllocations = result.allocations.map(a => ({
      ...a,
      sellingPrice: maxPrice
    }));

    const batchString = updatedAllocations
      .map(a => `${a.batchNumber}(${a.qty})`)
      .join(" + ");

    const expiryString = updatedAllocations
      .map(a => a.expiryDate)
      .join(" , ");

    const totalAmount = updatedAllocations.reduce(
      (sum, a) => sum + a.qty * a.sellingPrice,
      0
    );

    const payload = {
      id: editMedicine ? editMedicine.id : crypto.randomUUID(),
      categoryId: selectedCategory,
      medicineId: selectedMedicineId,
      medicineCategory: categories.find((c: any) => c.id === selectedCategory)?.name,
      medicineName: medicines.find((m: any) => m.id === selectedMedicineId)?.name,

      batchNumber: batchString,
      expiryDate: expiryString,
      quantity,
      availableQuantity: quantity,
      sellingPrice: maxPrice,
      unitPrice: maxPrice,
      amount: totalAmount,
      allocations: updatedAllocations,
    };

    console.log("🧪 Medicine Payload Preview:", payload);

    // STOP actual save for now
    onSave(payload);

    setOpen(false);
    resetForm();
  };


  const filteredMedicines = medicines.filter(
    (med: any) => med.categoryId === selectedCategory
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>Add Medicine</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl border border-dialog bg-dialog-surface p-0">
        <DialogHeader className="px-6 py-4 bg-dialog-header border-b border-dialog">
          <DialogTitle>
            {editMedicine ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label>Medicine Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setSelectedMedicineId("");
                setSelectedBatch("");
                setBatches([]);
                setExpiry("");
                setAvailableQuantity(0);
                setSellingPrice(0);
                setQuantity(0);
                setAmount(0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Medicine Name</Label>
            <Select
              value={selectedMedicineId}
              onValueChange={(val) => {
                setSelectedMedicineId(val);
                setSelectedBatch("");
                setExpiry("");
                setAvailableQuantity(0);
                setSellingPrice(0);
                setQuantity(0);
                setAmount(0);
              }}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Medicine" />
              </SelectTrigger>
              <SelectContent>
                {filteredMedicines.length === 0 && (
                  <SelectItem value="none" disabled>
                    No medicine found
                  </SelectItem>
                )}
                {filteredMedicines.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Batch Number</Label>
            <Select
              value={selectedBatch}
              onValueChange={(val) => setSelectedBatch(val)}
              disabled
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-selected Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch: any) => (
                  <SelectItem key={batch.batchNumber} value={batch.batchNumber}>
                    {batch.batchNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <div className="flex flex-col gap-1">
            <Label>Expiry Date</Label>
            <Input value={expiry} readOnly />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Available Quantity</Label>
            <Input value={availableQuantity} readOnly />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Selling Price</Label>
            <Input value={sellingPrice} readOnly />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              min={1}
              max={availableQuantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Amount</Label>
            <Input value={amount} readOnly />
          </div>
        </div>

        <div className="px-6 py-4 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-end gap-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function allocateBatchesFIFO(batches: any[], requiredQty: number) {
  let remaining = requiredQty;
  let allocations: {
    batchNumber: string;
    qty: number;
    sellingPrice: number;
    expiryDate: string;
  }[] = [];

  for (const batch of batches) {
    if (remaining <= 0) break;
    if (batch.quantity <= 0) continue;

    const usedQty = Math.min(batch.quantity, remaining);

    allocations.push({
      batchNumber: batch.batchNumber,
      qty: usedQty,
      sellingPrice: Number(batch.sellingPrice),
      expiryDate: batch.expiryDate,
    });

    remaining -= usedQty;
  }

  if (remaining > 0) {
    return { error: "Not enough stock available" };
  }

  return { allocations };
}
