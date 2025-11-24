"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ChargeItem {
  id?: string;
  chargeTypeId: string;
  chargeCategoryId: string;
  unitId: string;
  name: string;
  taxCategoryId: string;
  amount: string;
  description: string;
  isDeleted?: boolean;
}

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

interface ChargeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChargeItem) => void;
  defaultData?: any | null;
  chargeTypes: Option[];
  chargeCategories: ChargeCategoryOption[];
  units: Option[];
  taxCategories: TaxOption[];
}

export function ChargeModal({
  open,
  onClose,
  onSubmit,
  defaultData,
  chargeTypes,
  chargeCategories,
  units,
  taxCategories,
}: ChargeModalProps) {
  const [chargeTypeId, setChargeTypeId] = useState("");
  const [chargeCategoryId, setChargeCategoryId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [name, setName] = useState("");
  const [taxCategoryId, setTaxCategoryId] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Load default data for edit
  useEffect(() => {
    if (defaultData) {
      setChargeTypeId(defaultData.chargeTypeId || "");
      setChargeCategoryId(defaultData.chargeCategoryId || "");
      setUnitId(defaultData.unitId || "");
      setName(defaultData.name);
      setTaxCategoryId(defaultData.taxCategoryId || "");
      setAmount(defaultData.amount);
      setDescription(defaultData.description);

      // Set tax percentage based on loaded taxCategoryId
      const tax = taxCategories.find(t => t.id === defaultData.taxCategoryId);
      setTaxPercentage(tax ? tax.percent : "");
    } else {
      setChargeTypeId("");
      setChargeCategoryId("");
      setUnitId("");
      setName("");
      setTaxCategoryId("");
      setTaxPercentage("");
      setAmount("");
      setDescription("");
    }
  }, [defaultData, taxCategories]);

  // When chargeType changes → reset category
  const handleChargeTypeChange = (value: string) => {
    setChargeTypeId(value);
    setChargeCategoryId(""); // Clear old category
  };

  const handleTaxCategoryChange = (value: string) => {
    setTaxCategoryId(value);
    const selected = taxCategories.find((t) => t.id === value);
    setTaxPercentage(selected ? selected.percent : "");
  };

  const handleSubmit = () => {
    if (!chargeTypeId || !chargeCategoryId || !unitId || !name || !amount || !taxCategoryId) {
      return toast.error("Please fill all required fields");
    }

    onSubmit({
      id: defaultData?.id,
      chargeTypeId,
      chargeCategoryId,
      unitId,
      name,
      taxCategoryId,
      amount,
      description,
    });

    onClose();
  };

  // Filter categories based on selected charge type
  const filteredCategories = chargeTypeId
    ? chargeCategories.filter(c => c.chargeTypeId === chargeTypeId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {defaultData ? "Edit Charge" : "Add Charge"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label>Charge Type <span className="text-red-500">*</span></Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={chargeTypeId}
                onChange={(e) => handleChargeTypeChange(e.target.value)}
              >
                <option value="">Select Type</option>
                {chargeTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Charge Category <span className="text-red-500">*</span></Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={chargeCategoryId}
                onChange={(e) => setChargeCategoryId(e.target.value)}
                disabled={!chargeTypeId}
              >
                <option value="">
                  {chargeTypeId ? "Select Category" : "Select Charge Type First"}
                </option>

                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Unit Type <span className="text-red-500">*</span></Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Charge Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter charge name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label>Tax Category <span className="text-red-500">*</span></Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={taxCategoryId}
                onChange={(e) => handleTaxCategoryChange(e.target.value)}
              >
                <option value="">Select Tax</option>
                {taxCategories.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Tax Percentage</Label>
              <Input readOnly value={taxPercentage ? `${taxPercentage}%` : ""} placeholder="0%" />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Standard Charge <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {defaultData ? "Update" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
