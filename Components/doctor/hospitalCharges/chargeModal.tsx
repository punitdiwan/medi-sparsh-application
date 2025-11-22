"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface ChargeItem {
  isDeleted: any;
  id?: string;
  chargeType: string;
  category: string;
  unitType: string;
  name: string;
  taxCategory: string;
  taxPercentage: number;
  standardCharge: number;
  description: string;
}

interface ChargeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ChargeItem) => void;
  defaultData?: ChargeItem | null;
}

const CHARGE_TYPES = ["OPD", "IPD", "LAB", "Radiology", "Pharmacy"];
const UNIT_TYPES = ["Per Visit", "Per Day", "Per Test", "Per Unit"];

const CATEGORY_BY_TYPE: Record<string, string[]> = {
  OPD: ["Consultation", "Procedure"],
  IPD: ["Room", "Nursing", "Surgery"],
  LAB: ["Blood Test", "Urine Test", "Pathology"],
  Radiology: ["X-Ray", "CT Scan", "MRI"],
  Pharmacy: ["Tablet", "Syrup", "Injection"],
};

const TAX_CATEGORIES = [
  { name: "GST 18%", percentage: 18 },
  { name: "GST 12%", percentage: 12 },
  { name: "GST 5%", percentage: 5 },
  { name: "No Tax", percentage: 0 },
];

export function ChargeModal({
  open,
  onClose,
  onSubmit,
  defaultData,
}: ChargeModalProps) {
  const [chargeType, setChargeType] = useState("");
  const [category, setCategory] = useState("");
  const [unitType, setUnitType] = useState("");
  const [name, setName] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [standardCharge, setStandardCharge] = useState<number | string>("");
  const [description, setDescription] = useState("");

  // Load default data for edit
  useEffect(() => {
    if (defaultData) {
      setChargeType(defaultData.chargeType);
      setCategory(defaultData.category);
      setUnitType(defaultData.unitType);
      setName(defaultData.name);
      setTaxCategory(defaultData.taxCategory);
      setTaxPercentage(defaultData.taxPercentage);
      setStandardCharge(defaultData.standardCharge);
      setDescription(defaultData.description);
    } else {
      setChargeType("");
      setCategory("");
      setUnitType("");
      setName("");
      setTaxCategory("");
      setTaxPercentage(0);
      setStandardCharge("");
      setDescription("");
    }
  }, [defaultData]);

  // When chargeType changes → reset category
  const handleChargeTypeChange = (value: string) => {
    setChargeType(value);
    setCategory(""); // Clear old category
  };

  const handleTaxCategoryChange = (value: string) => {
    setTaxCategory(value);
    const selected = TAX_CATEGORIES.find((t) => t.name === value);
    setTaxPercentage(selected ? selected.percentage : 0);
  };

  const handleSubmit = () => {
    if (!chargeType || !category || !unitType || !name) {
      return alert("Please fill all required fields");
    }

    onSubmit({
      id: defaultData?.id,
      chargeType,
      category,
      unitType,
      name,
      taxCategory,
      taxPercentage,
      standardCharge: Number(standardCharge),
      description,
      isDeleted: undefined,
    });

    onClose();
  };

  const filteredCategories = chargeType ? CATEGORY_BY_TYPE[chargeType] : [];

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
              <Label>Charge Type *</Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={chargeType}
                onChange={(e) => handleChargeTypeChange(e.target.value)}
              >
                <option value="">Select Type</option>
                {CHARGE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Charge Category *</Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={!chargeType}
              >
                <option value="">
                  {chargeType ? "Select Category" : "Select Charge Type First"}
                </option>

                {filteredCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Unit Type *</Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
              >
                <option value="">Select Unit</option>
                {UNIT_TYPES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Charge Name *</Label>
              <Input
                placeholder="Enter charge name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label>Tax Category</Label>
              <select
                className="border p-2 rounded-md w-full bg-background"
                value={taxCategory}
                onChange={(e) => handleTaxCategoryChange(e.target.value)}
              >
                <option value="">Select Tax</option>
                {TAX_CATEGORIES.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Tax Percentage</Label>
              <Input readOnly value={taxPercentage + "%"} />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Standard Charge *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={standardCharge}
                onChange={(e) => setStandardCharge(e.target.value)}
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
