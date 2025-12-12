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

export type Medicine = {
  id: string;
  medicineCategory: string;
  medicineName: string;
  expiryDate: string;
  quantity: number;
  availableQuantity: number;
  amount: number;
};

export default function MedicineDialog({
  onSave,
  editMedicine,
  categories,
  medicines,
}: any) {
  const [open, setOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMedicineId, setSelectedMedicineId] = useState("");

  const [expiry, setExpiry] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);

  // Update amount when quantity changes
  useEffect(() => {
    setAmount(quantity * sellingPrice);
  }, [quantity, sellingPrice]);

  // Filter medicines by selected category
  const filteredMedicines = medicines.filter(
    (med: any) => med.categoryId === selectedCategory
  );

  // Load selected medicine details
  useEffect(() => {
    if (!selectedMedicineId) return;

    const med = medicines.find((m: any) => m.id === selectedMedicineId);
    if (med) {
      setExpiry(med.expiry);
      setAvailableQuantity(med.availableQuantity);
      setSellingPrice(med.sellingPrice);
      setQuantity(1); // default quantity to 1 when selected
    }
  }, [selectedMedicineId]);

  // Load values when editing
  useEffect(() => {
    if (editMedicine) {
      setSelectedCategory(editMedicine.categoryId);
      setSelectedMedicineId(editMedicine.medicineId);

      setExpiry(editMedicine.expiryDate);
      setQuantity(editMedicine.quantity);
      setAvailableQuantity(editMedicine.availableQuantity);
      setSellingPrice(editMedicine.sellingPrice);
      setAmount(editMedicine.amount);

      setOpen(true);
    }
  }, [editMedicine]);

  // Reset all fields
  const resetForm = () => {
    setSelectedCategory("");
    setSelectedMedicineId("");
    setExpiry("");
    setAvailableQuantity(0);
    setSellingPrice(0);
    setQuantity(0);
    setAmount(0);
  };

  const handleSubmit = () => {
    onSave({
      id: editMedicine ? editMedicine.id : crypto.randomUUID(),
      categoryId: selectedCategory,
      medicineId: selectedMedicineId,
      expiryDate: expiry,
      quantity,
      availableQuantity,
      sellingPrice,
      amount,
    });

    setOpen(false);

    // Reset form if adding new medicine (not editing)
    if (!editMedicine) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!editMedicine && (
        <DialogTrigger asChild>
          <Button>Add Medicine</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editMedicine ? "Edit Medicine" : "Add Medicine"}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <Label>Medicine Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val);
                setSelectedMedicineId("");
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

          {/* Medicine */}
          <div className="flex flex-col gap-1">
            <Label>Medicine Name</Label>
            <Select
              value={selectedMedicineId}
              onValueChange={(val) => setSelectedMedicineId(val)}
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

          {/* Expiry */}
          <div className="flex flex-col gap-1">
            <Label>Expiry Date</Label>
            <Input value={expiry} readOnly />
          </div>

          {/* Available Quantity */}
          <div className="flex flex-col gap-1">
            <Label>Available Quantity</Label>
            <Input value={availableQuantity} readOnly />
          </div>

          {/* Selling Price */}
          <div className="flex flex-col gap-1">
            <Label>Selling Price</Label>
            <Input value={sellingPrice} readOnly />
          </div>

          {/* Quantity */}
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

          {/* Amount */}
          <div className="flex flex-col gap-1">
            <Label>Amount</Label>
            <Input value={amount} readOnly />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
