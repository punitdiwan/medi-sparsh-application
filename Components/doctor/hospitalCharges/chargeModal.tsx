"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

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

  useEffect(() => {
    if (defaultData && open) {
      setChargeTypeId(defaultData.chargeTypeId || "");
      setChargeCategoryId(defaultData.chargeCategoryId || "");
      setUnitId(defaultData.unitId || "");
      setName(defaultData.name || "");
      setTaxCategoryId(defaultData.taxCategoryId || "");
      setAmount(defaultData.amount || "");
      setDescription(defaultData.description || "");

      const tax = taxCategories.find((t) => t.id === defaultData.taxCategoryId);
      setTaxPercentage(tax ? tax.percent : "");
    } else if (open) {
      setChargeTypeId("");
      setChargeCategoryId("");
      setUnitId("");
      setName("");
      setTaxCategoryId("");
      setTaxPercentage("");
      setAmount("");
      setDescription("");
    }
  }, [defaultData, taxCategories, open]);

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
    ? chargeCategories.filter((c) => c.chargeTypeId === chargeTypeId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border border-dialog bg-dialog-surface p-0 rounded-xl overflow-hidden shadow-lg">
        <DialogHeader className="px-6 py-4 bg-dialog-header text-header border-b border-dialog">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-lg ">
              <CreditCard className="bg-dialog-header text-dialog-icon" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle>{defaultData ? "Edit Charge" : "Add Charge"}</DialogTitle>
              <DialogDescription className="text-dialog-muted text-xs">
                {defaultData ? "Update existing hospital charge details." : "Add a new charge to the hospital system."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[65vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Charge Type *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={chargeTypeId}
                onChange={(e) => handleChargeTypeChange(e.target.value)}
              >
                <option value="">Select Type</option>
                {chargeTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Charge Category *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={chargeCategoryId}
                onChange={(e) => setChargeCategoryId(e.target.value)}
                disabled={!chargeTypeId}
              >
                <option value="">{chargeTypeId ? "Select Category" : "Select Charge Type First"}</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Unit Type *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Charge Name *</label>
              <Input
                placeholder="Enter charge name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm mb-1 block">Tax Category *</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={taxCategoryId}
                onChange={(e) => handleTaxCategoryChange(e.target.value)}
              >
                <option value="">Select Tax</option>
                {taxCategories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Tax Percentage</label>
              <Input readOnly value={taxPercentage ? `${taxPercentage}%` : ""} placeholder="0%" className="bg-muted" />
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Standard Charge *</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm mb-1 block">Description</label>
              <Textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-2 bg-dialog-header border-t border-dialog text-dialog-muted flex justify-between">
          <Button variant="outline" onClick={onClose} className="text-dialog-muted">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-dialog-primary text-dialog-btn hover:bg-btn-hover hover:opacity-90"
          >
            {defaultData ? "Update Charge" : "Add Charge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
